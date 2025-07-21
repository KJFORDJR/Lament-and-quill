-- Add Stripe payment intent ID to orders table
-- Run this in your Supabase SQL editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id 
ON orders(stripe_payment_intent_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
