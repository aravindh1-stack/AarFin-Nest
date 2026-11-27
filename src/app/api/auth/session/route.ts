import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SessionUser, normalizeRole } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("nexfix_session")?.value;
  const legacySession = request.cookies.get("aarfin_session")?.value;

  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie) as SessionUser;
      return NextResponse.json({
        authenticated: true,
        user: {
          ...user,
          role: normalizeRole(user.role),
        },
      });
    } catch {
      // Continue to fallback
    }
  }

  // Fallback for legacy email/password login where only aarfin_session is set
  if (legacySession === "authenticated") {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: "default-admin",
        email: "aravindh@aarga.org",
        name: "Aravindh Murugesan",
        role: "ADMIN",
        provider: "credentials",
      },
    });
  }

  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}
