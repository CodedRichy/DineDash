const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // Get menu for a specific restaurant
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
            res.status(500).json({ error: err.message });
        }
    });

    // Create new menu item
    router.post('/', async (req, res) => {
        try {
            const { restaurant_id, name, description, price, category, is_available } = req.body;
            const { data, error } = await supabase
                .from('menu_items')
                .insert([{ restaurant_id, name, description, price, category, is_available }])
                .select()
                .single();
            if (error) throw error;
            res.status(201).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Update menu item
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const { data, error } = await supabase
                .from('menu_items')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Delete menu item
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
            res.json({ message: 'Item deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
