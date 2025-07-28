'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, ThumbsUp, Eye, Clock, Pin, Plus, Search, Heart, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    city_affiliation: string;
    user_role: string;
  };
  latest_reply?: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      city_affiliation: string;
    };
  };
}

interface Profile {
  id: string;
  username: string;
  city_affiliation: string;
  user_role: string;
}

interface ForumStats {
  totalThreads: number;
  totalReplies: number;
  onlineUsers: number;
}

export default function ForumPage() {
  const { user } = useUser();
  
  // State
  const [threads, setThreads] = useState<Thread[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ForumStats>({
    totalThreads: 0,
    totalReplies: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  // Update user's last_seen timestamp for online status tracking
  useEffect(() => {
    const updateLastSeen = async () => {
      if (!user) return;
      
      try {
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating last_seen:', error);
      }
    };

    updateLastSeen();
    
    // Update last_seen every 5 minutes while on the forum page
    const interval = setInterval(updateLastSeen, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Load threads and stats
  useEffect(() => {
    fetchThreads();
    fetchStats();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles:author_id (
            id,
            username,
            city_affiliation,
            user_role
          ),
          latest_reply:forum_replies!thread_id (
            id,
            content,
            created_at,
            profiles:author_id (
              username,
              city_affiliation
            )
          )
        `)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Use the dedicated forum stats API that properly calculates online users
      console.log('🔍 Fetching forum stats from API...');
      const response = await fetch('/api/forum/stats');
      const data = await response.json();
      
      console.log('📊 Forum stats API response:', { 
        status: response.status, 
        ok: response.ok, 
        data 
      });
      
      if (response.ok && data.activeThreads !== undefined) {
        console.log('✅ Using API stats:', {
          totalThreads: data.activeThreads,
          totalReplies: data.totalReplies,
          onlineUsers: data.onlineUsers
        });
        
        setStats({
          totalThreads: data.activeThreads || 0,
          totalReplies: data.totalReplies || 0,
          onlineUsers: data.onlineUsers || 0
        });
      } else {
        console.log('⚠️ API failed, using fallback queries...');
        // Fallback to individual queries if API fails
        const [threadsCount, repliesCount] = await Promise.all([
          supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false),
          supabase
            .from('forum_replies')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
        ]);

        console.log('📊 Fallback stats:', {
          totalThreads: threadsCount.count,
          totalReplies: repliesCount.count,
          onlineUsers: 0
        });

        setStats({
          totalThreads: threadsCount.count || 0,
          totalReplies: repliesCount.count || 0,
          onlineUsers: 0 // No fallback for online users without API
        });
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Fallback to basic counts
      try {
        console.log('🔄 Attempting final fallback...');
        const [threadsCount, repliesCount] = await Promise.all([
          supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false),
          supabase
            .from('forum_replies')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
        ]);

        console.log('📊 Final fallback stats:', {
          totalThreads: threadsCount.count,
          totalReplies: repliesCount.count,
          onlineUsers: 0
        });

        setStats({
          totalThreads: threadsCount.count || 0,
          totalReplies: repliesCount.count || 0,
          onlineUsers: 0
        });
      } catch (fallbackError) {
        console.error('❌ Error in fallback stats fetch:', fallbackError);
      }
    }
  };

  // Helper functions
  const getCityColor = (cityAffiliation: string) => {
    switch (cityAffiliation?.toLowerCase()) {
      case 'crimson_city':
        return 'text-gothic-crimson';
      case 'silver_city':
        return 'text-gothic-silver';
      case 'general':
      default:
        return 'text-gothic-steel';
    }
  };

  const getCityBadge = (cityAffiliation: string) => {
    switch (cityAffiliation?.toLowerCase()) {
      case 'crimson_city':
        return 'bg-gothic-crimson/20 text-gothic-crimson';
      case 'silver_city':
        return 'bg-gothic-silver/20 text-gothic-silver';
      case 'general':
      default:
        return 'bg-gothic-steel/20 text-gothic-steel';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user && profile?.user_role === 'admin';
  };

  // Filter threads based on search and category
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || thread.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort threads: pinned first, then by last activity
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
  });

  // Delete thread (Admin or Author)
  const deleteThread = async (threadId: string, authorId: string) => {
    if (!user || (user.id !== authorId && profile?.user_role !== 'admin')) return;
    if (!window.confirm('Are you sure you want to delete this thread?')) return;

    try {
      const response = await fetch(`/api/forum/threads/${threadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: user.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete thread');
      }
      
      // Remove from local state immediately for better UX
      setThreads(prev => prev.filter(thread => thread.id !== threadId));
      fetchStats(); // Update stats
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread. Please try again.');
    }
  };

  // Pin/Unpin thread function (Admin only)
  const togglePinThread = async (threadId: string, currentPinStatus: boolean) => {
    if (!user || !isAdmin()) return;

    try {
      const response = await fetch(`/api/forum/threads/${threadId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_pinned: !currentPinStatus,
          admin_user_id: user.id
        })
      });

      if (response.ok) {
        // Update the thread in local state
        setThreads(prev => prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, is_pinned: !currentPinStatus }
            : thread
        ));
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gothic-charcoal text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-gothic text-gothic-silver mb-4">
            The Ledger and the Lament
          </h1>
          <p className="text-xl text-gothic-steel max-w-2xl mx-auto">
            Where the voices of both cities converge in digital discourse
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gothic-dark-gray/20 p-6 rounded-lg border border-gothic-dark-gray/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-gothic text-gothic-silver">{stats.totalThreads}</h3>
                <p className="text-gothic-steel">Discussions</p>
              </div>
              <MessageSquare size={32} className="text-gothic-crimson" />
            </div>
          </div>
          
          <div className="bg-gothic-dark-gray/20 p-6 rounded-lg border border-gothic-dark-gray/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-gothic text-gothic-silver">{stats.totalReplies}</h3>
                <p className="text-gothic-steel">Total Replies</p>
              </div>
              <ThumbsUp size={32} className="text-gothic-silver" />
            </div>
          </div>
          
          <div className="bg-gothic-dark-gray/20 p-6 rounded-lg border border-gothic-dark-gray/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-gothic text-gothic-silver">{stats.onlineUsers}</h3>
                <p className="text-gothic-steel">Citizens Online</p>
              </div>
              <Users size={32} className="text-gothic-steel" />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gothic-steel" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded pl-10 pr-4 py-2 text-white focus:outline-none focus:border-gothic-silver"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gothic-dark-gray border border-gothic-dark-gray rounded px-4 py-2 text-white focus:outline-none focus:border-gothic-silver"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="crimson_affairs">Crimson Affairs</option>
            <option value="silver_matters">Silver Matters</option>
            <option value="inter_city">Inter-City</option>
            <option value="announcements">Announcements</option>
          </select>

          {/* Create Thread Button */}
          {user && (
            <Link
              href="/forum/create"
              className="cyber-button flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              New Discussion
            </Link>
          )}
        </motion.div>

        {/* Threads List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gothic-silver mx-auto mb-4"></div>
              <p className="text-gothic-steel">Loading discussions...</p>
            </div>
          ) : sortedThreads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel">No threads found in this category.</p>
            </div>
          ) : (
            sortedThreads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                <div className="bg-gothic-dark-gray/20 hover:bg-gothic-dark-gray/40 p-6 rounded-lg border border-gothic-dark-gray/30 hover:border-gothic-silver/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <Link href={`/forum/${thread.id}`} className="flex-1 cursor-pointer">
                      <div>
                        {/* Title and Badges */}
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          {thread.is_pinned && (
                            <Pin size={16} className="text-yellow-400" />
                          )}
                          <h3 className="text-xl font-gothic font-bold text-gothic-silver group-hover:text-white transition-colors">
                            {thread.title}
                          </h3>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gothic-steel text-sm mb-4 leading-relaxed">
                          {thread.content.length > 200 
                            ? `${thread.content.substring(0, 200)}...`
                            : thread.content
                          }
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gothic-steel">
                          <div className="flex items-center">
                            <span className={`font-medium ${getCityColor(thread.profiles?.city_affiliation || 'general')}`}>
                              {thread.profiles?.username || 'Unknown User'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getCityBadge(thread.profiles?.city_affiliation || 'general')}`}>
                            {thread.category}
                          </span>
                          <div className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {thread.view_count}
                          </div>
                          <div className="flex items-center">
                            <Heart size={14} className="mr-1" />
                            {thread.like_count}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            {thread.reply_count}
                          </div>
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatTimeAgo(thread.last_activity_at)}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Admin Actions */}
                    {isAdmin() && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinThread(thread.id, thread.is_pinned);
                          }}
                          className={`transition-colors p-1 ${
                            thread.is_pinned 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gothic-steel hover:text-yellow-400'
                          }`}
                          title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                        >
                          <Pin size={16} fill={thread.is_pinned ? 'currentColor' : 'none'} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id, thread.author_id);
                          }}
                          className="text-gothic-steel hover:text-gothic-crimson transition-colors p-1"
                          title="Delete thread"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
