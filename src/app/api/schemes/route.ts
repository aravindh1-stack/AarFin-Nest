import { NextResponse } from 'next/server';
import { BatchesBackendService } from '@/backend/services/dbService';
import { assertNotViewer } from '@/lib/auth/api-guard';

export async function GET() {
  try {
    const batches = await BatchesBackendService.getAllBatches();
    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Enforce read-only locks for VIEWER
  const forbidden = assertNotViewer(request);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const newScheme = await BatchesBackendService.createBatch(body);
    return NextResponse.json(newScheme, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
