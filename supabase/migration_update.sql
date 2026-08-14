-- SQL Migration to add missing columns to public.batches table in Supabase
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS batch_code TEXT;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS renewal_day TEXT;

-- SQL Migration to add missing columns to public.groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS group_code TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
