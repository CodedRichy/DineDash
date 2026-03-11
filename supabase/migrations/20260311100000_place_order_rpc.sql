-- RPC for Atomic Order Creation
-- This ensures the order and its items are inserted together or not at all.

CREATE OR REPLACE FUNCTION place_order_atomic(
  p_user_id UUID,
  p_restaurant_id UUID,
  p_total_price DECIMAL,
  p_items JSONB
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
BEGIN
  -- 1. Create the Order
  INSERT INTO orders (user_id, restaurant_id, total_price, status)
  VALUES (p_user_id, p_restaurant_id, p_total_price, 'pending')
  RETURNING id INTO v_order_id;

  -- 2. Insert Order Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, item_id, quantity, price_at_time_of_order)
    VALUES (
      v_order_id,
      (v_item.value->>'item_id')::UUID,
      (v_item.value->>'quantity')::INTEGER,
      (v_item.value->>'price')::DECIMAL -- This price is calculated and verified by the backend before calling RPC
    );
  END LOOP;

  RETURN json_build_object('id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
