const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // Get all restaurants
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase.from('restaurants').select('*');
            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get a specific restaurant
    router.get('/:id', async (req, res) => {
        try {
            const { data, error } = await supabase.from('restaurants').select('*').eq('id', req.params.id).single();
            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
