import { NextResponse } from 'next/server';
import { PaymentsBackendService } from '@/backend/services/dbService';

export async function GET() {
  try {
    const payments = await PaymentsBackendService.getAllPayments();
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPayment = await PaymentsBackendService.recordPayment(body);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
