import { NextResponse } from 'next/server';
import { CustomersBackendService } from '@/backend/services/dbService';

export async function GET() {
  try {
    const customers = await CustomersBackendService.getAllCustomers();
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCustomer = await CustomersBackendService.createCustomer(body);
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const updatedCustomer = await CustomersBackendService.updateCustomer(id, updateData);
    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
