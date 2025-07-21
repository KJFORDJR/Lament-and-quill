-- Lament and Quill Database Schema - Safe Installation
-- This version handles existing tables and only creates what doesn't exist

-- Enable Row Level Security (RLS) and UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP AND RECREATE APPROACH (CAUTION!)
-- =============================================
-- Uncomment the lines below ONLY if you want to completely reset your database
-- WARNING: This will delete ALL existing data!

-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS forum_replies CASCADE;
-- DROP TABLE IF EXISTS forum_threads CASCADE;
-- DROP TABLE IF EXISTS forum_categories CASCADE;
-- DROP TABLE IF EXISTS tips CASCADE;
-- DROP TABLE IF EXISTS lament_submissions CASCADE;
-- DROP TABLE IF EXISTS crimson_confessions CASCADE;
-- DROP TABLE IF EXISTS lament_fragments_entries CASCADE;
-- DROP TABLE IF EXISTS crimson_ledger_entries CASCADE;
-- DROP TABLE IF EXISTS location_dossiers CASCADE;
-- DROP TABLE IF EXISTS character_dossiers CASCADE;
-- DROP TABLE IF EXISTS friendships CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- SAFE TABLE CREATION (with IF NOT EXISTS)
-- =============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  city_affiliation TEXT CHECK (city_affiliation IN ('crimson', 'silver', 'neutral')) DEFAULT 'neutral',
  user_role TEXT CHECK (user_role IN ('user', 'admin', 'moderator')) DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Friends system
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- Character dossiers
CREATE TABLE IF NOT EXISTS character_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  city TEXT CHECK (city IN ('crimson', 'silver')) NOT NULL,
  classification TEXT CHECK (classification IN ('PUBLIC', 'RESTRICTED', 'CLASSIFIED')) DEFAULT 'PUBLIC',
  image_url TEXT,
  metadata JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Location/Map dossiers
CREATE TABLE IF NOT EXISTS location_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  city TEXT CHECK (city IN ('crimson', 'silver')) NOT NULL,
  classification TEXT CHECK (classification IN ('PUBLIC', 'RESTRICTED', 'CLASSIFIED')) DEFAULT 'PUBLIC',
  image_url TEXT,
  coordinates JSONB,
  metadata JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crimson Ledger entries (admin-managed)
CREATE TABLE IF NOT EXISTS crimson_ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT 'Chronicles',
  read_time TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fragments of Lament entries (admin-managed, silver theme)
CREATE TABLE IF NOT EXISTS lament_fragments_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT 'Transmissions',
  read_time TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crimson Confessions (user submissions with tipping)
CREATE TABLE IF NOT EXISTS crimson_confessions (
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

-- Lament Submissions (user submissions with tipping, silver theme)
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

-- Tipping system
CREATE TABLE IF NOT EXISTS tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipper_id UUID REFERENCES profiles(id),
  submission_type TEXT CHECK (submission_type IN ('crimson_confession', 'lament_submission')) NOT NULL,
  submission_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Forum categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Forum threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES forum_categories(id),
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  parent_reply_id UUID REFERENCES forum_replies(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES product_categories(id),
  image_urls TEXT[],
  tags TEXT[],
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_digital BOOLEAN DEFAULT false,
  digital_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES (CREATE IF NOT EXISTS not supported, use DO block)
-- =============================================

DO $$
BEGIN
    -- Profiles indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND c.relname = 'idx_profiles_username') THEN
        CREATE INDEX idx_profiles_username ON profiles(username);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND c.relname = 'idx_profiles_city_affiliation') THEN
        CREATE INDEX idx_profiles_city_affiliation ON profiles(city_affiliation);
    END IF;

    -- Dossier indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND c.relname = 'idx_character_dossiers_city') THEN
        CREATE INDEX idx_character_dossiers_city ON character_dossiers(city);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND c.relname = 'idx_character_dossiers_classification') THEN
        CREATE INDEX idx_character_dossiers_classification ON character_dossiers(classification);
    END IF;

    -- Add more index checks as needed...
END $$;

-- =============================================
-- RLS POLICIES (Safe application)
-- =============================================

-- Enable RLS on tables that exist
DO $$
BEGIN
    -- Check if table exists before enabling RLS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'crimson_confessions') THEN
        ALTER TABLE crimson_confessions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'lament_submissions') THEN
        ALTER TABLE lament_submissions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Add more table checks as needed...
END $$;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- More policies...
DROP POLICY IF EXISTS "Users can create confessions" ON crimson_confessions;
DROP POLICY IF EXISTS "Approved confessions viewable by all" ON crimson_confessions;
DROP POLICY IF EXISTS "Users can create submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Approved submissions viewable by all" ON lament_submissions;

CREATE POLICY "Users can create confessions" ON crimson_confessions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Approved confessions viewable by all" ON crimson_confessions FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create submissions" ON lament_submissions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Approved submissions viewable by all" ON lament_submissions FOR SELECT USING (status = 'approved');

-- =============================================
-- INITIAL DATA (Only insert if not exists)
-- =============================================

-- Insert forum categories only if they don't exist
INSERT INTO forum_categories (name, description, color, display_order)
SELECT * FROM (VALUES
    ('Crimson Chronicles', 'Discussions about Crimson City affairs', 'gothic-crimson', 1),
    ('Silver Transmissions', 'Topics related to Silver Heights', 'gothic-silver', 2),
    ('The Convergence', 'Cross-city discussions and diplomacy', 'gothic-steel', 3),
    ('Unsolved Mysteries', 'Strange occurrences and investigations', 'purple-400', 4),
    ('General Discussion', 'Open forum for all topics', 'gothic-silver', 5)
) AS v(name, description, color, display_order)
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE forum_categories.name = v.name);

-- Insert product categories only if they don't exist
INSERT INTO product_categories (name, description, display_order)
SELECT * FROM (VALUES
    ('Apparel', 'Clothing and wearables', 1),
    ('Accessories', 'Pins, jewelry, and small items', 2),
    ('Collectibles', 'Art prints, posters, and collectible items', 3),
    ('Digital Goods', 'Digital downloads and virtual items', 4),
    ('Services', 'Custom services and experiences', 5)
) AS v(name, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM product_categories WHERE product_categories.name = v.name);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Create function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers and recreate (this is safe)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
DROP TRIGGER IF EXISTS update_character_dossiers_updated_at ON character_dossiers;
DROP TRIGGER IF EXISTS update_location_dossiers_updated_at ON location_dossiers;
DROP TRIGGER IF EXISTS update_crimson_ledger_updated_at ON crimson_ledger_entries;
DROP TRIGGER IF EXISTS update_lament_fragments_updated_at ON lament_fragments_entries;
DROP TRIGGER IF EXISTS update_crimson_confessions_updated_at ON crimson_confessions;
DROP TRIGGER IF EXISTS update_lament_submissions_updated_at ON lament_submissions;
DROP TRIGGER IF EXISTS update_forum_threads_updated_at ON forum_threads;
DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_dossiers_updated_at BEFORE UPDATE ON character_dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_dossiers_updated_at BEFORE UPDATE ON location_dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crimson_ledger_updated_at BEFORE UPDATE ON crimson_ledger_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lament_fragments_updated_at BEFORE UPDATE ON lament_fragments_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crimson_confessions_updated_at BEFORE UPDATE ON crimson_confessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lament_submissions_updated_at BEFORE UPDATE ON lament_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Schema installation completed! Tables, indexes, policies, and triggers have been safely applied.';
END $$;
