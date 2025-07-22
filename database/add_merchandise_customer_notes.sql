-- Add allow_customer_notes column to merchandise table
-- This enables customers to add custom notes when purchasing certain items

ALTER TABLE public.merchandise 
ADD COLUMN IF NOT EXISTS allow_customer_notes BOOLEAN DEFAULT false;

-- Create index for the new column for better performance
CREATE INDEX IF NOT EXISTS idx_merchandise_allow_notes ON public.merchandise(allow_customer_notes);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.merchandise.allow_customer_notes IS 'When true, customers can add custom notes during purchase of this item';
