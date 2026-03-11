-- Migration to seed image URLs for existing menu items
-- This will make the app look much better for the demo.

-- Mexican (The Spicy Jalapeno)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Beef Tacos';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Guacamole & Chips';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Margarita';

-- Japanese (Sushi Master)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd3551?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Spicy Tuna Roll';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1625938140705-38521fc707bc?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Edamame';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Miso Soup';

-- American (Burger Joint)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Classic Smash Burger';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Truffle Fries';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Vanilla Milkshake';

-- Italian (La Dolce Vita)
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Margherita Pizza';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1612459284970-e8f027596582?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Spaghetti Carbonara';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80' 
WHERE name = 'Tiramisu';
