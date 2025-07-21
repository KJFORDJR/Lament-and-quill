-- Create order number generation function
-- Run this in your Supabase SQL Editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_order_number();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Generate a unique order number with format: ORD-YYYYMMDD-XXXX
    -- Where XXXX is a sequential number for the day
    
    -- Get today's count of orders
    SELECT COUNT(*) INTO counter 
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Increment for next order
    counter := counter + 1;
    
    -- Format: ORD-20250121-0001
    order_num := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
