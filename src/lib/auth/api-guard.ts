import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeRole, SessionUser } from "./rbac";

/**
 * Extracts session user from an incoming API request.
 * Handles NextRequest (request.cookies), web Request (Cookie header), or parsed cookies.
 */
export function getSessionUser(request: Request | NextRequest): SessionUser | null {
  try {
    // 1. NextRequest cookies
    if ("cookies" in request && typeof (request as any).cookies?.get === "function") {
      const val = (request as any).cookies.get("nexfix_session")?.value;
      if (val) {
        const parsed = JSON.parse(val);
        return {
          ...parsed,
          role: normalizeRole(parsed.role, parsed.email),
        };
      }
    }

    // 2. Raw Cookie header
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)nexfix_session=([^;]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        return {
          ...parsed,
          role: normalizeRole(parsed.role, parsed.email),
        };
      }
    }
  } catch (err) {
    console.error("Error reading session user in API guard:", err);
  }

  return null;
}

/**
 * Enforces that the session user is NOT a VIEWER ("Auditor / Read-Only").
 * If the role is VIEWER, returns HTTP 403:
 * { error: "FORBIDDEN", message: "Auditor accounts have read-only permissions." }
 */
export function assertNotViewer(request: Request | NextRequest): NextResponse | null {
  const user = getSessionUser(request);
  if (user && user.role === "VIEWER") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Auditor accounts have read-only permissions." },
      { status: 403 }
    );
  }
  return null;
}
