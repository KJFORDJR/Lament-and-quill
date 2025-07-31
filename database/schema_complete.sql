-- =============================================
-- LAMENT AND QUILL - CONSOLIDATED SCHEMA
-- =============================================
-- Single comprehensive schema based on actual Supabase database
-- Generated from database introspection on July 31, 2025
-- This schema includes ALL tables currently in your database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER SYSTEM
-- =============================================

-- User profiles (your largest table by data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  city_affiliation TEXT CHECK (city_affiliation IN ('Crimson', 'Silver', 'Neutral')) DEFAULT 'Neutral',
  bio TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMP WITH TIME ZONE,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Friendships system
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- Admin users table (separate from profiles)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ban history tracking
CREATE TABLE IF NOT EXISTS ban_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES profiles(id),
  ban_reason TEXT NOT NULL,
  ban_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ban_end TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- DOSSIER SYSTEM (World Building Content)
-- =============================================

-- Character dossiers
CREATE TABLE IF NOT EXISTS character_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  city TEXT CHECK (city IN ('Crimson', 'Silver', 'Unknown')) NOT NULL,
  classification TEXT CHECK (classification IN ('Citizen', 'Official', 'Enforcement', 'Underground', 'Unknown')) DEFAULT 'Citizen',
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT CHECK (status IN ('Active', 'Missing', 'Deceased', 'Unknown')) DEFAULT 'Active',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Location dossiers  
CREATE TABLE IF NOT EXISTS location_dossiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT CHECK (city IN ('Crimson', 'Silver', 'Border', 'Unknown')) NOT NULL,
  classification TEXT CHECK (classification IN ('Residential', 'Commercial', 'Industrial', 'Government', 'Restricted', 'Unknown')) DEFAULT 'Unknown',
  description TEXT NOT NULL,
  image_url TEXT,
  coordinates TEXT,
  access_level TEXT CHECK (access_level IN ('Public', 'Restricted', 'Classified')) DEFAULT 'Public',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Unified dossier entries (appears to be a consolidated table)
CREATE TABLE IF NOT EXISTS dossier_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('character', 'location', 'event', 'item')) NOT NULL,
  city TEXT CHECK (city IN ('Crimson', 'Silver', 'Border', 'Unknown')),
  classification TEXT,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ADMIN JOURNALS (Published Content)
-- =============================================

-- Crimson Ledger (admin-managed, crimson theme) - YOUR LARGEST TABLE
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

-- Fragments of Lament (admin-managed, silver theme)
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

-- Engagement systems for journals
CREATE TABLE IF NOT EXISTS lament_fragment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  fragment_id UUID REFERENCES lament_fragments_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, fragment_id)
);

CREATE TABLE IF NOT EXISTS crimson_ledger_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES crimson_ledger_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, entry_id)
);

-- =============================================
-- FORUM SYSTEM
-- =============================================

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

-- Forum likes system
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CHECK ((thread_id IS NOT NULL AND reply_id IS NULL) OR (thread_id IS NULL AND reply_id IS NOT NULL))
);

-- =============================================
-- MERCHANDISE SYSTEM  
-- =============================================

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Legacy products table (if still used)
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

-- Current merchandise table (main product table)
CREATE TABLE IF NOT EXISTS merchandise (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_urls TEXT[],
  tags TEXT[],
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  category TEXT DEFAULT 'General',
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_digital BOOLEAN DEFAULT false,
  digital_content JSONB,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  merchandise_id UUID REFERENCES merchandise(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, merchandise_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  tracking_number TEXT,
  notes TEXT,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  merchandise_id UUID REFERENCES merchandise(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ANNOUNCEMENTS SYSTEM
-- =============================================

-- Site-wide announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  show_to_all BOOLEAN DEFAULT true,
  target_roles TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- TIPPING SYSTEM (Legacy - appears unused)
-- =============================================

-- Tips table (minimal data, possibly unused)
CREATE TABLE IF NOT EXISTS tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipper_id UUID REFERENCES profiles(id),
  submission_type TEXT,
  submission_id UUID,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- SYSTEM CONFIGURATION
-- =============================================

-- System-wide configuration
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_title TEXT DEFAULT 'Lament and Quill',
  site_description TEXT DEFAULT 'Two cities. Two Ghosts. One reckoning.',
  maintenance_mode BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  forum_enabled BOOLEAN DEFAULT true,
  marketplace_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  ads_enabled BOOLEAN DEFAULT false,
  max_file_size INTEGER DEFAULT 5,
  session_timeout INTEGER DEFAULT 30,
  backup_frequency TEXT DEFAULT 'daily',
  admin_email TEXT,
  analytics_enabled BOOLEAN DEFAULT true,
  debug_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User system indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_city_affiliation ON profiles(city_affiliation);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_ban_history_user ON ban_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ban_history_active ON ban_history(is_active);

-- Dossier indexes
CREATE INDEX IF NOT EXISTS idx_character_dossiers_city ON character_dossiers(city);
CREATE INDEX IF NOT EXISTS idx_character_dossiers_classification ON character_dossiers(classification);
CREATE INDEX IF NOT EXISTS idx_location_dossiers_city ON location_dossiers(city);
CREATE INDEX IF NOT EXISTS idx_location_dossiers_classification ON location_dossiers(classification);
CREATE INDEX IF NOT EXISTS idx_dossier_entries_type ON dossier_entries(type);
CREATE INDEX IF NOT EXISTS idx_dossier_entries_published ON dossier_entries(is_published, published_at DESC);

-- Journal indexes
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_published ON crimson_ledger_entries(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_lament_fragments_published ON lament_fragments_entries(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_lament_fragment_likes_fragment ON lament_fragment_likes(fragment_id);
CREATE INDEX IF NOT EXISTS idx_crimson_ledger_likes_entry ON crimson_ledger_likes(entry_id);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON forum_threads(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_likes_thread ON forum_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_reply ON forum_likes(reply_id);

-- Merchandise indexes
CREATE INDEX IF NOT EXISTS idx_merchandise_in_stock ON merchandise(in_stock, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ban_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crimson_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lament_fragments_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lament_fragment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crimson_ledger_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- User system policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own friendships" ON friendships FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Dossier policies (public content)
CREATE POLICY "Dossiers are viewable by everyone" ON character_dossiers FOR SELECT USING (true);
CREATE POLICY "Dossiers are viewable by everyone" ON location_dossiers FOR SELECT USING (true);
CREATE POLICY "Published dossier entries viewable by all" ON dossier_entries FOR SELECT USING (is_published = true);

-- Journal policies
CREATE POLICY "Published ledger entries viewable by all" ON crimson_ledger_entries FOR SELECT USING (is_published = true);
CREATE POLICY "Published lament entries viewable by all" ON lament_fragments_entries FOR SELECT USING (is_published = true);

-- Engagement policies
CREATE POLICY "Users can view all likes" ON lament_fragment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON lament_fragment_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all ledger likes" ON crimson_ledger_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own ledger likes" ON crimson_ledger_likes FOR ALL USING (auth.uid() = user_id);

-- Forum policies
CREATE POLICY "Forum categories viewable by all" ON forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Forum threads viewable by all" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Forum replies viewable by all" ON forum_replies FOR SELECT USING (is_deleted = false);
CREATE POLICY "Users can manage their own forum likes" ON forum_likes FOR ALL USING (auth.uid() = user_id);

-- Merchandise policies
CREATE POLICY "Product categories viewable by all" ON product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Products viewable by all" ON products FOR SELECT USING (true);
CREATE POLICY "Merchandise viewable by all" ON merchandise FOR SELECT USING (true);

-- Cart and order policies
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- System policies
CREATE POLICY "Active announcements viewable by all" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "System config readable by all" ON system_config FOR SELECT USING (true);

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

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    new_number := 'LQ' || to_char(NOW(), 'YYYYMMDD');
    SELECT COUNT(*) + 1 INTO counter
    FROM orders 
    WHERE order_number LIKE new_number || '%';
    new_number := new_number || lpad(counter::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_dossiers_updated_at BEFORE UPDATE ON character_dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_dossiers_updated_at BEFORE UPDATE ON location_dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dossier_entries_updated_at BEFORE UPDATE ON dossier_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crimson_ledger_updated_at BEFORE UPDATE ON crimson_ledger_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lament_fragments_updated_at BEFORE UPDATE ON lament_fragments_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchandise_updated_at BEFORE UPDATE ON merchandise FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order number generation trigger
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger 
    BEFORE INSERT ON orders 
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- =============================================
-- COMPLETE - CONSOLIDATED SCHEMA
-- =============================================
-- This schema includes ALL 24 tables from your current Supabase database:
-- 
-- USER SYSTEM (5 tables):
-- ✅ profiles - User accounts and profiles
-- ✅ friendships - Social connections
-- ✅ admin_users - Admin role management  
-- ✅ ban_history - Ban tracking
-- ✅ tips - Tipping system (legacy)
--
-- CONTENT SYSTEM (6 tables):
-- ✅ character_dossiers - Character profiles
-- ✅ location_dossiers - Location information
-- ✅ dossier_entries - Unified dossier system
-- ✅ crimson_ledger_entries - Crimson admin journal (largest table)
-- ✅ lament_fragments_entries - Silver admin journal
-- ✅ announcements - Site announcements
--
-- ENGAGEMENT SYSTEM (3 tables):
-- ✅ lament_fragment_likes - Silver journal likes
-- ✅ crimson_ledger_likes - Crimson journal likes
-- ✅ forum_likes - Forum engagement
--
-- FORUM SYSTEM (3 tables):
-- ✅ forum_categories - Discussion categories
-- ✅ forum_threads - Discussion topics
-- ✅ forum_replies - Thread responses
--
-- COMMERCE SYSTEM (6 tables):
-- ✅ product_categories - Product organization
-- ✅ products - Legacy product table
-- ✅ merchandise - Current product table
-- ✅ cart_items - Shopping cart
-- ✅ orders - Purchase orders (2nd largest table)
-- ✅ order_items - Order line items
--
-- SYSTEM (1 table):
-- ✅ system_config - Application configuration
--
-- Based on table sizes from your CSV:
-- - crimson_ledger_entries: 208 kB (most content)
-- - orders: 192 kB (active e-commerce)
-- - forum_threads: 176 kB (active discussions)
-- - All other tables are smaller, indicating moderate usage
--
-- This is your SINGLE, COMPLETE schema file!
-- No more juggling multiple SQL files - everything is here.
