-- Forum Database Schema (Clean Version)
-- Run this in your Supabase SQL editor
-- This version handles existing tables and missing columns

-- Drop existing tables if they exist (to start clean)
DROP TABLE IF EXISTS forum_likes CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;  
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP VIEW IF EXISTS forum_stats CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_thread_like_count() CASCADE;
DROP FUNCTION IF EXISTS update_thread_reply_count() CASCADE;

-- Create forum_threads table
CREATE TABLE forum_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'crimson', 'silver', 'convergence', 'mysteries')),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    latest_reply_id UUID,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_deleted BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_likes table
CREATE TABLE forum_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_like_target CHECK (
        (thread_id IS NOT NULL AND reply_id IS NULL) OR 
        (thread_id IS NULL AND reply_id IS NOT NULL)
    ),
    CONSTRAINT unique_thread_like UNIQUE (user_id, thread_id),
    CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- Add foreign key constraint for latest_reply_id
ALTER TABLE forum_threads 
ADD CONSTRAINT fk_latest_reply 
FOREIGN KEY (latest_reply_id) REFERENCES forum_replies(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_activity ON forum_threads(last_activity_at);
CREATE INDEX idx_forum_threads_created ON forum_threads(created_at);
CREATE INDEX idx_forum_threads_pinned ON forum_threads(is_pinned);
CREATE INDEX idx_forum_threads_deleted ON forum_threads(is_deleted);

CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent ON forum_replies(parent_reply_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at);
CREATE INDEX idx_forum_replies_deleted ON forum_replies(is_deleted);

CREATE INDEX idx_forum_likes_user ON forum_likes(user_id);
CREATE INDEX idx_forum_likes_thread ON forum_likes(thread_id);
CREATE INDEX idx_forum_likes_reply ON forum_likes(reply_id);

-- Add last_seen column to profiles for online status tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create triggers to update like counts automatically
CREATE OR REPLACE FUNCTION update_thread_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.thread_id IS NOT NULL THEN
        UPDATE forum_threads 
        SET like_count = like_count + 1 
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' AND OLD.thread_id IS NOT NULL THEN
        UPDATE forum_threads 
        SET like_count = GREATEST(like_count - 1, 0) 
        WHERE id = OLD.thread_id;
    END IF;
    
    IF TG_OP = 'INSERT' AND NEW.reply_id IS NOT NULL THEN
        UPDATE forum_replies 
        SET like_count = like_count + 1 
        WHERE id = NEW.reply_id;
    ELSIF TG_OP = 'DELETE' AND OLD.reply_id IS NOT NULL THEN
        UPDATE forum_replies 
        SET like_count = GREATEST(like_count - 1, 0) 
        WHERE id = OLD.reply_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for like count updates
CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR DELETE ON forum_likes
    FOR EACH ROW EXECUTE FUNCTION update_thread_like_count();

-- Create trigger function to update reply counts
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_threads 
        SET reply_count = reply_count + 1,
            latest_reply_id = NEW.id,
            last_activity_at = NEW.created_at
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_threads 
        SET reply_count = GREATEST(reply_count - 1, 0)
        WHERE id = OLD.thread_id;
        
        -- Update latest_reply_id to the most recent reply
        UPDATE forum_threads 
        SET latest_reply_id = (
            SELECT id FROM forum_replies 
            WHERE thread_id = OLD.thread_id 
            AND is_deleted = false 
            ORDER BY created_at DESC 
            LIMIT 1
        ),
        last_activity_at = COALESCE((
            SELECT created_at FROM forum_replies 
            WHERE thread_id = OLD.thread_id 
            AND is_deleted = false 
            ORDER BY created_at DESC 
            LIMIT 1
        ), last_activity_at)
        WHERE id = OLD.thread_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply count updates
CREATE TRIGGER trigger_update_reply_count
    AFTER INSERT OR DELETE ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Enable Row Level Security (RLS)
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for forum_threads
CREATE POLICY "Anyone can view non-deleted threads" ON forum_threads
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own threads" ON forum_threads
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" ON forum_threads
    FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for forum_replies
CREATE POLICY "Anyone can view non-deleted replies" ON forum_replies
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own replies" ON forum_replies
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies" ON forum_replies
    FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for forum_likes
CREATE POLICY "Users can view all likes" ON forum_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON forum_likes
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

-- Create a view for forum statistics
CREATE VIEW forum_stats AS
SELECT 
    (SELECT COUNT(*) FROM forum_threads WHERE is_deleted = false) as active_threads,
    (SELECT COUNT(*) FROM profiles) as registered_users,
    (SELECT COUNT(*) FROM forum_threads WHERE created_at >= CURRENT_DATE) + 
    (SELECT COUNT(*) FROM forum_replies WHERE created_at >= CURRENT_DATE) as daily_posts,
    (SELECT COUNT(*) FROM profiles WHERE last_seen >= NOW() - INTERVAL '15 minutes') as online_users;

-- Grant access to the view
GRANT SELECT ON forum_stats TO anon, authenticated;

-- Insert some sample data for testing (optional)
INSERT INTO forum_threads (title, content, category, author_id) VALUES
('Welcome to the Forum', 'This is the first thread in our new forum system!', 'general', 
 (SELECT id FROM profiles LIMIT 1));
