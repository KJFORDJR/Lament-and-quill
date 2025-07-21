-- Add RLS policies for lament_fragments_entries
-- This allows admins to manage fragments properly

-- Enable RLS on the table
ALTER TABLE lament_fragments_entries ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published fragments
CREATE POLICY "Anyone can read published fragments" ON lament_fragments_entries
FOR SELECT USING (is_published = true);

-- Allow authenticated users to read all fragments (for admin panel)
CREATE POLICY "Authenticated users can read all fragments" ON lament_fragments_entries
FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to create fragments
CREATE POLICY "Authenticated users can create fragments" ON lament_fragments_entries
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update fragments
CREATE POLICY "Authenticated users can update fragments" ON lament_fragments_entries
FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete fragments
CREATE POLICY "Authenticated users can delete fragments" ON lament_fragments_entries
FOR DELETE TO authenticated USING (true);
