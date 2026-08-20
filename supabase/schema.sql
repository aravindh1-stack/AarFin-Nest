-- AarFin Master Database Schema & DDL
-- Enterprise Financial Command Center (Seetu, Vaara Kandhu, Dhina Kandhu)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BATCHES TABLE (Scheme Batches: Palagara Seetu, Vaara Kandhu, Dhina Kandhu)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code TEXT UNIQUE NOT NULL,
    batch_name TEXT NOT NULL,
    scheme_type TEXT NOT NULL CHECK (scheme_type IN ('PALAGARA_SEETU', 'VAARA_KANDHU', 'DHINA_KANDHU')),
    total_cycles INT NOT NULL,
    installment_amount DECIMAL(12,2) NOT NULL,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    renewal_day TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GROUPS TABLE (Route / Geographical area grouping)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    route_name TEXT NOT NULL,
    collection_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    id_proof_number TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEFAULTED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENROLLMENTS TABLE (Link Customer -> Batch with Late-Joiner Policy)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    late_joiner_policy TEXT DEFAULT 'START_FROM_JOIN_DATE' CHECK (late_joiner_policy IN ('CARRY_PREVIOUS_PENDING', 'START_FROM_JOIN_DATE')),
    total_committed_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, batch_id)
);

-- 6. INSTALLMENTS TABLE (Core Ledger Table)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    balance_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'SKIPPED', 'UPCOMING')),
    paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAYMENTS TABLE (Receipt Generator & Audit Log)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE')),
    reference_no TEXT,
    collected_by UUID REFERENCES public.admins(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.admins(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_installments_cust_batch ON public.installments(customer_id, batch_id, due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.installments(status);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_no);
CREATE INDEX IF NOT EXISTS idx_enrollments_cust ON public.enrollments(customer_id);

-- RPC FUNCTION: RECORD PAYMENT WITH FIFO ALLOCATION ENGINE
CREATE OR REPLACE FUNCTION public.record_payment_with_fifo(
    p_customer_id UUID,
    p_batch_id UUID,
    p_amount DECIMAL,
    p_payment_method TEXT DEFAULT 'CASH',
    p_reference_no TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enrollment_id UUID;
    v_receipt_no TEXT;
    v_remaining_amount DECIMAL(12,2);
    v_rec RECORD;
    v_alloc_amount DECIMAL(12,2);
    v_new_paid DECIMAL(12,2);
    v_new_bal DECIMAL(12,2);
    v_new_status TEXT;
    v_total_applied DECIMAL(12,2) := 0;
BEGIN
    -- 1. Locate Enrollment
    SELECT id INTO v_enrollment_id 
    FROM public.enrollments 
    WHERE customer_id = p_customer_id AND batch_id = p_batch_id AND status = 'ACTIVE'
    LIMIT 1;

    IF v_enrollment_id IS NULL THEN
        RAISE EXCEPTION 'Active enrollment not found for customer % in batch %', p_customer_id, p_batch_id;
    END IF;

    -- 2. Generate Receipt Number (REC-YYYYMMDD-XXXX)
    v_receipt_no := 'REC-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD((FLOOR(RANDOM() * 8999) + 1000)::TEXT, 4, '0');
    v_remaining_amount := p_amount;

    -- 3. Loop through Installments in FIFO Order (Ascending Due Date / Number)
    FOR v_rec IN (
        SELECT id, amount, paid_amount, balance_amount, status
        FROM public.installments
        WHERE customer_id = p_customer_id 
          AND batch_id = p_batch_id 
          AND status IN ('PENDING', 'PARTIAL', 'UPCOMING')
        ORDER OR BY installment_number ASC
    ) LOOP
        EXIT WHEN v_remaining_amount <= 0;

        v_alloc_amount := LEAST(v_remaining_amount, v_rec.balance_amount);
        v_new_paid := v_rec.paid_amount + v_alloc_amount;
        v_new_bal := v_rec.amount - v_new_paid;
        
        IF v_new_bal <= 0 THEN
            v_new_status := 'PAID';
        ELSE
            v_new_status := 'PARTIAL';
        END IF;

        UPDATE public.installments
        SET paid_amount = v_new_paid,
            balance_amount = v_new_bal,
            status = v_new_status,
            paid_date = NOW(),
            updated_at = NOW()
        WHERE id = v_rec.id;

        v_remaining_amount := v_remaining_amount - v_alloc_amount;
        v_total_applied := v_total_applied + v_alloc_amount;
    END LOOP;

    -- 4. Record Payment Entry
    INSERT INTO public.payments (
        receipt_no, customer_id, batch_id, enrollment_id, 
        amount_paid, payment_method, reference_no, collected_by, notes
    ) VALUES (
        v_receipt_no, p_customer_id, p_batch_id, v_enrollment_id, 
        p_amount, p_payment_method, p_reference_no, p_admin_id, p_notes
    );

    -- 5. Audit Log
    INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
        p_admin_id, 
        'RECORD_PAYMENT_FIFO', 
        'PAYMENT', 
        v_receipt_no, 
        jsonb_build_object(
            'customer_id', p_customer_id,
            'batch_id', p_batch_id,
            'amount', p_amount,
            'allocated', v_total_applied,
            'excess', v_remaining_amount
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'receipt_no', v_receipt_no,
        'allocated', v_total_applied,
        'excess', v_remaining_amount
    );
END;
$$;
