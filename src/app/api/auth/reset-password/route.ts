import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";
import { verifyAuthToken, consumeAuthToken } from "@/lib/auth/tokens";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify token
    const tokenResult = await verifyAuthToken(token, "PASSWORD_RESET");

    if (!tokenResult.valid || !tokenResult.email) {
      return NextResponse.json(
        { success: false, message: tokenResult.error || "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const email = tokenResult.email;

    // Update password in Supabase admins table
    const { error: updateError } = await supabaseAdmin
      .from("admins")
      .update({
        password: newPassword,
        password_hash: newPassword,
      })
      .eq("email", email);

    if (updateError) {
      console.error("Failed to update password in database:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update password in database" },
        { status: 500 }
      );
    }

    // Invalidate the token
    await consumeAuthToken(token, "PASSWORD_RESET");

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
