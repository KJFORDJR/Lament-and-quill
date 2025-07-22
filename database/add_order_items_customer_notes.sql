-- Add customer_notes column to order_items table
-- This stores the custom notes that customers can add when purchasing specific merchandise items

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.order_items.customer_notes IS 'Custom notes provided by customer for this specific item during purchase';
