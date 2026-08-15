import { NextResponse } from 'next/server';
import { BatchesBackendService } from '@/backend/services/dbService';

export async function GET() {
  try {
    const batches = await BatchesBackendService.getAllBatches();
    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBatch = await BatchesBackendService.createBatch(body);
    return NextResponse.json(newBatch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
