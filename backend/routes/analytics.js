const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    router.get('/stats', async (req, res) => {
        try {
            // 1. User Distribution
            const { data: profiles, error: pError } = await supabase.from('profiles').select('role');
            if (pError) throw pError;

            const userStats = profiles.reduce((acc, curr) => {
                acc[curr.role] = (acc[curr.role] || 0) + 1;
                return acc;
            }, {});

            // 2. Order Stats
            const { data: orders, error: oError } = await supabase.from('orders').select('total_price, status');
            if (oError) throw oError;

            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            // 3. Restaurant Count
            const { count: resCount, error: rError } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
            if (rError) throw rError;

            res.json({
                users: userStats,
                orders: {
                    total: totalOrders,
                    revenue: totalRevenue.toFixed(2),
                    pending: pendingOrders
                },
                restaurants: resCount
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
