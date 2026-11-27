import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";
import { storeAuthToken } from "@/lib/auth/tokens";
import { sendTransactionalEmail, buildPasswordResetEmailHtml } from "@/lib/auth/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[FORGOT_PASSWORD]: Processing reset request for: ${normalizedEmail}`);

    // Verify user exists in Supabase admins table
    const { data: admins, error: adminQueryError } = await supabaseAdmin.from("admins").select("*");

    if (adminQueryError) {
      console.error("❌ [FORGOT_PASSWORD DB ERROR]: Error querying admins table:", adminQueryError);
    }

    const matchedAdmin = Array.isArray(admins)
      ? admins.find((a: any) => a.email && a.email.toLowerCase().trim() === normalizedEmail)
      : null;

    if (!matchedAdmin) {
      console.warn(`⚠️ [FORGOT_PASSWORD]: Account not found for email: ${normalizedEmail}. Returning generic security response.`);
      // Return success to avoid user enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, password reset instructions have been sent.",
      });
    }

    console.log(`[FORGOT_PASSWORD]: Matched admin account: ${matchedAdmin.full_name} (${matchedAdmin.email})`);

    // Generate password reset token
    const token = await storeAuthToken(normalizedEmail, "PASSWORD_RESET", 60);

    // Host & origin detection
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    const resetUrl = `${origin}/reset-password?token=${token}`;

    const emailDispatch = await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Reset your password - NexFix Financial OS",
      html: buildPasswordResetEmailHtml(matchedAdmin.full_name || "Colleague", resetUrl),
      text: `Reset your NexFix password by clicking this link: ${resetUrl}`,
    });

    console.log(`[FORGOT_PASSWORD]: Dispatch status: ${emailDispatch.success ? "SUCCESS" : "FAILED"}, Message ID: ${emailDispatch.id}`);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions have been sent.",
    });
  } catch (err: any) {
    console.error("❌ [FORGOT_PASSWORD EXCEPTION]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
