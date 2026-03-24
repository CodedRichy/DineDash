-- Migration to fix Dish Management issues
-- 1. Ensure image_url exists on menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Ensure RLS is enabled
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 3. Add Missing RLS Policies for menu_items
-- Managers and Super Admins should be able to Insert/Update/Delete menu items

-- DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow managers to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow managers to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow managers to delete menu items" ON public.menu_items;

-- Select policy is already "Allow public read-only access to menu items"

CREATE POLICY "Allow managers to insert menu items" 
ON public.menu_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'manager' OR profiles.role = 'super_admin')
    )
);

CREATE POLICY "Allow managers to update menu items" 
ON public.menu_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'manager' OR profiles.role = 'super_admin')
    )
);

CREATE POLICY "Allow managers to delete menu items" 
ON public.menu_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'manager' OR profiles.role = 'super_admin')
    )
);
