import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/config/supabaseAdmin';
import { requirePermission, getSessionUser } from '@/lib/auth/api-guard';

export async function POST(request: Request) {
  // Enforce role permissions: SUPER_ADMIN & ADMIN allowed; EDITOR & VIEWER denied
  const forbidden = requirePermission(request, 'canReconcileCash');
  if (forbidden) return forbidden;

  try {
    const body = await request.json().catch(() => ({}));
    const user = getSessionUser(request);

    const {
      route_id = "route-01",
      cashier_notes = "",
      session_stamp = `EOD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      counted_cash = 0,
    } = body;

    // Log the EOD signoff and day ledger lock into audit ledger
    await supabaseAdmin.from('admin_audit_logs').insert([
      {
        admin_email: user?.email || "system@nexfix.io",
        action: "EOD_LEDGER_LOCK",
        details: JSON.stringify({
          route_id,
          session_stamp,
          cashier_notes,
          counted_cash,
          locked_at: new Date().toISOString(),
          locked_by_role: user?.role || "ADMIN",
        }),
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "End-of-Day ledger locked and signed off successfully.",
      sessionStamp: session_stamp,
      lockedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
