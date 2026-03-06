-- 1. Drop the old trigger so we can start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Make the function smarter: Only insert if profile doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'consumer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. EMERGENCY CLEAR: Remove previous test attempts to allow fresh signup
DELETE FROM auth.users WHERE email IN ('admin@test.com', 'manager@test.com', 'rider@test.com', 'consumer@test.com');
DELETE FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users);
