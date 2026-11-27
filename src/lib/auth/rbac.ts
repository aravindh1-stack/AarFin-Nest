export type UserRole = "ADMIN" | "BRANCH_MANAGER" | "CASHIER" | "FIELD_OFFICER";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  provider?: "google" | "credentials";
}

/**
 * Normalizes DB role string to standard UserRole
 */
export function normalizeRole(rawRole?: string | null): UserRole {
  if (!rawRole) return "FIELD_OFFICER";
  const upper = rawRole.toUpperCase().trim();
  if (upper === "SUPER_ADMIN" || upper === "ADMIN" || upper === "OWNER") {
    return "ADMIN";
  }
  if (upper === "BRANCH_MANAGER" || upper === "MANAGER") {
    return "BRANCH_MANAGER";
  }
  if (upper === "CASHIER" || upper === "ACCOUNTANT") {
    return "CASHIER";
  }
  return "FIELD_OFFICER";
}

/**
 * Permissions mapping for route access control
 */
export const ROLE_PERMISSIONS: Record<UserRole, {
  allowedPrefixes: string[];
  canManageSchemes: boolean;
  canManageBranches: boolean;
  canManageBilling: boolean;
  canReconcileCash: boolean;
  canViewReports: boolean;
  canViewAudit: boolean;
}> = {
  ADMIN: {
    allowedPrefixes: ["/dashboard"],
    canManageSchemes: true,
    canManageBranches: true,
    canManageBilling: true,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: true,
  },
  BRANCH_MANAGER: {
    allowedPrefixes: [
      "/dashboard",
      "/dashboard/collections",
      "/dashboard/customers",
      "/dashboard/schemes",
      "/dashboard/routes",
      "/dashboard/reconciliation",
      "/dashboard/reports",
    ],
    canManageSchemes: true,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: false,
  },
  CASHIER: {
    allowedPrefixes: [
      "/dashboard",
      "/dashboard/collections",
      "/dashboard/customers",
      "/dashboard/reconciliation",
    ],
    canManageSchemes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: true,
    canViewReports: false,
    canViewAudit: false,
  },
  FIELD_OFFICER: {
    allowedPrefixes: [
      "/dashboard/collections",
      "/dashboard/routes",
      "/dashboard/customers",
    ],
    canManageSchemes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: false,
    canViewReports: false,
    canViewAudit: false,
  },
};

/**
 * Checks whether a given role can access a pathname
 */
export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  if (role === "ADMIN") return true;

  // Exact or prefix match
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // FIELD_OFFICER cannot access root /dashboard directly (redirect to /dashboard/collections)
  if (role === "FIELD_OFFICER" && pathname === "/dashboard") {
    return false;
  }

  return perms.allowedPrefixes.some((prefix) => {
    if (prefix === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });
}
