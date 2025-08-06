-- ============================================
-- NEWSLETTER SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- =====================    SELECT json_build_object(
        'total_subscribers', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_subscribed = true),
        'total_unsubscribed', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_subscribed = false),
        'total_campaigns', (SELECT COUNT(*) FROM newsletter_campaigns),
        'campaigns_sent', (SELECT COUNT(*) FROM newsletter_campaigns WHERE status = 'sent'),
        'last_campaign_date', (SELECT MAX(sent_at) FROM newsletter_campaigns WHERE status = 'sent')
    ) INTO stats;================

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_subscribed BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{
        "new_posts": true,
        "newsletters": true, 
        "announcements": true
    }'::jsonb,
    subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribe_date TIMESTAMP WITH TIME ZONE,
    unsubscribe_token UUID DEFAULT gen_random_uuid(),
    subscription_source VARCHAR(50) DEFAULT 'registration', -- 'registration', 'profile', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one subscription per user
    UNIQUE(user_id)
);

-- Create newsletter_campaigns table for tracking sent emails
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'html', -- 'html' or 'text'
    sender_id UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sending', 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_delivery_log for tracking individual email deliveries
CREATE TABLE IF NOT EXISTS newsletter_delivery_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscriptions
CREATE POLICY "Users can view their own subscription" ON newsletter_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription" ON newsletter_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON newsletter_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can manage all subscriptions" ON newsletter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for newsletter_campaigns
CREATE POLICY "Admins can manage campaigns" ON newsletter_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for newsletter_delivery_log
CREATE POLICY "Admins can view delivery logs" ON newsletter_delivery_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_role IN ('admin', 'moderator')
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_user_id ON newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_is_subscribed ON newsletter_subscriptions(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_delivery_log_campaign_id ON newsletter_delivery_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_delivery_log_status ON newsletter_delivery_log(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at 
    BEFORE UPDATE ON newsletter_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at 
    BEFORE UPDATE ON newsletter_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get subscription stats
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_subscribers', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = true),
        'total_unsubscribed', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE is_active = false),
        'total_campaigns', (SELECT COUNT(*) FROM newsletter_campaigns),
        'campaigns_sent', (SELECT COUNT(*) FROM newsletter_campaigns WHERE status = 'sent'),
        'last_campaign_date', (SELECT MAX(sent_at) FROM newsletter_campaigns WHERE status = 'sent')
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the stats function
GRANT EXECUTE ON FUNCTION get_newsletter_stats() TO authenticated;

COMMENT ON TABLE newsletter_subscriptions IS 'Stores user newsletter subscription preferences';
COMMENT ON TABLE newsletter_campaigns IS 'Stores newsletter campaigns and their metadata';
COMMENT ON TABLE newsletter_delivery_log IS 'Logs individual email delivery attempts and results';
COMMENT ON FUNCTION get_newsletter_stats() IS 'Returns newsletter system statistics';
