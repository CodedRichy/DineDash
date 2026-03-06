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
                .eq('is_available', true);

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
