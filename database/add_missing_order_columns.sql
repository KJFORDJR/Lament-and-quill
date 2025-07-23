-- Add missing columns to orders table
-- Run this in your Supabase SQL Editor

-- Add missing columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (credit-card, paypal, etc.)';
COMMENT ON COLUMN orders.payment_status IS 'Status of payment (pending, paid, failed, refunded)';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
