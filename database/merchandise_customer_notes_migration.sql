-- Merchandise Customer Notes Feature Migration
-- Run this script in your Supabase SQL Editor to enable customer notes functionality

-- 1. Add allow_customer_notes column to merchandise table
ALTER TABLE public.merchandise 
ADD COLUMN IF NOT EXISTS allow_customer_notes BOOLEAN DEFAULT false;

-- Create index for the new column for better performance
CREATE INDEX IF NOT EXISTS idx_merchandise_allow_notes ON public.merchandise(allow_customer_notes);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.merchandise.allow_customer_notes IS 'When true, customers can add custom notes during purchase of this item';

-- 2. Add customer_notes column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.order_items.customer_notes IS 'Custom notes provided by customer for this specific item during purchase';

-- Verification queries (run these to check if the migration worked)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'merchandise' AND column_name = 'allow_customer_notes';

-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'order_items' AND column_name = 'customer_notes';
