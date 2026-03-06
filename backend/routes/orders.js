const express = require('express');

module.exports = (supabase) => {
    const router = express.Router();

    // Create a new order
    router.post('/', async (req, res) => {
        const { user_id, restaurant_id, total_price, items } = req.body;

        try {
            // 1. Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{ user_id, restaurant_id, total_price }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert Order Items
            if (items && items.length > 0) {
                const orderItems = items.map(item => ({
                    order_id: orderData.id,
                    item_id: item.item_id,
                    quantity: item.quantity,
                    price_at_time_of_order: item.price
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;
            }

            res.status(201).json({ message: 'Order placed successfully', order: orderData });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get order status
    router.get('/:id', async (req, res) => {
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
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
