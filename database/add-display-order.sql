-- Add display_order columns to enable drag-and-drop reordering
-- in admin panels for Fragments and Ledger entries

-- Add display_order to crimson_ledger_entries
ALTER TABLE crimson_ledger_entries 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Add display_order to lament_fragments_entries  
ALTER TABLE lament_fragments_entries 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing records with sequential order based on created_at
UPDATE crimson_ledger_entries 
SET display_order = sub.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
  FROM crimson_ledger_entries
) sub
WHERE crimson_ledger_entries.id = sub.id;

UPDATE lament_fragments_entries 
SET display_order = sub.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number
  FROM lament_fragments_entries
) sub
WHERE lament_fragments_entries.id = sub.id;

-- Create indexes for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_display_order ON crimson_ledger_entries(display_order);
CREATE INDEX IF NOT EXISTS idx_lament_fragments_display_order ON lament_fragments_entries(display_order);
