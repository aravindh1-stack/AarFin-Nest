import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/config/supabaseAdmin';
import crypto from 'crypto';

export async function GET() {
  try {
    const { data: payments, error } = await supabaseAdmin.from('payments').select('*');
    if (error) throw error;
    return NextResponse.json(payments || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      batch_id,
      amount_paid,
      amount,
      payment_method = 'CASH',
      receipt_no,
      notes = 'Collections Hub FIFO Waterfall Entry',
      idempotency_key,
    } = body;

    const paymentAmount = Number(amount_paid != null ? amount_paid : amount || 0);

    if (!customer_id || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid customer_id and payment amount (> 0) are required' },
        { status: 400 }
      );
    }

    // 1. Idempotency Check
    const activeKey = idempotency_key || request.headers.get('x-idempotency-key');
    if (activeKey) {
      const { data: existingLogs } = await supabaseAdmin.from('admin_audit_logs').select('*');
      if (Array.isArray(existingLogs)) {
        const found = existingLogs.find(
          (log: any) =>
            log.action === 'PAYMENT_IDEMPOTENCY' &&
            log.details &&
            (typeof log.details === 'string' ? JSON.parse(log.details) : log.details).idempotency_key === activeKey
        );
        if (found) {
          const detail = typeof found.details === 'string' ? JSON.parse(found.details) : found.details;
          return NextResponse.json(detail.payment, { status: 200 });
        }
      }
    }

    // 2. Fetch Customer Details
    const { data: customers } = await supabaseAdmin.from('customers').select('*');
    const matchedCustomer = Array.isArray(customers)
      ? customers.find((c: any) => c.id === customer_id || c.customer_code === customer_id)
      : null;

    const resolvedCustomerId = matchedCustomer ? matchedCustomer.id : customer_id;
    const resolvedBatchId = batch_id || (matchedCustomer ? matchedCustomer.batch_id : null);

    const generatedReceiptNo =
      receipt_no ||
      `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Attempt PostgreSQL RPC FIFO Allocation (if available)
    let rpcExecuted = false;
    let rpcResult: any = null;

    try {
      // Find admin ID from DB
      const { data: admins } = await supabaseAdmin.from('admins').select('id');
      const adminId = (admins && admins[0]?.id) || '8e668d46-5c04-4a49-8795-d8c8fa71f40c';

      const rpcPayload = {
        p_customer_id: resolvedCustomerId,
        p_batch_id: resolvedBatchId,
        p_amount: paymentAmount,
        p_payment_method: payment_method,
        p_reference_no: generatedReceiptNo,
        p_notes: notes,
        p_admin_id: adminId,
      };

      const rpcRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/record_payment_with_fifo`,
        {
          method: 'POST',
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rpcPayload),
        }
      );

      if (rpcRes.ok) {
        rpcResult = await rpcRes.json();
        rpcExecuted = true;
      }
    } catch {
      // Fallback to direct ledger payment record
    }

    // 4. Record Payment in payments table if not already handled by RPC
    let paymentRecord: any = null;

    if (!rpcExecuted) {
      const paymentPayload = {
        customer_id: resolvedCustomerId,
        batch_id: resolvedBatchId,
        amount_paid: paymentAmount,
        payment_date: new Date().toISOString(),
        payment_method: payment_method,
        receipt_no: generatedReceiptNo,
        reference_no: generatedReceiptNo,
        notes: notes,
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('payments')
        .insert(paymentPayload);

      if (insertError) {
        console.error('Failed to insert payment record:', insertError);
        throw insertError;
      }

      paymentRecord = Array.isArray(insertData) ? insertData[0] : paymentPayload;

      // Waterfall installment allocation if installments exist for this customer
      try {
        const { data: installments } = await supabaseAdmin.from('installments').select('*');
        if (Array.isArray(installments) && installments.length > 0) {
          const customerInstallments = installments
            .filter((i: any) => i.customer_id === resolvedCustomerId && i.status !== 'PAID')
            .sort((a: any, b: any) => (a.installment_number || 0) - (b.installment_number || 0));

          let remainingCash = paymentAmount;
          for (const inst of customerInstallments) {
            if (remainingCash <= 0) break;
            const dueOnCycle = Number(inst.balance_amount || inst.amount || 0);
            const allocate = Math.min(remainingCash, dueOnCycle);
            const newPaid = Number(inst.paid_amount || 0) + allocate;
            const newBal = Math.max(0, dueOnCycle - allocate);
            const newStatus = newBal === 0 ? 'PAID' : 'PARTIAL';

            await supabaseAdmin
              .from('installments')
              .update({
                paid_amount: newPaid,
                balance_amount: newBal,
                status: newStatus,
                paid_date: new Date().toISOString(),
              })
              .eq('id', inst.id);

            remainingCash -= allocate;
          }
        }
      } catch (allocErr) {
        console.warn('Installment waterfall allocation error:', allocErr);
      }
    } else {
      paymentRecord = rpcResult || {
        customer_id: resolvedCustomerId,
        amount_paid: paymentAmount,
        receipt_no: generatedReceiptNo,
      };
    }

    // 5. Store Idempotency Record
    if (activeKey) {
      try {
        await supabaseAdmin.from('admin_audit_logs').insert({
          action: 'PAYMENT_IDEMPOTENCY',
          details: {
            idempotency_key: activeKey,
            payment: paymentRecord,
            recordedAt: new Date().toISOString(),
          },
        });
      } catch (auditErr) {
        console.warn('Failed to store idempotency log:', auditErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        payment: paymentRecord,
        receiptNo: generatedReceiptNo,
        allocatedAmount: paymentAmount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing waterfall payment:', error);
    return NextResponse.json({ error: error.message || 'Payment processing failed' }, { status: 500 });
  }
}
