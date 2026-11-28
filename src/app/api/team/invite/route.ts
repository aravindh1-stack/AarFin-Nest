import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/api-guard";
import { POST as teamPost } from "../route";

export async function POST(request: NextRequest) {
  // Enforce role permissions: SUPER_ADMIN allowed; ADMIN, EDITOR, VIEWER denied
  const forbidden = requirePermission(request, "canManageTeam");
  if (forbidden) return forbidden;

  return teamPost(request);
}
