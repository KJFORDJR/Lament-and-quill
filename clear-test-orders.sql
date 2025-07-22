-- Clear Test Order Records
-- Run this in your Supabase SQL Editor to remove all test orders and their associated data

-- Step 1: Delete order items first (due to foreign key constraints)
DELETE FROM order_items;

-- Step 2: Delete orders
DELETE FROM orders;

-- Step 3: Reset any cart items (optional - clears user shopping carts)
-- Uncomment the line below if you also want to clear all cart items
-- DELETE FROM cart_items;

-- Step 4: Verify deletion
SELECT 
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM order_items) as order_items_count,
  (SELECT COUNT(*) FROM cart_items) as cart_items_count;

-- Optional: Reset auto-increment counters if using sequences
-- This ensures order numbers start fresh
-- Note: Only run this if you want to reset the order numbering system
-- SELECT setval(pg_get_serial_sequence('orders', 'id'), 1, false);
