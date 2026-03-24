-- Migration to fix security lints (RLS disabled but policies exist)
-- Reference: https://supabase.com/docs/guides/database/database-linter

-- 1. Profiles Table
-- Ensure RLS is enabled as reported by the linter
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify or add mandatory policies if they are missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public read access to profiles'
    ) THEN
        CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
END $$;

-- 2. Audit Logs Table
-- Fix "RLS disabled in public schema" for audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Super Admins should be able to view audit logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'Admins can view all logs'
    ) THEN
        CREATE POLICY "Admins can view all logs" ON public.admin_audit_logs 
            FOR SELECT USING (
                auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
            );
    END IF;

    -- Allow insertion of logs via backend/admin operations
    -- Note: If backend uses the anon key, it will need a policy or service role key.
    -- For demo safety, we'll allow authenticated users to insert logs.
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'Admins can insert logs'
    ) THEN
        CREATE POLICY "Admins can insert logs" ON public.admin_audit_logs 
            FOR INSERT WITH CHECK (
                auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
            );
    END IF;
END $$;
