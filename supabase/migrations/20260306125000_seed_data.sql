-- Insert Restaurants with explicit UUIDs so we can reference them in menu items
INSERT INTO restaurants (id, name, cuisine, address, rating, image_url) VALUES
('d1111111-1111-1111-1111-111111111111', 'The Spicy Jalapeno', 'Mexican', '123 Taco Street, Foodville', 4.5, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'),
('d2222222-2222-2222-2222-222222222222', 'Sushi Master', 'Japanese', '456 Sushi Ave, Ocean City', 4.8, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'),
('d3333333-3333-3333-3333-333333333333', 'Burger Joint', 'American', '789 Beef Blvd, Meat Town', 4.2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'),
('d4444444-4444-4444-4444-444444444444', 'La Dolce Vita', 'Italian', '101 Pasta Lane, Little Italy', 4.7, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80');

-- Insert Menu Items
INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
('d1111111-1111-1111-1111-111111111111', 'Beef Tacos', 'Three authentic street tacos with slow-cooked beef, onions, and cilantro.', 12.99, 'Main'),
('d1111111-1111-1111-1111-111111111111', 'Guacamole & Chips', 'Freshly mashed avocados with pico de gallo and warm tortilla chips.', 8.50, 'Appetizer'),
('d1111111-1111-1111-1111-111111111111', 'Margarita', 'Classic lime margarita, served on the rocks with a salted rim.', 9.00, 'Beverage'),

('d2222222-2222-2222-2222-222222222222', 'Spicy Tuna Roll', 'Fresh yellowfin tuna mixed with spicy mayo, wrapped in seaweed and rice.', 14.00, 'Main'),
('d2222222-2222-2222-2222-222222222222', 'Edamame', 'Steamed soybeans sprinkled with coarse sea salt.', 5.50, 'Appetizer'),
('d2222222-2222-2222-2222-222222222222', 'Miso Soup', 'Traditional dashi broth with miso paste, tofu, and wakame.', 4.00, 'Main'),

('d3333333-3333-3333-3333-333333333333', 'Classic Smash Burger', 'Two smashed beef patties, American cheese, house sauce on a potato bun.', 13.50, 'Main'),
('d3333333-3333-3333-3333-333333333333', 'Truffle Fries', 'Crispy shoestring fries tossed in truffle oil and parmesan cheese.', 7.99, 'Appetizer'),
('d3333333-3333-3333-3333-333333333333', 'Vanilla Milkshake', 'Thick and creamy vanilla bean milkshake topped with whipped cream.', 6.50, 'Beverage'),

('d4444444-4444-4444-4444-444444444444', 'Margherita Pizza', 'Wood-fired crust topped with San Marzano tomato sauce, fresh mozzarella, and basil.', 16.00, 'Main'),
('d4444444-4444-4444-4444-444444444444', 'Spaghetti Carbonara', 'Classic Roman pasta dish with eggs, Pecorino Romano cheese, guanciale, and black pepper.', 18.50, 'Main'),
('d4444444-4444-4444-4444-444444444444', 'Tiramisu', 'Coffee-flavored Italian dessert with ladyfingers and mascarpone cheese.', 8.00, 'Appetizer');
