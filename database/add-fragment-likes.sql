-- Add likes system for lament fragments
CREATE TABLE lament_fragment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fragment_id UUID REFERENCES lament_fragments_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(fragment_id, user_id) -- Prevent duplicate likes from same user
);

-- Enable RLS
ALTER TABLE lament_fragment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Users can view all likes" ON lament_fragment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON lament_fragment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON lament_fragment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_lament_fragment_likes_fragment_id ON lament_fragment_likes(fragment_id);
CREATE INDEX idx_lament_fragment_likes_user_id ON lament_fragment_likes(user_id);
