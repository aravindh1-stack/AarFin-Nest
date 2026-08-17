-- ==========================================
-- Backend Schema Architecture — AarFin Nest
-- PostgreSQL DDL Script for Supabase DB
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BATCHES TABLE (Scheme Batches)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_name TEXT NOT NULL,
    batch_code TEXT UNIQUE NOT NULL,
    scheme_type TEXT DEFAULT 'WEEKLY',
    frequency_type TEXT CHECK (frequency_type IN ('DAILY', 'WEEKLY', 'MONTHLY')) DEFAULT 'WEEKLY',
    interval_days INTEGER NOT NULL DEFAULT 1,
    total_cycles INTEGER NOT NULL DEFAULT 20,
    installment_amount NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED', 'UPCOMING')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GROUPS TABLE (Route Groups filtered by Batch)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    route_name TEXT NOT NULL,
    max_members INTEGER DEFAULT 50,
    status TEXT CHECK (status IN ('ACTIVE', 'CLOSED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE (Members Directory)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    alt_phone TEXT,
    address TEXT,
    id_proof TEXT,
    internal_notes TEXT,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_name TEXT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    group_name TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    late_joiner_policy TEXT CHECK (late_joiner_policy IN ('START_FROM_JOIN_DATE', 'CARRY_PREVIOUS_PENDING', 'SKIP_PREVIOUS_DISALLOWED')) DEFAULT 'START_FROM_JOIN_DATE',
    status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYMENTS TABLE (Verified Collection Logs & Receipts)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_name TEXT,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER')) DEFAULT 'CASH',
    reference_no TEXT,
    receipt_no TEXT NOT NULL UNIQUE,
    notes TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Row Level Security Policies (Bypass via Service Role Key)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for dev" ON public.batches FOR ALL USING (true);
CREATE POLICY "Allow public read-write for dev" ON public.groups FOR ALL USING (true);
CREATE POLICY "Allow public read-write for dev" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow public read-write for dev" ON public.payments FOR ALL USING (true);
