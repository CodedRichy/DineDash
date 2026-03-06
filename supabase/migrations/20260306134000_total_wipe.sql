-- 1. NUKE EVERYTHING (Completely clear the decks)
-- Using TRUNCATE CASCADE to clear profiles and auth users without trigger interference
TRUNCATE auth.users CASCADE;
TRUNCATE public.profiles CASCADE;

-- 2. RESET THE TRIGGER (Make sure it's perfect)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'consumer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
