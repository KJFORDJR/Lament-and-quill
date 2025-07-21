-- Lament and Quill Database Schema
-- This file contains all the SQL statements needed to set up your Supabase database

-- Enable Row Level Security (RLS) and UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
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
CREATE TABLE friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- =============================================
-- DOSSIER SYSTEM
-- =============================================

-- Character dossiers
CREATE TABLE character_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  city TEXT CHECK (city IN ('crimson', 'silver')) NOT NULL,
  classification TEXT CHECK (classification IN ('PUBLIC', 'RESTRICTED', 'CLASSIFIED')) DEFAULT 'PUBLIC',
  image_url TEXT,
  metadata JSONB, -- Additional character data
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Location/Map dossiers
CREATE TABLE location_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  city TEXT CHECK (city IN ('crimson', 'silver')) NOT NULL,
  classification TEXT CHECK (classification IN ('PUBLIC', 'RESTRICTED', 'CLASSIFIED')) DEFAULT 'PUBLIC',
  image_url TEXT,
  coordinates JSONB, -- Map coordinates if needed
  metadata JSONB, -- Additional location data
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- JOURNAL SYSTEMS (LEDGERS)
-- =============================================

-- Crimson Ledger entries (admin-managed)
CREATE TABLE crimson_ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL, -- Display name (e.g., "The Red Scribe")
  category TEXT DEFAULT 'Chronicles',
  read_time TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fragments of Lament entries (admin-managed, silver theme)
CREATE TABLE lament_fragments_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL, -- Display name (e.g., "Silver Chronicler")
  category TEXT DEFAULT 'Transmissions',
  read_time TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- USER SUBMISSIONS SYSTEM
-- =============================================

-- Crimson Confessions (user submissions with tipping)
CREATE TABLE crimson_confessions (
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
CREATE TABLE lament_submissions (
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
CREATE TABLE tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipper_id UUID REFERENCES profiles(id),
  submission_type TEXT CHECK (submission_type IN ('crimson_confession', 'lament_submission')) NOT NULL,
  submission_id UUID NOT NULL, -- References either crimson_confessions.id or lament_submissions.id
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- FORUM SYSTEM
-- =============================================

-- Forum categories
CREATE TABLE forum_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- For UI theming
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Forum threads
CREATE TABLE forum_threads (
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
CREATE TABLE forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  parent_reply_id UUID REFERENCES forum_replies(id), -- For nested replies
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- MERCHANDISE SYSTEM
-- =============================================

-- Product categories
CREATE TABLE product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- For sale prices
  category_id UUID REFERENCES product_categories(id),
  image_urls TEXT[], -- Array of image URLs
  tags TEXT[],
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_digital BOOLEAN DEFAULT false,
  digital_content JSONB, -- For digital products
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders
CREATE TABLE orders (
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
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_city_affiliation ON profiles(city_affiliation);

-- Dossier indexes
CREATE INDEX idx_character_dossiers_city ON character_dossiers(city);
CREATE INDEX idx_character_dossiers_classification ON character_dossiers(classification);
CREATE INDEX idx_location_dossiers_city ON location_dossiers(city);
CREATE INDEX idx_location_dossiers_classification ON location_dossiers(classification);

-- Journal indexes
CREATE INDEX idx_crimson_ledger_published ON crimson_ledger_entries(is_published, published_at DESC);
CREATE INDEX idx_lament_fragments_published ON lament_fragments_entries(is_published, published_at DESC);

-- Submission indexes
CREATE INDEX idx_crimson_confessions_status ON crimson_confessions(status);
CREATE INDEX idx_crimson_confessions_tips ON crimson_confessions(tip_count DESC, total_tip_amount DESC);
CREATE INDEX idx_lament_submissions_status ON lament_submissions(status);
CREATE INDEX idx_lament_submissions_tips ON lament_submissions(tip_count DESC, total_tip_amount DESC);

-- Forum indexes
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_activity ON forum_threads(last_reply_at DESC);
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id, created_at);

-- Product indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(in_stock, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crimson_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lament_fragments_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crimson_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lament_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)

-- Profiles: Users can view all profiles but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Dossiers: Public content viewable by all, admin-only editing
CREATE POLICY "Dossiers are viewable by everyone" ON character_dossiers FOR SELECT USING (true);
CREATE POLICY "Dossiers are viewable by everyone" ON location_dossiers FOR SELECT USING (true);

-- Ledger entries: Published entries viewable by all
CREATE POLICY "Published ledger entries viewable by all" ON crimson_ledger_entries FOR SELECT USING (is_published = true);
CREATE POLICY "Published lament entries viewable by all" ON lament_fragments_entries FOR SELECT USING (is_published = true);

-- User submissions: Users can create and view approved submissions
CREATE POLICY "Users can create confessions" ON crimson_confessions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Approved confessions viewable by all" ON crimson_confessions FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create submissions" ON lament_submissions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Approved submissions viewable by all" ON lament_submissions FOR SELECT USING (status = 'approved');

-- Forum: Public reading, authenticated posting
CREATE POLICY "Forum categories viewable by all" ON forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Forum threads viewable by all" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Forum replies viewable by all" ON forum_replies FOR SELECT USING (is_deleted = false);

-- Products: Public viewing
CREATE POLICY "Products viewable by all" ON products FOR SELECT USING (true);
CREATE POLICY "Product categories viewable by all" ON product_categories FOR SELECT USING (is_active = true);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert forum categories
INSERT INTO forum_categories (name, description, color, display_order) VALUES
('Crimson Chronicles', 'Discussions about Crimson City affairs', 'gothic-crimson', 1),
('Silver Transmissions', 'Topics related to Silver Heights', 'gothic-silver', 2),
('The Convergence', 'Cross-city discussions and diplomacy', 'gothic-steel', 3),
('Unsolved Mysteries', 'Strange occurrences and investigations', 'purple-400', 4),
('General Discussion', 'Open forum for all topics', 'gothic-silver', 5);

-- Insert product categories
INSERT INTO product_categories (name, description, display_order) VALUES
('Apparel', 'Clothing and wearables', 1),
('Accessories', 'Pins, jewelry, and small items', 2),
('Collectibles', 'Art prints, posters, and collectible items', 3),
('Digital Goods', 'Digital downloads and virtual items', 4),
('Services', 'Custom services and experiences', 5);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
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
