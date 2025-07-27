-- Migration: Add display_order columns for drag-and-drop reordering
-- Date: $(date)

-- Add display_order column to lament_ledger_entries
ALTER TABLE lament_ledger_entries 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Set initial display_order values based on created_at
UPDATE lament_ledger_entries 
SET display_order = subq.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM lament_ledger_entries
) AS subq
WHERE lament_ledger_entries.id = subq.id;

-- Add display_order column to lament_fragments_entries
ALTER TABLE lament_fragments_entries 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Set initial display_order values based on created_at
UPDATE lament_fragments_entries 
SET display_order = subq.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM lament_fragments_entries
) AS subq
WHERE lament_fragments_entries.id = subq.id;

-- Create indexes for better performance on ordering queries
CREATE INDEX idx_lament_ledger_entries_display_order ON lament_ledger_entries(display_order);
CREATE INDEX idx_lament_fragments_entries_display_order ON lament_fragments_entries(display_order);
