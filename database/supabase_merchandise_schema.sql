-- Create merchandise table for the Black Ledger Goods store
CREATE TABLE IF NOT EXISTS public.merchandise (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    badge_text VARCHAR(50),
    badge_color VARCHAR(20) DEFAULT '#666666', -- Hex color for badge background
    badge_border_color VARCHAR(20) DEFAULT '#999999', -- Hex color for badge border
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchandise_active ON public.merchandise(is_active);
CREATE INDEX IF NOT EXISTS idx_merchandise_featured ON public.merchandise(is_featured);
CREATE INDEX IF NOT EXISTS idx_merchandise_category ON public.merchandise(category);
CREATE INDEX IF NOT EXISTS idx_merchandise_created_at ON public.merchandise(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

-- Create policies for merchandise table
-- Allow anyone to view active merchandise
CREATE POLICY "Anyone can view active merchandise" ON public.merchandise
    FOR SELECT USING (is_active = true);

-- Allow admins to do everything
CREATE POLICY "Admins can manage all merchandise" ON public.merchandise
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_role = 'admin'
        )
    );

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_merchandise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_merchandise_updated_at ON public.merchandise;
CREATE TRIGGER update_merchandise_updated_at
    BEFORE UPDATE ON public.merchandise
    FOR EACH ROW
    EXECUTE FUNCTION public.update_merchandise_updated_at();

-- Create function to set created_by on insert
CREATE OR REPLACE FUNCTION public.set_merchandise_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting created_by
DROP TRIGGER IF EXISTS set_merchandise_created_by ON public.merchandise;
CREATE TRIGGER set_merchandise_created_by
    BEFORE INSERT ON public.merchandise
    FOR EACH ROW
    EXECUTE FUNCTION public.set_merchandise_created_by();

-- Insert some sample data (optional)
INSERT INTO public.merchandise (title, description, price, badge_text, badge_color, badge_border_color, category, is_featured) VALUES
('Crimson City Hoodie', 'Blood-red hoodie with the official Crimson City emblem embroidered in silver thread.', 89.99, 'BESTSELLER', '#DC2626', '#EF4444', 'apparel', true),
('Neural Interface Keychain', 'Miniature replica of Silver Heights'' neural interface technology.', 24.99, 'LIMITED', '#6366F1', '#8B5CF6', 'accessories', false),
('The Gothic Chronicles - Book Set', 'Complete collection of the official Gothic Chronicles spanning both cities.', 149.99, 'COLLECTOR', '#059669', '#10B981', 'books', true),
('Convergence Coffee Mug', 'Ceramic mug that changes color when hot liquid is added, revealing hidden city symbols.', 34.99, 'POPULAR', '#F59E0B', '#FBBF24', 'accessories', false);
