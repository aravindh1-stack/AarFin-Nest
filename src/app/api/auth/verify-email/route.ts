import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken, consumeAuthToken, markEmailAsVerified } from "@/lib/auth/tokens";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=INVALID_TOKEN&message=${encodeURIComponent("Verification link is missing a token.")}`);
  }

  const result = await verifyAuthToken(token, "EMAIL_VERIFICATION");

  if (!result.valid || !result.email) {
    return NextResponse.redirect(
      `${origin}/login?error=INVALID_TOKEN&message=${encodeURIComponent(result.error || "Verification link is invalid or has expired.")}`
    );
  }

  // Mark as verified & consume token
  await markEmailAsVerified(result.email);
  await consumeAuthToken(token, "EMAIL_VERIFICATION");

  return NextResponse.redirect(
    `${origin}/login?verified=true&email=${encodeURIComponent(result.email)}`
  );
}
