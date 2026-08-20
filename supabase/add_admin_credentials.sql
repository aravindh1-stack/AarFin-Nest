-- Migration script: Add password & password_hash columns to admins table and insert admin user
-- Target: Supabase Postgres Database

-- 1. Ensure password and password_hash columns exist on public.admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Insert or Update admin user with specified credentials
INSERT INTO public.admins (email, password, password_hash, full_name, role)
VALUES (
    'nexfix@power', 
    'NexFix@portal#log&manage', 
    'NexFix@portal#log&manage', 
    'NexFix System Admin', 
    'SUPER_ADMIN'
)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash;
