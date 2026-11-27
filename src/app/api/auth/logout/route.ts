import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const response = NextResponse.redirect(`${origin}/login`);

  // Clear all session cookies
  response.cookies.set("aarfin_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("nexfix_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("nexfix_pending", "", { path: "/", maxAge: 0 });

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
