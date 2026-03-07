const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // Get all profiles with email from auth.users (requires service role key for some operations, but simple select should work if RLS allows)
    // Note: To get emails, we'd normally use the Admin API, but profiles usually have enough info.
    // Let's create a view or just select profiles and assume we can join if needed.
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Update a user's role/restaurant
    router.put('/:id', async (req, res) => {
        const { role, managed_restaurant_id } = req.body;
        const userId = req.params.id;

        try {
            // Safety Check: Get the user's current role before updating
            const { data: currentUser, error: getError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (getError) throw getError;

            // Business Logic: Super Admins are directly added from Supabase/SQL
            // The frontend should prevent this, but the backend double checks.
            if (role === 'super_admin' && currentUser.role !== 'super_admin') {
                return res.status(403).json({ error: "Cannot promote to Super Admin via dashboard." });
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    role,
                    managed_restaurant_id,
                    updated_at: new Date()
                })
                .eq('id', userId)
                .select();

            if (error) throw error;
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
