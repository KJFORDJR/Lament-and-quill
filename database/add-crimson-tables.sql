-- Add Crimson City tables to mirror Silver Heights functionality

-- Crimson Ledger Entries (mirrors lament_fragments_entries)
CREATE TABLE IF NOT EXISTS crimson_ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT 'Official Records',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crimson Confessions Submissions (mirrors lament_neural_submissions)
CREATE TABLE IF NOT EXISTS crimson_confessions_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crimson Confessions Tips (mirrors lament_neural_tips)
CREATE TABLE IF NOT EXISTS crimson_confessions_tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES crimson_confessions_submissions(id) ON DELETE CASCADE,
  tipper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) DEFAULT 0.00,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(submission_id, tipper_id) -- Prevent duplicate tips from same user
);

-- Crimson Ledger Likes (mirrors lament_fragment_likes)
CREATE TABLE IF NOT EXISTS crimson_ledger_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID REFERENCES crimson_ledger_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(entry_id, user_id) -- Prevent duplicate likes from same user
);

-- Dossier Entries (shared between both cities)
CREATE TABLE IF NOT EXISTS dossier_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('character', 'location', 'event')) NOT NULL,
  city TEXT CHECK (city IN ('crimson', 'silver')) NOT NULL,
  classification TEXT CHECK (classification IN ('public', 'confidential', 'secret', 'top-secret')) DEFAULT 'public',
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for all tables (skip if already enabled)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'crimson_ledger_entries' AND relrowsecurity = true) THEN
        ALTER TABLE crimson_ledger_entries ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'crimson_confessions_submissions' AND relrowsecurity = true) THEN
        ALTER TABLE crimson_confessions_submissions ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'crimson_confessions_tips' AND relrowsecurity = true) THEN
        ALTER TABLE crimson_confessions_tips ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'crimson_ledger_likes' AND relrowsecurity = true) THEN
        ALTER TABLE crimson_ledger_likes ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'dossier_entries' AND relrowsecurity = true) THEN
        ALTER TABLE dossier_entries ENABLE ROW LEVEL SECURITY;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS Policies for crimson_ledger_entries
DROP POLICY IF EXISTS "Anyone can view published crimson entries" ON crimson_ledger_entries;
CREATE POLICY "Anyone can view published crimson entries" ON crimson_ledger_entries
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all crimson entries" ON crimson_ledger_entries;
CREATE POLICY "Admins can manage all crimson entries" ON crimson_ledger_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for crimson_confessions_submissions
DROP POLICY IF EXISTS "Users can view their own submissions" ON crimson_confessions_submissions;
CREATE POLICY "Users can view their own submissions" ON crimson_confessions_submissions
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert their own submissions" ON crimson_confessions_submissions;
CREATE POLICY "Users can insert their own submissions" ON crimson_confessions_submissions
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own pending submissions" ON crimson_confessions_submissions;
CREATE POLICY "Users can update their own pending submissions" ON crimson_confessions_submissions
  FOR UPDATE USING (auth.uid() = author_id AND status = 'pending');

DROP POLICY IF EXISTS "Admins can view all submissions" ON crimson_confessions_submissions;
CREATE POLICY "Admins can view all submissions" ON crimson_confessions_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can update submission status" ON crimson_confessions_submissions;
CREATE POLICY "Admins can update submission status" ON crimson_confessions_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can delete submissions" ON crimson_confessions_submissions;
CREATE POLICY "Admins can delete submissions" ON crimson_confessions_submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for crimson_confessions_tips
DROP POLICY IF EXISTS "Users can view all tips" ON crimson_confessions_tips;
CREATE POLICY "Users can view all tips" ON crimson_confessions_tips
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own tips" ON crimson_confessions_tips;
CREATE POLICY "Users can insert their own tips" ON crimson_confessions_tips
  FOR INSERT WITH CHECK (auth.uid() = tipper_id);

DROP POLICY IF EXISTS "Users can delete their own tips" ON crimson_confessions_tips;
CREATE POLICY "Users can delete their own tips" ON crimson_confessions_tips
  FOR DELETE USING (auth.uid() = tipper_id);

-- RLS Policies for crimson_ledger_likes
DROP POLICY IF EXISTS "Users can view all likes" ON crimson_ledger_likes;
CREATE POLICY "Users can view all likes" ON crimson_ledger_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own likes" ON crimson_ledger_likes;
CREATE POLICY "Users can insert their own likes" ON crimson_ledger_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON crimson_ledger_likes;
CREATE POLICY "Users can delete their own likes" ON crimson_ledger_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dossier_entries
DROP POLICY IF EXISTS "Anyone can view published dossier entries" ON dossier_entries;
CREATE POLICY "Anyone can view published dossier entries" ON dossier_entries
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage all dossier entries" ON dossier_entries;
CREATE POLICY "Admins can manage all dossier entries" ON dossier_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'moderator')
    )
  );

-- Create indexes for better performance (skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_entries_published ON crimson_ledger_entries(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_crimson_confessions_submissions_author ON crimson_confessions_submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_crimson_confessions_submissions_status ON crimson_confessions_submissions(status);
CREATE INDEX IF NOT EXISTS idx_crimson_confessions_tips_submission ON crimson_confessions_tips(submission_id);
CREATE INDEX IF NOT EXISTS idx_crimson_confessions_tips_tipper ON crimson_confessions_tips(tipper_id);
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_likes_entry ON crimson_ledger_likes(entry_id);
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_likes_user ON crimson_ledger_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_dossier_entries_type ON dossier_entries(type);
CREATE INDEX IF NOT EXISTS idx_dossier_entries_city ON dossier_entries(city);
CREATE INDEX IF NOT EXISTS idx_dossier_entries_published ON dossier_entries(is_published, created_at);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at timestamp updates
DROP TRIGGER IF EXISTS update_crimson_ledger_entries_updated_at ON crimson_ledger_entries;
CREATE TRIGGER update_crimson_ledger_entries_updated_at
    BEFORE UPDATE ON crimson_ledger_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crimson_confessions_submissions_updated_at ON crimson_confessions_submissions;
CREATE TRIGGER update_crimson_confessions_submissions_updated_at
    BEFORE UPDATE ON crimson_confessions_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dossier_entries_updated_at ON dossier_entries;
CREATE TRIGGER update_dossier_entries_updated_at
    BEFORE UPDATE ON dossier_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update like counts
CREATE OR REPLACE FUNCTION update_crimson_ledger_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment like count when a like is added
        UPDATE crimson_ledger_entries 
        SET updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.entry_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement like count when a like is removed
        UPDATE crimson_ledger_entries 
        SET updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = OLD.entry_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for like count updates
DROP TRIGGER IF EXISTS update_crimson_ledger_like_count_trigger ON crimson_ledger_likes;
CREATE TRIGGER update_crimson_ledger_like_count_trigger
    AFTER INSERT OR DELETE ON crimson_ledger_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_crimson_ledger_like_count();

-- Insert some sample data for testing (skip if data already exists)
INSERT INTO crimson_ledger_entries (title, content, author_name, category, is_published, published_at) 
SELECT * FROM (VALUES
  ('Official Proclamation: Blood District Regulations', 'New regulations have been established for the blood districts. All citizens must comply with enhanced security protocols effective immediately.', 'Administrator Vex', 'Official Records', true, NOW()),
  ('Archive Entry: The Great Crimson Awakening', 'Historical documentation of the events that led to the establishment of Crimson City as we know it today. Blood runs deep in our foundations.', 'Historian Ravenwood', 'Archive Entries', true, NOW()),
  ('Blood Network Synchronization Report', 'Technical analysis of the current blood network performance and recommendations for optimization of data flows.', 'Chief Technician Kane', 'Ledger', true, NOW())
) AS new_entries(title, content, author_name, category, is_published, published_at)
WHERE NOT EXISTS (
  SELECT 1 FROM crimson_ledger_entries 
  WHERE crimson_ledger_entries.title = new_entries.title
);

-- Insert sample dossier entries
INSERT INTO dossier_entries (title, summary, content, type, city, classification, is_published) 
SELECT * FROM (VALUES
  ('The Red Archivist', 'Keeper of Crimson Secrets', 'A mysterious figure who maintains the bloody records of the lower city. Few have seen their face and lived to tell the tale. They operate from the shadows, cataloging every transaction, every secret, every drop of blood spilled in the name of power.', 'character', 'crimson', 'secret', true),
  ('Chrome Magistrate', 'Silver Heights Authority', 'The cybernetic enforcer of Silver Heights digital laws. Their neural implants process justice at the speed of light, making decisions that reshape the digital landscape. Cold, calculated, and utterly without mercy for those who dare to break the code.', 'character', 'silver', 'public', true),
  ('The Bleeding Quarter', 'Crimson City Commercial District', 'Where blood money flows like water and every transaction leaves a stain. The heart of the underground economy, where desperate souls trade their essence for fleeting power and temporary relief from the city''s crushing weight.', 'location', 'crimson', 'confidential', true),
  ('Neural Nexus Plaza', 'Silver Heights Data Hub', 'The gleaming center of information exchange, where thoughts become currency and privacy is a luxury. Massive data streams flow through crystalline conduits, processing the dreams and fears of millions.', 'location', 'silver', 'public', true),
  ('Shadow Broker Vex', 'Information Dealer', 'Operating in the shadows between both cities, this enigmatic figure trades in secrets more valuable than blood or data. Neither fully human nor completely machine, Vex exists in the spaces between worlds.', 'character', 'crimson', 'top-secret', true),
  ('The Chrome Gardens', 'Silver Heights Residential Zone', 'Pristine living spaces where the elite disconnect from the neural networks and pretend to remember what natural feels like. Artificial paradise built on the suffering of the lower districts.', 'location', 'silver', 'confidential', true)
) AS new_dossiers(title, summary, content, type, city, classification, is_published)
WHERE NOT EXISTS (
  SELECT 1 FROM dossier_entries 
  WHERE dossier_entries.title = new_dossiers.title
);
