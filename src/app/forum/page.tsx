'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, ThumbsUp, Eye, Clock, Pin, Star, Plus, Search, Heart, Reply, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { useReadModal } from '@/hooks/useReadModal';
import Modal from '@/components/Modal';

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
  const { isOpen: isThreadModalOpen, selectedItem: selectedThread, openModal: openThreadModal, closeModal: closeThreadModal, updateSelectedItem: updateSelectedThread } = useReadModal<Thread>();
  const [threadReplies, setThreadReplies] = useState<Reply[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [newReply, setNewReply] = useState('');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  
  // Edit states
  const [editingThread, setEditingThread] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

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

        // Update selected thread if liking the thread itself
        if (type === 'thread' && selectedThread && selectedThread.id === id) {
          updateSelectedThread((prev) => prev ? {
            ...prev,
            like_count: prev.like_count + (liked ? 1 : -1)
          } : null);
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
    openThreadModal(thread);
    await fetchThreadReplies(thread.id);
  };

  // Helper function to check if user can edit/delete
  const canEditDelete = (authorId: string) => {
    return user && (user.id === authorId || profile?.user_role === 'admin');
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user && profile?.user_role === 'admin';
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
        
        // If we're viewing this thread in modal, update it too
        if (selectedThread && selectedThread.id === threadId) {
          updateSelectedThread((prev) => prev ? { ...prev, is_pinned: !currentPinStatus } : null);
        }
      } else {
        console.error('Failed to toggle pin status');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  // Thread edit/delete functions
  const startEditingThread = (thread: Thread) => {
    setEditingThread(thread.id);
    setEditTitle(thread.title);
    setEditContent(thread.content);
  };

  const cancelEditThread = () => {
    setEditingThread(null);
    setEditTitle('');
    setEditContent('');
  };

  const saveThreadEdit = async () => {
    if (!editingThread || !user || !editTitle.trim() || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/forum/threads/${editingThread}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          author_id: user.id
        })
      });

      if (response.ok) {
        const updatedThread = await response.json();
        updateSelectedThread(() => updatedThread);
        fetchForumData();
        cancelEditThread();
      } else {
        console.error('Failed to update thread');
      }
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  const deleteThread = async (threadId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this thread?')) return;

    try {
      const response = await fetch(`/api/forum/threads/${threadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: user.id })
      });

      if (response.ok) {
        closeThreadModal();
        fetchForumData();
      } else {
        console.error('Failed to delete thread');
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  // Reply edit/delete functions
  const startEditingReply = (reply: Reply) => {
    setEditingReply(reply.id);
    setEditContent(reply.content);
  };

  const cancelEditReply = () => {
    setEditingReply(null);
    setEditContent('');
  };

  const saveReplyEdit = async () => {
    if (!editingReply || !user || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/forum/replies/${editingReply}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          author_id: user.id
        })
      });

      if (response.ok) {
        if (selectedThread) {
          fetchThreadReplies(selectedThread.id);
        }
        cancelEditReply();
      } else {
        console.error('Failed to update reply');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const deleteReply = async (replyId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: user.id })
      });

      if (response.ok) {
        if (selectedThread) {
          fetchThreadReplies(selectedThread.id);
        }
        fetchForumData(); // Refresh to update reply counts
      } else {
        console.error('Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
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
                      
                      {/* Edit/Delete/Pin buttons for thread author or admin */}
                      {(canEditDelete(thread.author_id) || isAdmin()) && (
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Pin button (Admin only) */}
                          {isAdmin() && (
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
                              <Pin size={14} fill={thread.is_pinned ? 'currentColor' : 'none'} />
                            </button>
                          )}
                          
                          {/* Edit button (Author or Admin) */}
                          {canEditDelete(thread.author_id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingThread(thread);
                              }}
                              className="text-gothic-steel hover:text-gothic-silver transition-colors p-1"
                              title="Edit thread"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          )}
                          
                          {/* Delete button (Author or Admin) */}
                          {canEditDelete(thread.author_id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.id);
                              }}
                              className="text-gothic-steel hover:text-gothic-crimson transition-colors p-1"
                              title="Delete thread"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Start New Thread"
        size="lg"
      >
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
      </Modal>

      {/* Thread View Modal */}
      {/* Thread Modal */}
      <Modal 
        isOpen={isThreadModalOpen && !!selectedThread} 
        onClose={closeThreadModal}
        title={selectedThread?.title || 'Thread'}
        size="xl"
      >
        {selectedThread && (
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gothic-dark-gray">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {selectedThread.is_pinned && <Pin size={20} className="text-yellow-400" />}
                  {editingThread === selectedThread.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-gothic text-gothic-silver bg-gothic-dark-gray border border-gothic-dark-gray rounded px-2 py-1 focus:outline-none focus:border-gothic-silver"
                    />
                  ) : (
                    <h2 className="text-2xl font-gothic text-gothic-silver">{selectedThread.title}</h2>
                  )}
                </div>
                
                {/* Thread actions for author or admin */}
                {(canEditDelete(selectedThread.author_id) || isAdmin()) && editingThread !== selectedThread.id && (
                  <div className="flex items-center space-x-2">
                    {/* Pin button (Admin only) */}
                    {isAdmin() && (
                      <button
                        onClick={() => togglePinThread(selectedThread.id, selectedThread.is_pinned)}
                        className={`transition-colors p-1 ${
                          selectedThread.is_pinned 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-gothic-steel hover:text-yellow-400'
                        }`}
                        title={selectedThread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                      >
                        <Pin size={16} fill={selectedThread.is_pinned ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    
                    {/* Edit button (Author or Admin) */}
                    {canEditDelete(selectedThread.author_id) && (
                      <button
                        onClick={() => startEditingThread(selectedThread)}
                        className="text-gothic-steel hover:text-gothic-silver transition-colors p-1"
                        title="Edit thread"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete button (Author or Admin) */}
                    {canEditDelete(selectedThread.author_id) && (
                      <button
                        onClick={() => deleteThread(selectedThread.id)}
                        className="text-gothic-steel hover:text-gothic-crimson transition-colors p-1"
                        title="Delete thread"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}

                {/* Save/Cancel buttons when editing */}
                {editingThread === selectedThread.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveThreadEdit}
                      className="px-3 py-1 bg-gothic-silver text-gothic-charcoal rounded hover:bg-gothic-silver/80 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditThread}
                      className="px-3 py-1 bg-gothic-dark-gray text-gothic-steel rounded hover:bg-gothic-dark-gray/80 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
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
                  {editingThread === selectedThread.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver resize-none"
                      rows={8}
                    />
                  ) : (
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {selectedThread.content}
                    </p>
                  )}
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
                  <div key={reply.id} className="group bg-gothic-dark-gray/20 p-4 rounded-lg border border-gothic-dark-gray/30">
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
                      
                      <div className="flex items-center space-x-2">
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

                        {/* Edit/Delete buttons for reply author or admin */}
                        {canEditDelete(reply.author_id) && editingReply !== reply.id && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditingReply(reply)}
                              className="text-gothic-steel hover:text-gothic-silver transition-colors p-1"
                              title="Edit reply"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteReply(reply.id)}
                              className="text-gothic-steel hover:text-gothic-crimson transition-colors p-1"
                              title="Delete reply"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        {/* Save/Cancel buttons when editing */}
                        {editingReply === reply.id && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={saveReplyEdit}
                              className="px-2 py-1 bg-gothic-silver text-gothic-charcoal rounded hover:bg-gothic-silver/80 transition-colors text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditReply}
                              className="px-2 py-1 bg-gothic-dark-gray text-gothic-steel rounded hover:bg-gothic-dark-gray/80 transition-colors text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editingReply === reply.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver resize-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-white leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    )}
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
          </div>
        )}
      </Modal>
    </div>
  );
}
