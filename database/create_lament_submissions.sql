-- Create the missing lament_submissions table
CREATE TABLE IF NOT EXISTS lament_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'archived')) DEFAULT 'pending',
  tip_count INTEGER DEFAULT 0,
  total_tip_amount DECIMAL(10,2) DEFAULT 0.00,
  featured_in_forum BOOLEAN DEFAULT false,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE lament_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for lament_submissions
CREATE POLICY "Users can view their own lament submissions" ON lament_submissions
    FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Users can create lament submissions" ON lament_submissions
    FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own lament submissions" ON lament_submissions
    FOR UPDATE USING (author_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can view all lament submissions" ON lament_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role = 'admin'
        )
    );

CREATE POLICY "Admins can update all lament submissions" ON lament_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role = 'admin'
        )
    );

CREATE POLICY "Admins can delete lament submissions" ON lament_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role = 'admin'
        )
    );

SELECT 'Lament submissions table created successfully!' as result;
