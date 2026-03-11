const express = require('express');

module.exports = (supabase, checkRole) => {
    const router = express.Router();

    // Create a new order
    router.post('/', checkRole(['consumer', 'manager', 'super_admin']), async (req, res) => {
        const { user_id, restaurant_id, items } = req.body;

        // Security Check: Ensure the user is not placing an order for someone else
        if (req.user.id !== user_id) {
            return res.status(403).json({ error: "Access denied: Cannot place order for another user." });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        try {
            // 1. Fetch CURRENT prices from database to prevent client-side manipulation
            const itemIds = items.map(i => i.item_id);
            const { data: dbItems, error: fetchError } = await supabase
                .from('menu_items')
                .select('id, price')
                .in('id', itemIds);

            if (fetchError) throw fetchError;

            // 2. Calculate SERVER-SIDE total
            let serverTotalPrice = 0;
            const verifiedItems = [];

            for (const clientItem of items) {
                const dbItem = dbItems.find(db => db.id === clientItem.item_id);
                if (!dbItem) {
                    return res.status(400).json({ error: `Item ${clientItem.item_id} no longer exists.` });
                }

                const itemTotal = parseFloat(dbItem.price) * clientItem.quantity;
                serverTotalPrice += itemTotal;

                verifiedItems.push({
                    item_id: clientItem.item_id,
                    quantity: clientItem.quantity,
                    price: dbItem.price
                });
            }

            // 3. Insert Order and Items atomically using RPC
            const { data: orderResponse, error: rpcError } = await supabase.rpc('place_order_atomic', {
                p_user_id: user_id,
                p_restaurant_id: restaurant_id,
                p_total_price: serverTotalPrice,
                p_items: verifiedItems
            });

            if (rpcError) throw rpcError;

            res.status(201).json({
                message: 'Order placed successfully',
                order: { id: orderResponse.id, total_price: serverTotalPrice }
            });
        } catch (err) {
            console.error("Order Error:", err);
            res.status(500).json({ error: "Failed to place order: " + err.message });
        }
    });

    // Get order status (Restricted to owner, restaurant manager, or admin)
    router.get('/:id', checkRole(['consumer', 'manager', 'super_admin', 'delivery_partner']), async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        menu_items (name)
                    )
                `)
                .eq('id', req.params.id)
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ error: "Order not found" });

            // Security Check
            const isOwner = data.user_id === req.user.id;
            const isSuperAdmin = req.userRole === 'super_admin';
            const isManager = req.userRole === 'manager'; // Note: Specific restaurant manager check could be added

            if (!isOwner && !isSuperAdmin && !isManager && req.userRole !== 'delivery_partner') {
                return res.status(403).json({ error: "Access denied to order details." });
            }

            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Could not fetch order: " + err.message });
        }
    });

    // Get all orders for Admin/Manager
    router.get('/admin/:restaurantId', checkRole(['manager', 'super_admin']), async (req, res) => {
        try {
            const { restaurantId } = req.params;

            // Safety: Managers can only view their own restaurant's orders
            if (req.userRole === 'manager') {
                const { data: profile } = await supabase.from('profiles').select('managed_restaurant_id').eq('id', req.user.id).single();
                if (profile.managed_restaurant_id !== restaurantId) {
                    return res.status(403).json({ error: "Access denied to other restaurant orders." });
                }
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        menu_items (name)
                    )
                `)
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch admin orders: " + err.message });
        }
    });

    return router;
};
