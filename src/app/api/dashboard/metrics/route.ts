import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";

export async function GET() {
  try {
    const [batchesRes, customersRes, groupsRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from("batches").select("*"),
      supabaseAdmin.from("customers").select("*"),
      supabaseAdmin.from("groups").select("*"),
      supabaseAdmin.from("payments").select("*"),
    ]);

    const batches = Array.isArray(batchesRes.data) ? batchesRes.data : [];
    const customers = Array.isArray(customersRes.data) ? customersRes.data : [];
    const groups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
    const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

    // 1. Active Schemes count (batches with status ACTIVE or all batches if status not set)
    const activeSchemes = batches.filter(
      (b: any) => !b.status || b.status === "ACTIVE"
    ).length;

    // 2. Registered Members count (customers with status ACTIVE or all)
    const registeredMembers = customers.filter(
      (c: any) => !c.status || c.status === "ACTIVE"
    ).length;

    // 3. Operating Routes count (groups / route beats)
    const operatingRoutes = groups.length;

    // 4. Realized Collections sum (excluding voided)
    // Supports amount_paid, amount_paid_paise (converts to rupees if paise), or amount
    let totalRealizedRupees = 0;
    payments.forEach((p: any) => {
      if (p.status === "VOIDED" || p.status === "CANCELLED") return;

      if (p.amount_paid_paise != null) {
        totalRealizedRupees += Number(p.amount_paid_paise) / 100;
      } else if (p.amount_paid != null) {
        totalRealizedRupees += Number(p.amount_paid);
      } else if (p.amount != null) {
        totalRealizedRupees += Number(p.amount);
      }
    });

    // 5. Recent Collections (Latest 5 to 10 payments joined with member, scheme, and route)
    const customerMap = new Map<string, any>();
    customers.forEach((c: any) => customerMap.set(c.id, c));

    const batchMap = new Map<string, any>();
    batches.forEach((b: any) => batchMap.set(b.id, b));

    const groupMap = new Map<string, any>();
    groups.forEach((g: any) => groupMap.set(g.id, g));

    const sortedPayments = [...payments].sort((a: any, b: any) => {
      const dateA = new Date(a.payment_date || a.created_at || 0).getTime();
      const dateB = new Date(b.payment_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const recentCollections = sortedPayments.slice(0, 10).map((p: any) => {
      const customer = customerMap.get(p.customer_id) || {};
      const batch = batchMap.get(p.batch_id || customer.batch_id) || {};
      const group = groupMap.get(customer.group_id) || {};

      const amountVal = p.amount_paid_paise != null
        ? Number(p.amount_paid_paise) / 100
        : Number(p.amount_paid || p.amount || 0);

      return {
        id: p.id,
        receiptNo: p.receipt_no || `REC-${p.id.slice(0, 8)}`,
        memberName: customer.full_name || p.member_name || "Member",
        customerCode: customer.customer_code || "MNF-00",
        schemeName: batch.batch_name || customer.batch_name || "Palagara Seetu",
        routeCode: group.group_code || group.route_name || customer.group_name || "TVAN GOLD",
        amount: amountVal,
        amountFormatted: `₹${amountVal.toLocaleString("en-IN")}`,
        paymentDate: p.payment_date || p.created_at,
        paymentMethod: p.payment_method || "CASH",
        status: p.status || "PAID",
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        activeSchemes,
        registeredMembers,
        operatingRoutes,
        realizedCollections: totalRealizedRupees,
        realizedCollectionsFormatted: `₹${totalRealizedRupees.toLocaleString("en-IN")}`,
      },
      recentCollections,
    });
  } catch (err: any) {
    console.error("Dashboard metrics aggregation error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
