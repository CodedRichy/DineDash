-- 1. Fix search_path for handle_new_user function (Security Best Practice)
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. Scp-Down Order Items Insert Policy (Prevent inserting items for others' orders)
DROP POLICY IF EXISTS "Allow authenticated users to insert order items" ON order_items;

CREATE POLICY "Allow users to insert items into their own orders" 
ON order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);
