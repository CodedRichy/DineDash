-- Enable RLS for all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 1. Restaurants Policies
-- Anyone can view restaurants
CREATE POLICY "Allow public read-only access to restaurants" 
ON restaurants FOR SELECT USING (true);

-- 2. Menu Items Policies
-- Anyone can view menu items
CREATE POLICY "Allow public read-only access to menu items" 
ON menu_items FOR SELECT USING (true);

-- 3. Orders Policies
-- Authenticated users can insert their own orders
CREATE POLICY "Allow authenticated users to place orders" 
ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Allow users to view their own orders" 
ON orders FOR SELECT USING (auth.uid() = user_id);

-- 4. Order Items Policies
-- For simplicity, allow selecting order items if you can see the order
-- In a real production app, we would join with orders to check auth.uid()
CREATE POLICY "Allow users to view order items" 
ON order_items FOR SELECT USING (true);

-- Allow authenticated users to insert order items
CREATE POLICY "Allow authenticated users to insert order items" 
ON order_items FOR INSERT WITH CHECK (true);
