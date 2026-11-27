export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";

export const PRIMARY_OWNER_EMAIL = "aravindhofficiallinks@gmail.com";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  provider?: "google" | "credentials";
}

export const ROLE_DISPLAY: Record<UserRole, { title: string; badge: string; description: string }> = {
  SUPER_ADMIN: {
    title: "Owner / Root Admin",
    badge: "ROOT OWNER",
    description: "Exclusive rights to manage staff, assign roles, and control organization settings.",
  },
  ADMIN: {
    title: "Operations Lead",
    badge: "OPERATIONS",
    description: "Full access to schemes, batches, routes, reports, and EOD reconciliation. Read-only staff view.",
  },
  EDITOR: {
    title: "Field Desk",
    badge: "FIELD DESK",
    description: "Restricted strictly to collections hub, route beats, and recording member payments.",
  },
  VIEWER: {
    title: "Auditor / Read-Only",
    badge: "AUDITOR",
    description: "Read-only ledger audit access across metrics and schemes. Mutations strictly disabled.",
  },
};

/**
 * Normalizes DB role string to standard UserRole.
 * Hardcodes primary ownership for aravindhofficiallinks@gmail.com.
 */
export function normalizeRole(rawRole?: string | null, email?: string | null): UserRole {
  if (email && email.toLowerCase().trim() === PRIMARY_OWNER_EMAIL) {
    return "SUPER_ADMIN";
  }

  if (!rawRole) return "VIEWER";
  const upper = rawRole.toUpperCase().trim();

  if (upper === "SUPER_ADMIN" || upper === "OWNER" || upper === "ROOT") {
    return "SUPER_ADMIN";
  }
  if (upper === "ADMIN" || upper === "BRANCH_MANAGER" || upper === "OPERATIONS_LEAD") {
    return "ADMIN";
  }
  if (upper === "EDITOR" || upper === "FIELD_OFFICER" || upper === "CASHIER" || upper === "FIELD_DESK") {
    return "EDITOR";
  }
  return "VIEWER";
}

/**
 * Permissions mapping for route access control
 */
export const ROLE_PERMISSIONS: Record<UserRole, {
  allowedPrefixes: string[];
  canManageTeam: boolean;
  canManageSchemes: boolean;
  canManageBranches: boolean;
  canManageBilling: boolean;
  canReconcileCash: boolean;
  canViewReports: boolean;
  canViewAudit: boolean;
  canRecordPayments: boolean;
}> = {
  SUPER_ADMIN: {
    allowedPrefixes: ["/dashboard"],
    canManageTeam: true,
    canManageSchemes: true,
    canManageBranches: true,
    canManageBilling: true,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: true,
    canRecordPayments: true,
  },
  ADMIN: {
    allowedPrefixes: [
      "/dashboard",
      "/dashboard/collections",
      "/dashboard/customers",
      "/dashboard/schemes",
      "/dashboard/routes",
      "/dashboard/reconciliation",
      "/dashboard/reports",
      "/dashboard/team",
    ],
    canManageTeam: false, // Read-only team visibility
    canManageSchemes: true,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: true,
    canRecordPayments: true,
  },
  EDITOR: {
    allowedPrefixes: [
      "/dashboard/collections",
      "/dashboard/routes",
      "/dashboard/customers",
    ],
    canManageTeam: false,
    canManageSchemes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: false,
    canViewReports: false,
    canViewAudit: false,
    canRecordPayments: true,
  },
  VIEWER: {
    allowedPrefixes: [
      "/dashboard",
      "/dashboard/collections",
      "/dashboard/customers",
      "/dashboard/schemes",
      "/dashboard/routes",
    ],
    canManageTeam: false,
    canManageSchemes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: false,
    canViewReports: false,
    canViewAudit: false,
    canRecordPayments: false, // Read-only
  },
};

/**
 * Checks whether a given role can access a pathname
 */
export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  if (role === "SUPER_ADMIN") return true;

  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // EDITOR cannot access root /dashboard directly (routes to /dashboard/collections)
  if (role === "EDITOR" && pathname === "/dashboard") {
    return false;
  }

  return perms.allowedPrefixes.some((prefix) => {
    if (prefix === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });
}
