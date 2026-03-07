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

            // 2. Order Stats (Including created_at for time-based charts)
            const { data: orders, error: oError } = await supabase.from('orders').select('total_price, status, created_at');
            if (oError) throw oError;

            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            // 3. Status Distribution for Pie Chart
            const statuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
            const statusData = statuses.map(s => ({
                name: s.replace(/_/g, ' '),
                value: orders.filter(o => o.status === s).length
            })).filter(s => s.value > 0);

            // 4. Daily Revenue for Area Chart (Last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            const dailyRevenue = last7Days.map(date => {
                const dayRevenue = orders
                    .filter(o => o.created_at.startsWith(date))
                    .reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

                return {
                    day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: parseFloat(dayRevenue.toFixed(2))
                };
            });

            // 5. Restaurant Count
            const { count: resCount, error: rError } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
            if (rError) throw rError;

            res.json({
                users: userStats,
                orders: {
                    total: totalOrders,
                    revenue: totalRevenue.toFixed(2),
                    pending: pendingOrders,
                    statusDistribution: statusData,
                    dailyRevenue: dailyRevenue
                },
                restaurants: resCount
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
