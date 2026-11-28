import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeRole, SessionUser, UserRole, hasPermission, RolePermissionKey } from "./rbac";

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

/**
 * Enforces granular role-based permissions across API endpoints for all roles:
 * - SUPER_ADMIN: Granted all permissions.
 * - ADMIN: Granted operations permissions (schemes, routes, reconciliation, payments, etc.).
 *   Denied team mutations (Root Owner only).
 * - EDITOR: Granted payment recording.
 *   Denied schemes, routes, reconciliation, team mutations.
 * - VIEWER: Denied all mutations with 403.
 */
export function requirePermission(
  request: Request | NextRequest,
  permission: RolePermissionKey,
  customMessage?: string
): NextResponse | null {
  const user = getSessionUser(request);

  // If VIEWER, always return the explicit Auditor read-only rejection
  if (user && user.role === "VIEWER") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Auditor accounts have read-only permissions." },
      { status: 403 }
    );
  }

  // If user is logged in with another role, check permission
  if (user && !hasPermission(user.role, permission)) {
    const defaultMessages: Record<RolePermissionKey, string> = {
      canManageTeam: "Exclusive rights to invite and manage staff belong to the Owner / Root Admin.",
      canManageSchemes: "Operations Lead or Owner permission required to create or configure schemes.",
      canManageRoutes: "Operations Lead or Owner permission required to configure route beats.",
      canReconcileCash: "Cashier or Operations Lead permission required for EOD reconciliation.",
      canRecordPayments: "Permission required to record collections.",
      canVoidPayments: "Supervisor / Admin authorization required to void transactions.",
      canManageBilling: "Owner privileges required to manage billing.",
      canManageBranches: "Owner privileges required to manage branches.",
      allowedPrefixes: "Restricted route access.",
      canViewReports: "Permission required to view financial reports.",
      canViewAudit: "Permission required to view audit logs.",
    };

    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: customMessage || defaultMessages[permission] || "Access restricted for this role.",
        role: user.role,
      },
      { status: 403 }
    );
  }

  return null;
}
