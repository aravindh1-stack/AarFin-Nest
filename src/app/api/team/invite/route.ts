import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { assertNotViewer } from "@/lib/auth/api-guard";
import { POST as teamPost } from "../route";

export async function POST(request: NextRequest) {
  // Enforce read-only locks for VIEWER
  const forbidden = assertNotViewer(request);
  if (forbidden) return forbidden;

  return teamPost(request);
}
