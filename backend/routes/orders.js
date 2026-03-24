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
                // ADD THIS VALIDATION
                if (!clientItem.quantity || clientItem.quantity < 1 || !Number.isInteger(clientItem.quantity)) {
                    return res.status(400).json({ error: "Invalid quantity. Must be a positive integer." });
                }
                
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

    // Test route without authentication - MUST be first
    router.get('/test', async (req, res) => {
        console.log('[TEST] Orders test route hit');
        try {
            // Try direct access to orders data
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true });
            
            if (countError) {
                console.error('[TEST] Count error:', countError);
                return res.status(500).json({ error: countError.message });
            }
            
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .limit(5);
            
            console.log('[TEST] Query result:', orders?.length, 'orders');
            if (error) console.error('[TEST] Query error:', error);
            
            res.json({ 
                message: 'Orders route working', 
                totalOrders: count,
                sampleOrders: orders,
                hasError: !!error,
                errorMessage: error?.message
            });
        } catch (err) {
            console.error('[TEST] Error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Test route for rider orders without authentication - MUST be before /:id
    router.get('/rider-test', async (req, res) => {
        console.log('[RIDER-TEST] ===== ROUTE HIT =====');
        try {
            // Count orders with preparing status
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'preparing');
            
            console.log('[RIDER-TEST] Preparing orders count:', count);
            if (countError) console.error('[RIDER-TEST] Count error:', countError);
            
            // Get sample preparing orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, status, restaurant_id, created_at')
                .eq('status', 'preparing')
                .limit(3);
            
            console.log('[RIDER-TEST] Sample preparing orders:', orders);
            if (error) console.error('[RIDER-TEST] Query error:', error);
            
            res.json({ 
                message: 'Rider test route working',
                preparingCount: count,
                sampleOrders: orders
            });
        } catch (err) {
            console.error('[RIDER-TEST] Error:', err);
            res.status(500).json({ error: err.message });
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

    // Update order status (Manager accepts/rejects, Rider marks delivered)
    router.put('/:id/status', checkRole(['manager', 'super_admin', 'delivery_partner']), async (req, res) => {
        console.log('[STATUS UPDATE] ===== ROUTE HIT =====');
        console.log('[STATUS UPDATE] User role:', req.userRole);
        console.log('[STATUS UPDATE] Order ID:', req.params.id);
        console.log('[STATUS UPDATE] Request body:', req.body);
        
        try {
            const { id } = req.params;
            const { status, rider_id } = req.body;

            const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Fetch the order to check permissions
            const { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            console.log('[STATUS UPDATE] Current order:', order);
            if (fetchError || !order) {
                return res.status(404).json({ error: "Order not found" });
            }

            // Permission checks
            if (req.userRole === 'manager') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('managed_restaurant_id')
                    .eq('id', req.user.id)
                    .single();
                
                if (profile.managed_restaurant_id !== order.restaurant_id) {
                    return res.status(403).json({ error: "Cannot update orders for other restaurants" });
                }

                // Manager can only set: preparing, cancelled
                if (!['preparing', 'cancelled'].includes(status)) {
                    return res.status(403).json({ error: "Manager can only accept (preparing) or reject (cancelled) orders" });
                }
            }

            if (req.userRole === 'delivery_partner') {
                console.log('[STATUS UPDATE] Rider permission check');
                // Rider can only set: out_for_delivery, delivered
                if (!['out_for_delivery', 'delivered'].includes(status)) {
                    return res.status(403).json({ error: "Rider can only mark as out for delivery or delivered" });
                }
            }

            const updateData = { status };
            if (rider_id && status === 'out_for_delivery') {
                updateData.rider_id = rider_id;
                console.log('[STATUS UPDATE] Adding rider_id to update:', rider_id);
            }

            console.log('[STATUS UPDATE] Update data:', updateData);

            const { data, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[STATUS UPDATE] Update error:', error);
                throw error;
            }

            console.log('[STATUS UPDATE] Updated order:', data);
            res.json({ message: 'Order status updated', order: data });
        } catch (err) {
            console.error("[STATUS UPDATE] Status update error:", err);
            res.status(500).json({ error: "Failed to update order status: " + err.message });
        }
    });

    // Get orders for delivery partner (rider)
    router.get('/rider/available', checkRole(['delivery_partner', 'super_admin']), async (req, res) => {
        console.log('[RIDER] ===== ROUTE HIT =====');
        try {
            // First check total orders with preparing status
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'preparing');
            
            console.log('[RIDER] Total preparing orders:', count);
            if (countError) console.error('[RIDER] Count error:', countError);
            
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    restaurants(name, address),
                    order_items(
                        quantity,
                        menu_items(name)
                    )
                `)
                .in('status', ['preparing', 'out_for_delivery'])
                .order('created_at', { ascending: true });

            console.log('[RIDER] Found', data?.length || 0, 'orders');
            if (error) console.error('[RIDER] Query error:', error);
            
            res.json(data);
        } catch (err) {
            console.error('[RIDER] Failed to fetch rider orders:', err);
            res.status(500).json({ error: "Failed to fetch rider orders: " + err.message });
        }
    });

    // Get consumer's own orders
    router.get('/my/orders', checkRole(['consumer', 'super_admin']), async (req, res) => {
        console.log('[ORDERS] ===== ROUTE HIT =====');
        console.log('[ORDERS] Fetching orders for user:', req.user?.id);
        try {
            console.log('[ORDERS] User object:', JSON.stringify(req.user));
            
            // First, try a simple count query to check connectivity
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true });
            
            console.log('[ORDERS] Total orders in table:', count);
            if (countError) console.error('[ORDERS] Count error:', countError);
            
            // Try fetching without the join first
            console.log('[ORDERS] Querying with user_id:', req.user.id);
            const { data: simpleData, error: simpleError } = await supabase
                .from('orders')
                .select('id, user_id, status, total_price, created_at')
                .eq('user_id', req.user.id);
                
            console.log('[ORDERS] Simple query result:', simpleData?.length || 0, 'orders');
            if (simpleError) console.error('[ORDERS] Simple query error:', simpleError);
            
            // Debug: Show first order's user_id vs req.user.id
            if (simpleData && simpleData.length > 0) {
                console.log('[ORDERS] First order user_id:', simpleData[0].user_id);
                console.log('[ORDERS] Request user_id:', req.user.id);
                console.log('[ORDERS] Match?', simpleData[0].user_id === req.user.id);
            }
            
            // Debug: Check all unique user_ids in orders
            const { data: allOrders } = await supabase
                .from('orders')
                .select('user_id')
                .limit(10);
            console.log('[ORDERS] Sample user_ids in orders:', allOrders?.map(o => o.user_id));
            console.log('[ORDERS] Current user_id:', req.user.id);
            
            // Now try the full query with joins
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    restaurants(name, image_url),
                    order_items(
                        quantity,
                        price_at_time_of_order,
                        menu_items(name)
                    )
                `)
                .eq('user_id', req.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ORDERS] Supabase error with joins:', error);
                // Return simple data if join fails
                if (simpleData && simpleData.length > 0) {
                    console.log('[ORDERS] Returning simple data without joins');
                    return res.json(simpleData);
                }
                throw error;
            }
            
            console.log('[ORDERS] Found', data?.length || 0, 'orders with joins');
            res.json(data || []);
        } catch (err) {
            console.error('[ORDERS] Failed to fetch orders:', err);
            res.status(500).json({ error: "Failed to fetch orders: " + err.message });
        }
    });

    return router;
};
