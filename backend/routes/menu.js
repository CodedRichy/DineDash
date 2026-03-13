const express = require('express');

module.exports = (supabase, checkRole) => {
    const router = express.Router();

    // Get menu for a specific restaurant (Public)
    router.get('/:restaurantId', async (req, res) => {
        try {
            const { restaurantId } = req.params;
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Could not fetch menu: " + err.message });
        }
    });

    // Create new menu item (Manager/Admin Only)
    router.post('/', checkRole(['manager', 'super_admin']), async (req, res) => {
        try {
            const { restaurant_id, name, description, price, category, is_available, image_url } = req.body;

            console.log(`[MENU] Create request by ${req.user.id} (${req.userRole}) for restaurant ${restaurant_id}`);

            // Safety: Managers can only add to their own restaurant
            if (req.userRole === 'manager') {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('managed_restaurant_id').eq('id', req.user.id).single();
                if (profileError || !profile) {
                    console.error("[MENU] Manager profile not found:", profileError);
                    return res.status(403).json({ error: "Manager profile not found." });
                }
                if (!profile.managed_restaurant_id) {
                    console.error("[MENU] Manager has no assigned restaurant");
                    return res.status(403).json({ error: "You have no restaurant assigned to your account." });
                }
                if (profile.managed_restaurant_id !== restaurant_id) {
                    console.error(`[MENU] Manager restaurant mismatch: Profile:${profile.managed_restaurant_id} vs Request:${restaurant_id}`);
                    return res.status(403).json({ error: "Cannot add items to other restaurants." });
                }
            }

            const { data, error } = await supabase
                .from('menu_items')
                .insert([{ restaurant_id, name, description, price, category, is_available: is_available !== false, image_url }])
                .select()
                .single();
            
            if (error) {
                console.error("[MENU] Supabase Insert Error:", error);
                throw error;
            }
            res.status(201).json(data);
        } catch (err) {
            console.error("[MENU] Create item failed:", err);
            res.status(500).json({ error: "Failed to create item: " + (err.message || "Unknown error") });
        }
    });

    // Update menu item (Manager/Admin Only)
    router.put('/:id', checkRole(['manager', 'super_admin']), async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, price, category, is_available, image_url } = req.body;

            console.log(`[MENU] Update request for item ${id} by ${req.user.id}`);

            // Sanitize updates to ONLY allowed fields
            const updates = {};
            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (price !== undefined) updates.price = price;
            if (category !== undefined) updates.category = category;
            if (is_available !== undefined) updates.is_available = is_available;
            if (image_url !== undefined) updates.image_url = image_url;

            const { data, error } = await supabase
                .from('menu_items')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) {
                console.error(`[MENU] Supabase Update Error for ID ${id}:`, error);
                throw error;
            }
            res.json(data);
        } catch (err) {
            console.error("[MENU] Update item failed:", err);
            res.status(500).json({ error: "Failed to update item: " + (err.message || "Unknown error") });
        }
    });

    // Delete menu item (Manager/Admin Only)
    router.delete('/:id', checkRole(['manager', 'super_admin']), async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
            res.json({ message: 'Item deleted' });
        } catch (err) {
            res.status(500).json({ error: "Failed to delete item: " + err.message });
        }
    });

    return router;
};
