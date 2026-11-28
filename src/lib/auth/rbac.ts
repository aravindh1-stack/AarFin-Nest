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
  canManageRoutes: boolean;
  canManageBranches: boolean;
  canManageBilling: boolean;
  canReconcileCash: boolean;
  canViewReports: boolean;
  canViewAudit: boolean;
  canRecordPayments: boolean;
  canVoidPayments: boolean;
}> = {
  SUPER_ADMIN: {
    allowedPrefixes: ["/dashboard"],
    canManageTeam: true,
    canManageSchemes: true,
    canManageRoutes: true,
    canManageBranches: true,
    canManageBilling: true,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: true,
    canRecordPayments: true,
    canVoidPayments: true,
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
    canManageRoutes: true,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: true,
    canViewReports: true,
    canViewAudit: true,
    canRecordPayments: true,
    canVoidPayments: true,
  },
  EDITOR: {
    allowedPrefixes: [
      "/dashboard/collections",
      "/dashboard/routes",
      "/dashboard/customers",
    ],
    canManageTeam: false,
    canManageSchemes: false,
    canManageRoutes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: false,
    canViewReports: false,
    canViewAudit: false,
    canRecordPayments: true,
    canVoidPayments: false,
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
    canManageRoutes: false,
    canManageBranches: false,
    canManageBilling: false,
    canReconcileCash: false,
    canViewReports: false,
    canViewAudit: false,
    canRecordPayments: false, // Read-only
    canVoidPayments: false,
  },
};

export type RolePermissionKey = keyof typeof ROLE_PERMISSIONS['SUPER_ADMIN'];

/**
 * Checks whether a role has a given permission
 */
export function hasPermission(role: UserRole, permission: RolePermissionKey): boolean {
  if (role === "SUPER_ADMIN") return true;
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

/**
 * Returns contextual tooltip message when an action is disabled for a role
 */
export function getActionRestrictionTooltip(
  role: UserRole,
  action: "manage_schemes" | "manage_routes" | "reconcile_cash" | "record_payment" | "void_payment" | "manage_team"
): string | null {
  if (role === "SUPER_ADMIN") return null;

  if (role === "VIEWER") {
    return "Read-only access: Mutations restricted";
  }

  if (role === "EDITOR") {
    switch (action) {
      case "manage_schemes":
        return "Field Desk accounts cannot create or modify schemes (Operations Lead required)";
      case "manage_routes":
        return "Field Desk accounts cannot configure route beats (Operations Lead required)";
      case "reconcile_cash":
        return "Cashier / Operations Lead authorization required for EOD reconciliation";
      case "void_payment":
        return "Supervisor / Admin authorization required to void transactions";
      case "manage_team":
        return "Only Root Owner can invite or manage staff members";
      default:
        return null;
    }
  }

  if (role === "ADMIN") {
    if (action === "manage_team") {
      return "Operations Leads have read-only staff access (Root Owner required to invite or modify)";
    }
  }

  return null;
}

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
