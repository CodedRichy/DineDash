-- REPAIR SCRIPT for DineDash Auth
-- This migration fixes the "Invalid Login Credentials" issue by ensuring standard metadata and password hashing.

-- 1. Ensure the encryption extension is ready
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Clear out any @test.com users to avoid confusion if they exist
DELETE FROM auth.users WHERE email LIKE '%@test.com';

-- 3. Repair/Update the @dinedash.app users
-- This ensures the password 'password123' is correctly hashed and metadata is set properly for GoTrue.
UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('password123', extensions.gen_salt('bf')),
  email_confirmed_at = now(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  raw_user_meta_data = '{}',
  aud = 'authenticated',
  role = 'authenticated',
  last_sign_in_at = now(),
  updated_at = now()
WHERE email IN (
  'admin@dinedash.app', 
  'manager@dinedash.app', 
  'rider@dinedash.app', 
  'consumer@dinedash.app'
);

-- 4. Ensure Profiles match the roles for these specific users
-- Super Admin
UPDATE public.profiles SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@dinedash.app');

-- Manager (Assigned to Sushi Master: d2222222-2222-2222-2222-222222222222)
UPDATE public.profiles 
SET role = 'manager', managed_restaurant_id = 'd2222222-2222-2222-2222-222222222222'
WHERE id = (SELECT id FROM auth.users WHERE email = 'manager@dinedash.app');

-- Rider
UPDATE public.profiles SET role = 'delivery_partner'
WHERE id = (SELECT id FROM auth.users WHERE email = 'rider@dinedash.app');

-- Consumer
UPDATE public.profiles SET role = 'consumer'
WHERE id = (SELECT id FROM auth.users WHERE email = 'consumer@dinedash.app');
