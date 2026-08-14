-- Run this SQL in Supabase Dashboard -> SQL Editor to add joining_date and late_joiner_policy columns to public.customers

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS late_joiner_policy TEXT DEFAULT 'START_FROM_JOIN_DATE';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS batch_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS group_id UUID;

NOTIFY pgrst, 'reload schema';
