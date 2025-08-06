'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, 
  Plus, 
  Send, 
  Eye, 
  Users, 
  Calendar, 
  ArrowLeft,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  content_type: string;
  sender_id: string;
  sent_at: string | null;
  recipient_count: number;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}

interface NewsletterStats {
  total_subscribers: number;
  total_unsubscribed: number;
  total_campaigns: number;
  campaigns_sent: number;
  last_campaign_date: string | null;
}

export default function NewsletterAdmin() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subject: '',
    content: '',
    content_type: 'html'
  });
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchStats();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/newsletter');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.title || !newCampaign.subject || !newCampaign.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCampaign,
          sender_id: user?.id
        }),
      });

      if (response.ok) {
        setNewCampaign({ title: '', subject: '', content: '', content_type: 'html' });
        setShowCreateForm(false);
        fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`Error creating campaign: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const sendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this newsletter to all subscribers?')) {
      return;
    }

    setSending(campaignId);
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          campaign_id: campaignId,
          sender_id: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchCampaigns();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Error sending campaign: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    } finally {
      setSending(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText size={16} className="text-gothic-steel" />;
      case 'sending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'sent':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <FileText size={16} className="text-gothic-steel" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading newsletter management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="text-gothic-steel hover:text-gothic-silver transition-colors mr-4"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-gothic font-bold text-gothic-silver mb-2">
                  Newsletter Management
                </h1>
                <p className="text-gothic-steel">
                  Manage newsletter campaigns and subscriber communications
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="cyber-button flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New Campaign</span>
            </button>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="gothic-container p-4 text-center">
                <Users size={24} className="text-gothic-crimson mx-auto mb-2" />
                <div className="text-2xl font-bold text-gothic-silver">{stats.total_subscribers}</div>
                <div className="text-sm text-gothic-steel">Active Subscribers</div>
              </div>
              <div className="gothic-container p-4 text-center">
                <Mail size={24} className="text-gothic-silver mx-auto mb-2" />
                <div className="text-2xl font-bold text-gothic-silver">{stats.total_campaigns}</div>
                <div className="text-sm text-gothic-steel">Total Campaigns</div>
              </div>
              <div className="gothic-container p-4 text-center">
                <Send size={24} className="text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gothic-silver">{stats.campaigns_sent}</div>
                <div className="text-sm text-gothic-steel">Campaigns Sent</div>
              </div>
              <div className="gothic-container p-4 text-center">
                <BarChart3 size={24} className="text-gothic-steel mx-auto mb-2" />
                <div className="text-2xl font-bold text-gothic-silver">{stats.total_unsubscribed}</div>
                <div className="text-sm text-gothic-steel">Unsubscribed</div>
              </div>
              <div className="gothic-container p-4 text-center">
                <Calendar size={24} className="text-gothic-steel mx-auto mb-2" />
                <div className="text-sm font-bold text-gothic-silver">
                  {stats.last_campaign_date ? 
                    new Date(stats.last_campaign_date).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-gothic-steel">Last Campaign</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Create Campaign Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 gothic-container p-6"
          >
            <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
              Create New Campaign
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-crimson"
                    placeholder="Enter campaign title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-crimson"
                    placeholder="Email subject line"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Content
                </label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-crimson"
                  placeholder="Newsletter content (HTML supported)"
                  rows={8}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="cyber-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  className="cyber-button"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaigns List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gothic-container p-6"
        >
          <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-6">
            Newsletter Campaigns
          </h2>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel mb-4">No campaigns created yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="cyber-button"
              >
                Create First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gothic-dark-gray rounded-lg p-4 hover:border-gothic-steel transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(campaign.status)}
                        <h3 className="font-medium text-gothic-silver">{campaign.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                          campaign.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gothic-steel/20 text-gothic-steel'
                        }`}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gothic-steel text-sm mb-2">
                        Subject: {campaign.subject}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gothic-steel">
                        <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                        {campaign.sent_at && (
                          <span>Sent: {new Date(campaign.sent_at).toLocaleDateString()}</span>
                        )}
                        {campaign.recipient_count > 0 && (
                          <span>Recipients: {campaign.recipient_count}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => sendCampaign(campaign.id)}
                          disabled={sending === campaign.id}
                          className="cyber-button-secondary text-sm flex items-center space-x-1"
                        >
                          <Send size={14} />
                          <span>{sending === campaign.id ? 'Sending...' : 'Send'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
