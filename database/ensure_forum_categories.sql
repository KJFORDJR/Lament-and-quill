-- Ensure forum categories exist
-- Run this if the categories are missing

-- First, add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'forum_categories_name_unique'
    ) THEN
        ALTER TABLE forum_categories ADD CONSTRAINT forum_categories_name_unique UNIQUE (name);
    END IF;
END $$;

-- Insert categories with conflict handling
INSERT INTO forum_categories (name, description, color, display_order) VALUES
('Crimson Chronicles', 'Discussions about Crimson City affairs', 'gothic-crimson', 1),
('Silver Transmissions', 'Topics related to Silver Heights', 'gothic-silver', 2),
('The Convergence', 'Cross-city discussions and diplomacy', 'gothic-steel', 3),
('Unsolved Mysteries', 'Strange occurrences and investigations', 'purple-400', 4),
('General Discussion', 'Open forum for all topics', 'gothic-silver', 5)
ON CONFLICT (name) DO NOTHING;
