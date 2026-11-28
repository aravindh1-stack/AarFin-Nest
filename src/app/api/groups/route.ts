import { NextResponse } from 'next/server';
import { GroupsBackendService } from '@/backend/services/dbService';
import { requirePermission } from '@/lib/auth/api-guard';

export async function GET() {
  try {
    const groups = await GroupsBackendService.getAllGroups();
    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Enforce role permissions: SUPER_ADMIN & ADMIN allowed; EDITOR & VIEWER denied
  const forbidden = requirePermission(request, 'canManageRoutes');
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const newGroup = await GroupsBackendService.createGroup(body);
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Enforce role permissions: SUPER_ADMIN & ADMIN allowed; EDITOR & VIEWER denied
  const forbidden = requirePermission(request, 'canManageRoutes');
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const updatedGroup = await GroupsBackendService.updateGroup(id, updateData);
    return NextResponse.json(updatedGroup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
