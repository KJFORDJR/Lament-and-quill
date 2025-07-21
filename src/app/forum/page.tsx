'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, ThumbsUp, Eye, Clock, Pin, Star, Plus, Search, Heart, Reply, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { createPortal } from 'react-dom';

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
    created_at: string;
    profiles: {
      username: string;
    };
  };
}

interface Reply {
  id: string;
  thread_id: string;
  parent_reply_id: string | null;
  content: string;
  author_id: string;
  like_count: number;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    city_affiliation: string;
    user_role: string;
    created_at: string;
  };
}

interface ForumStats {
  activeThreads: number;
  registeredUsers: number;
  dailyPosts: number;
  onlineUsers: number;
}

export default function Forum() {
  const { user, profile } = useUser();
  const [activeCategory, setActiveCategory] = useState('all');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    activeThreads: 0,
    registeredUsers: 0,
    dailyPosts: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [threadReplies, setThreadReplies] = useState<Reply[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newReply, setNewReply] = useState('');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Discussions', color: 'gothic-silver' },
    { id: 'general', label: 'General', color: 'gothic-steel' },
    { id: 'crimson', label: 'Crimson Chronicles', color: 'gothic-crimson' },
    { id: 'silver', label: 'Silver Transmissions', color: 'gothic-silver' },
    { id: 'convergence', label: 'The Convergence', color: 'gothic-steel' },
    { id: 'mysteries', label: 'Unsolved Mysteries', color: 'purple-400' }
  ];

  useEffect(() => {
    fetchForumData();
  }, [activeCategory]);

  useEffect(() => {
    if (user) {
      updateUserLastSeen();
    }
  }, [user]);

  const updateUserLastSeen = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/forum/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch threads
      const threadsUrl = activeCategory === 'all' 
        ? '/api/forum/threads'
        : `/api/forum/threads?category=${activeCategory}`;
      
      const threadsResponse = await fetch(threadsUrl);
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.data || []);
      }

      // Fetch user's likes if logged in
      if (user) {
        await fetchUserLikes();
      }
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const { data: likes, error } = await supabase
        .from('forum_likes')
        .select('thread_id, reply_id')
        .eq('user_id', user.id);

      if (!error && likes) {
        const likedSet = new Set<string>();
        likes.forEach(like => {
          if (like.thread_id) likedSet.add(`thread_${like.thread_id}`);
          if (like.reply_id) likedSet.add(`reply_${like.reply_id}`);
        });
        setLikedItems(likedSet);
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThread.title.trim() || !newThread.content.trim()) return;

    try {
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newThread,
          author_id: user.id
        })
      });

      if (response.ok) {
        setNewThread({ title: '', content: '', category: 'general' });
        setShowCreateModal(false);
        fetchForumData();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedThread || !newReply.trim()) return;

    try {
      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: selectedThread.id,
          content: newReply,
          author_id: user.id
        })
      });

      if (response.ok) {
        setNewReply('');
        fetchThreadReplies(selectedThread.id);
        fetchForumData(); // Refresh to update reply counts
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleLike = async (type: 'thread' | 'reply', id: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/forum/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          [type === 'thread' ? 'thread_id' : 'reply_id']: id
        })
      });

      if (response.ok) {
        const { liked } = await response.json();
        const key = `${type}_${id}`;
        
        if (liked) {
          setLikedItems(prev => new Set(Array.from(prev).concat(key)));
        } else {
          setLikedItems(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.delete(key);
            return newSet;
          });
        }

        // Refresh data to update like counts
        if (type === 'thread') {
          fetchForumData();
        } else if (selectedThread) {
          fetchThreadReplies(selectedThread.id);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const fetchThreadReplies = async (threadId: string) => {
    try {
      const response = await fetch(`/api/forum/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setThreadReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Error fetching thread replies:', error);
    }
  };

  const openThread = async (thread: Thread) => {
    setSelectedThread(thread);
    setShowThreadModal(true);
    await fetchThreadReplies(thread.id);
  };

  const getCityColor = (city: string) => {
    switch(city) {
      case 'crimson': return 'text-gothic-crimson';
      case 'silver': return 'text-gothic-silver';
      default: return 'text-gothic-steel';
    }
  };

  const getCityBadge = (city: string) => {
    switch(city) {
      case 'crimson': return 'bg-gothic-red/20 text-gothic-crimson';
      case 'silver': return 'bg-gothic-silver/20 text-gothic-silver';
      default: return 'bg-gothic-steel/20 text-gothic-steel';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Users size={60} className="text-gothic-silver mr-4 animate-pulse-slow" />
            <h1 className="text-5xl md:text-6xl font-gothic font-bold text-gothic-silver glow-text">
              The Ledger and the Lament
            </h1>
          </div>
          <p className="text-xl text-gothic-steel max-w-3xl mx-auto">
            Where Crimson bleeds into Silver, where ancient grudges meet modern aspirations. 
            The convergence point for citizens of both cities to share knowledge, debate mysteries, and forge connections.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Active Threads', value: stats.activeThreads.toLocaleString(), icon: MessageSquare },
            { label: 'Registered Users', value: stats.registeredUsers.toLocaleString(), icon: Users },
            { label: 'Daily Posts', value: stats.dailyPosts.toLocaleString(), icon: Star },
            { label: 'Online Now', value: stats.onlineUsers.toLocaleString(), icon: Eye }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gothic-dark-gray/30 p-4 rounded-lg border border-gothic-dark-gray">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gothic-silver">{stat.value}</div>
                    <div className="text-sm text-gothic-steel">{stat.label}</div>
                  </div>
                  <Icon size={24} className="text-gothic-steel" />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Category Filters and Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? `bg-${category.color}/20 text-${category.color} border border-${category.color}/40`
                    : 'bg-gothic-dark-gray/30 text-gothic-steel hover:text-gothic-silver border border-transparent'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="cyber-button flex items-center gap-2 px-6 py-2"
            >
              <Plus size={16} />
              Start New Thread
            </button>
          )}
        </motion.div>

        {/* Thread List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gothic-silver mx-auto"></div>
              <p className="text-gothic-steel mt-4">Loading forum threads...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel">No threads found in this category.</p>
            </div>
          ) : (
            threads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group cursor-pointer"
                onClick={() => openThread(thread)}
              >
                <div className="bg-gothic-dark-gray/20 hover:bg-gothic-dark-gray/40 p-6 rounded-lg border border-gothic-dark-gray/30 hover:border-gothic-silver/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-1 rounded text-xs ${getCityBadge(thread.profiles?.city_affiliation || 'general')}`}>
                            {thread.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatTimeAgo(thread.last_activity_at)}
                        </div>
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex flex-col items-end space-y-2 ml-6">
                      <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                        <div className="flex items-center">
                          <MessageSquare size={14} className="mr-1 text-gothic-crimson" />
                          {thread.reply_count}
                        </div>
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1 text-gothic-silver" />
                          {thread.view_count}
                        </div>
                        {user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike('thread', thread.id);
                            }}
                            className={`flex items-center transition-colors ${
                              likedItems.has(`thread_${thread.id}`)
                                ? 'text-gothic-crimson'
                                : 'text-gothic-steel hover:text-gothic-crimson'
                            }`}
                          >
                            <Heart size={14} className="mr-1" fill={likedItems.has(`thread_${thread.id}`) ? 'currentColor' : 'none'} />
                            {thread.like_count}
                          </button>
                        )}
                      </div>
                      {thread.latest_reply && (
                        <div className="text-xs text-gothic-steel">
                          Last reply by {thread.latest_reply.profiles.username}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Forum Rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 p-6 bg-gothic-charcoal/30 border border-gothic-dark-gray rounded-lg"
        >
          <h3 className="text-lg font-gothic text-gothic-silver mb-4">Forum Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gothic-steel">
            <ul className="space-y-2">
              <li>• Respect all citizens regardless of city origin</li>
              <li>• No doxxing of real-world identities</li>
              <li>• Keep discussions relevant to thread topics</li>
            </ul>
            <ul className="space-y-2">
              <li>• Report suspicious activities to moderators</li>
              <li>• Use appropriate content warnings</li>
              <li>• Cross-city collaboration is encouraged</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Create Thread Modal */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gothic-charcoal border border-gothic-dark-gray rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-gothic text-gothic-silver">Start New Thread</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gothic-steel hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm text-gothic-silver mb-2">Category</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread({...newThread, category: e.target.value})}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver"
                >
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gothic-silver mb-2">Title</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver"
                  placeholder="Enter thread title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gothic-silver mb-2">Content</label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver"
                  placeholder="Share your thoughts..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="cyber-button flex-1"
                  disabled={!newThread.title.trim() || !newThread.content.trim()}
                >
                  Create Thread
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 bg-gothic-dark-gray hover:bg-gothic-dark-gray/80 text-gothic-steel rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Thread View Modal */}
      {showThreadModal && selectedThread && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gothic-charcoal border border-gothic-dark-gray rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gothic-dark-gray">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {selectedThread.is_pinned && <Pin size={20} className="text-yellow-400" />}
                  <h2 className="text-2xl font-gothic text-gothic-silver">{selectedThread.title}</h2>
                </div>
                <button
                  onClick={() => setShowThreadModal(false)}
                  className="text-gothic-steel hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gothic-steel">
                <span className={`font-medium ${getCityColor(selectedThread.profiles?.city_affiliation || 'general')}`}>
                  {selectedThread.profiles?.username || 'Unknown User'}
                </span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs ${getCityBadge(selectedThread.profiles?.city_affiliation || 'general')}`}>
                  {selectedThread.category}
                </span>
                <span>•</span>
                <span>{formatTimeAgo(selectedThread.created_at)}</span>
              </div>
            </div>

            {/* Thread Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <div className="bg-gothic-dark-gray/30 p-4 rounded-lg border border-gothic-dark-gray/30 mb-4">
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {selectedThread.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-gothic-steel">
                    <Eye size={16} className="mr-1" />
                    {selectedThread.view_count} views
                  </div>
                  {user && (
                    <button
                      onClick={() => handleLike('thread', selectedThread.id)}
                      className={`flex items-center transition-colors ${
                        likedItems.has(`thread_${selectedThread.id}`)
                          ? 'text-gothic-crimson'
                          : 'text-gothic-steel hover:text-gothic-crimson'
                      }`}
                    >
                      <Heart size={16} className="mr-1" fill={likedItems.has(`thread_${selectedThread.id}`) ? 'currentColor' : 'none'} />
                      {selectedThread.like_count} likes
                    </button>
                  )}
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-4">
                <h3 className="text-lg font-gothic text-gothic-silver">
                  Replies ({threadReplies.length})
                </h3>
                
                {threadReplies.map((reply) => (
                  <div key={reply.id} className="bg-gothic-dark-gray/20 p-4 rounded-lg border border-gothic-dark-gray/30">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getCityColor(reply.profiles.city_affiliation)}`}>
                          {reply.profiles.username}
                        </span>
                        <span className="text-gothic-steel text-sm">•</span>
                        <span className="text-gothic-steel text-sm">
                          {formatTimeAgo(reply.created_at)}
                        </span>
                      </div>
                      
                      {user && (
                        <button
                          onClick={() => handleLike('reply', reply.id)}
                          className={`flex items-center transition-colors ${
                            likedItems.has(`reply_${reply.id}`)
                              ? 'text-gothic-crimson'
                              : 'text-gothic-steel hover:text-gothic-crimson'
                          }`}
                        >
                          <Heart size={14} className="mr-1" fill={likedItems.has(`reply_${reply.id}`) ? 'currentColor' : 'none'} />
                          {reply.like_count}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            {user && (
              <div className="p-6 border-t border-gothic-dark-gray">
                <form onSubmit={handleReply} className="space-y-4">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="Write your reply..."
                    rows={3}
                    required
                  />
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="cyber-button flex items-center gap-2"
                      disabled={!newReply.trim()}
                    >
                      <Reply size={16} />
                      Reply
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
