import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";
import { storeAuthToken } from "@/lib/auth/tokens";
import { sendTransactionalEmail, buildVerificationEmailHtml } from "@/lib/auth/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[RESEND_VERIFICATION]: Initiating verification dispatch for: ${normalizedEmail}`);

    // Verify user exists in organization allowlist (admins table)
    const { data: admins, error: adminErr } = await supabaseAdmin.from("admins").select("*");
    if (adminErr) {
      console.error("❌ [RESEND_VERIFICATION DB ERROR]: Failed to query admins table:", adminErr);
    }

    const matchedAdmin = Array.isArray(admins)
      ? admins.find((a: any) => a.email && a.email.toLowerCase().trim() === normalizedEmail)
      : null;

    if (!matchedAdmin) {
      console.warn(
        `⚠️ [RESEND_VERIFICATION]: ${normalizedEmail} is not registered in the organization allowlist.`
      );
      return NextResponse.json(
        {
          success: false,
          notEnrolled: true,
          message: `The email address ${normalizedEmail} is not enrolled in the tenant roster. Please ask your administrator to add your account first.`,
        },
        { status: 404 }
      );
    }

    // Generate token
    const token = await storeAuthToken(normalizedEmail, "EMAIL_VERIFICATION", 60);

    // Host & origin detection
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`;

    const dispatchResult = await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Verify your email - NexFix Financial OS",
      html: buildVerificationEmailHtml(matchedAdmin.full_name || "Colleague", verifyUrl),
      text: `Verify your NexFix account by clicking this link: ${verifyUrl}`,
    });

    if (!dispatchResult.success) {
      console.error(`❌ [RESEND_VERIFICATION FAILED]: Dispatch error for ${normalizedEmail}`);
      return NextResponse.json(
        {
          success: false,
          message: dispatchResult.error || "Failed to deliver email through transactional mail provider.",
        },
        { status: 502 }
      );
    }

    console.log(`✅ [RESEND_VERIFICATION DISPATCHED]: Verification link sent to ${normalizedEmail} (ID: ${dispatchResult.id})`);

    return NextResponse.json({
      success: true,
      message: `Verification email sent successfully to ${normalizedEmail}. Please check your inbox or spam folder.`,
    });
  } catch (err: any) {
    console.error("❌ [RESEND_VERIFICATION EXCEPTION]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to dispatch verification email." },
      { status: 500 }
    );
  }
}
