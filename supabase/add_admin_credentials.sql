-- Migration script: Add password column to admins table and insert admin user
-- Target: Supabase Postgres Database

-- 1. Ensure password column exists on public.admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Insert or Update admin user with specified credentials
INSERT INTO public.admins (email, password, full_name, role)
VALUES (
    'nexfix@power', 
    'NexFix@portal#log&manage', 
    'NexFix System Admin', 
    'SUPER_ADMIN'
)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password;
