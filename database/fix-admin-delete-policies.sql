-- Fix missing admin delete policies for confessions and submissions
-- Run this in your Supabase SQL Editor

-- Add admin policies for crimson_confessions table
CREATE POLICY "Admins can view all confessions" ON crimson_confessions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update confessions" ON crimson_confessions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can delete confessions" ON crimson_confessions 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

-- Add admin policies for lament_submissions table  
CREATE POLICY "Admins can view all submissions" ON lament_submissions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update submissions" ON lament_submissions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can delete submissions" ON lament_submissions 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

-- Also add policies for users to view their own pending submissions
CREATE POLICY "Users can view their own confessions" ON crimson_confessions 
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can view their own submissions" ON lament_submissions 
  FOR SELECT USING (auth.uid() = author_id);

-- Add update policies for users to edit their own pending submissions
CREATE POLICY "Users can update their own pending confessions" ON crimson_confessions 
  FOR UPDATE USING (auth.uid() = author_id AND status = 'pending');

CREATE POLICY "Users can update their own pending submissions" ON lament_submissions 
  FOR UPDATE USING (auth.uid() = author_id AND status = 'pending');
