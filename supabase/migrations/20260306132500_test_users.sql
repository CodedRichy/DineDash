-- 1. Enable pgcrypto (needed for password hashing in SQL)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Insert Users into Supabase Auth table
-- Note: 'now()' confirms their email immediately
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
VALUES 
  ('a1111111-1111-1111-1111-1a1111111111', 'consumer@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('b2222222-2222-2222-2222-2b2222222222', 'manager@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('c3333333-3333-3333-3333-3c3333333333', 'rider@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('d4444444-4444-4444-4444-4d4444444444', 'admin@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 3. Update Profiles with their specific roles
-- Manager for Sushi Master (d2222222-2222-2222-2222-222222222222)
UPDATE profiles SET role = 'manager', managed_restaurant_id = 'd2222222-2222-2222-2222-222222222222' 
WHERE id = 'b2222222-2222-2222-2222-2b2222222222';

-- Rider
UPDATE profiles SET role = 'delivery_partner' 
WHERE id = 'c3333333-3333-3333-3333-3c3333333333';

-- Super Admin
UPDATE profiles SET role = 'super_admin' 
WHERE id = 'd4444444-4444-4444-4444-4d4444444444';
