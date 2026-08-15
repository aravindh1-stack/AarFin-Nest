import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/config/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('admin_audit_logs').select('*');
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
