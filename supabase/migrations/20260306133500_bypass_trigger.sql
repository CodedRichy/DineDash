-- 1. Drop trigger to stop it from blocking signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Clear out any previous attempts one last time
DELETE FROM auth.users WHERE email IN ('admin@test.com', 'manager@test.com', 'rider@test.com', 'consumer@test.com');
