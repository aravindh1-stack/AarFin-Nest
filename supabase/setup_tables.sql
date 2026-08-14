-- Run this EXACT SQL script in your Supabase Dashboard -> SQL Editor (or Query Editor)
-- It updates all table structures so customer enrollment with batch_id, group_id, joining_date & late_joiner_policy succeeds 100%!

DROP TABLE IF EXISTS public.installments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;

CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT,
    batch_name TEXT NOT NULL,
    scheme_type TEXT NOT NULL,
    total_cycles INT NOT NULL,
    installment_amount DECIMAL(12,2) NOT NULL,
    frequency_type TEXT NOT NULL,
    renewal_day TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    group_code TEXT,
    route_name TEXT NOT NULL,
    collection_agent TEXT,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    id_proof_number TEXT,
    internal_notes TEXT,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_name TEXT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    group_name TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    late_joiner_policy TEXT DEFAULT 'START_FROM_JOIN_DATE',
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    balance_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'UPCOMING',
    paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    enrollment_id UUID,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT DEFAULT 'CASH',
    reference_no TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

NOTIFY pgrst, 'reload schema';
