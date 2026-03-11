-- Final Migration to seed high-quality and tested image URLs for menu items
-- Using higher consistency Unsplash photos for food specifically.

-- Mexican (The Spicy Jalapeno)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Beef Tacos';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Guacamole & Chips';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Margarita';

-- Japanese (Sushi Master)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Spicy Tuna Roll';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1522337360744-da48604737ca?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Edamame';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Miso Soup';

-- American (Burger Joint)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Classic Smash Burger';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Truffle Fries';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Vanilla Milkshake';

-- Italian (La Dolce Vita)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Margherita Pizza';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Spaghetti Carbonara';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Tiramisu';
