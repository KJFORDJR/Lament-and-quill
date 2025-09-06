'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Heart, Reply, Trash2, Pin, ArrowLeft } from 'lucide-react';
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
}

interface Reply {
  id: string;
  content: string;
  author_id: string;
  thread_id: string;
  like_count: number;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    city_affiliation: string;
    user_role: string;
  };
}

interface Profile {
  id: string;
  username: string;
  city_affiliation: string;
  user_role: string;
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;
  const { user, loading: userLoading } = useUser();

  // Debug: Log user state whenever it changes
  useEffect(() => {
    console.log('ThreadPage - User state changed:', { 
      userId: user?.id, 
      isAuthenticated: !!user,
      userLoading
    });
  }, [user, userLoading]);

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [newReply, setNewReply] = useState('');
  const [editingThread, setEditingThread] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Fetch user profile
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

  // Fetch thread and replies
  useEffect(() => {
    const fetchThreadData = async () => {
      if (!threadId) return;

      try {
        setLoading(true);
        
        // Fetch thread with profile
        const { data: threadData, error: threadError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            profiles:author_id (
              id,
              username,
              city_affiliation,
              user_role
            )
          `)
          .eq('id', threadId)
          .single();

        if (threadError) {
          console.error('Error fetching thread:', threadError);
          router.push('/forum');
          return;
        }

        if (threadData) {
          setThread(threadData);
          
          // Increment view count
          await supabase
            .from('forum_threads')
            .update({ view_count: (threadData.view_count || 0) + 1 })
            .eq('id', threadId);
        }

        // Fetch replies with profiles
        const { data: repliesData, error: repliesError } = await supabase
          .from('forum_replies')
          .select(`
            *,
            profiles:author_id (
              id,
              username,
              city_affiliation,
              user_role
            )
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (repliesError) {
          console.error('Error fetching replies:', repliesError);
        } else if (repliesData) {
          setReplies(repliesData);
        }

        // Fetch user's likes if authenticated
        if (user) {
          const itemIds = [threadId, ...repliesData?.map(r => r.id) || []];
          
          if (itemIds.length > 0) {
            const { data: likesData } = await supabase
              .from('forum_likes')
              .select('thread_id, reply_id')
              .eq('user_id', user.id)
              .or(`thread_id.in.(${itemIds.join(',')}),reply_id.in.(${itemIds.join(',')})`);

            if (likesData) {
              const likedSet = new Set<string>();
              likesData.forEach(like => {
                if (like.thread_id) likedSet.add(`thread_${like.thread_id}`);
                if (like.reply_id) likedSet.add(`reply_${like.reply_id}`);
              });
              setLikedItems(likedSet);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching thread data:', error);
        router.push('/forum');
      } finally {
        setLoading(false);
      }
    };

    fetchThreadData();
  }, [threadId, user, router]);

  // Helper functions
  const getCategorySlug = (categoryName: string) => {
    const categoryMap: Record<string, string> = {
      'Crimson Chronicles': 'crimson',
      'Silver Transmissions': 'silver', 
      'The Convergence': 'convergence',
      'Unsolved Mysteries': 'mysteries',
      'General Discussion': 'general'
    };
    return categoryMap[categoryName] || 'general';
  };

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

  const canEditDelete = (authorId: string) => {
    return user && (user.id === authorId || profile?.user_role === 'admin');
  };

  const isAdmin = () => {
    return user && profile?.user_role === 'admin';
  };

  // Like/Unlike functionality
  const handleLike = async (itemType: 'thread' | 'reply', itemId: string) => {
    if (!user) return;

    const likeKey = `${itemType}_${itemId}`;
    const isLiked = likedItems.has(likeKey);

    try {
      if (isLiked) {
        // Delete the like using the correct column names
        if (itemType === 'thread') {
          await supabase
            .from('forum_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('thread_id', itemId)
            .is('reply_id', null);
        } else {
          await supabase
            .from('forum_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('reply_id', itemId)
            .is('thread_id', null);
        }

        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(likeKey);
          return newSet;
        });

        // Update local counts
        if (itemType === 'thread' && thread) {
          setThread({ ...thread, like_count: Math.max(0, thread.like_count - 1) });
        } else {
          setReplies(prev => 
            prev.map(reply => 
              reply.id === itemId 
                ? { ...reply, like_count: Math.max(0, reply.like_count - 1) }
                : reply
            )
          );
        }
      } else {
        // Insert the like using the correct column names
        const insertData = {
          user_id: user.id,
          ...(itemType === 'thread' 
            ? { thread_id: itemId, reply_id: null }
            : { reply_id: itemId, thread_id: null }
          )
        };

        await supabase
          .from('forum_likes')
          .insert(insertData);

        setLikedItems(prev => new Set([...Array.from(prev), likeKey]));

        // Update local counts
        if (itemType === 'thread' && thread) {
          setThread({ ...thread, like_count: thread.like_count + 1 });
        } else {
          setReplies(prev => 
            prev.map(reply => 
              reply.id === itemId 
                ? { ...reply, like_count: reply.like_count + 1 }
                : reply
            )
          );
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Reply functionality
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !thread || !newReply.trim()) return;

    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          content: newReply.trim(),
          author_id: user.id,
          thread_id: thread.id
        })
        .select(`
          *,
          profiles:author_id (
            id,
            username,
            city_affiliation,
            user_role
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setReplies(prev => [...prev, data]);
        setNewReply('');
        
        // Update thread reply count
        await supabase
          .from('forum_threads')
          .update({ 
            reply_count: thread.reply_count + 1,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', thread.id);

        setThread(prev => prev ? {
          ...prev, 
          reply_count: prev.reply_count + 1,
          last_activity_at: new Date().toISOString()
        } : null);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Thread edit functionality
  const startEditingThread = (thread: Thread) => {
    setEditingThread(thread.id);
    setEditTitle(thread.title);
    setEditContent(thread.content);
    // Convert category name to slug for the dropdown
    const categoryName = (thread as any).forum_categories?.name || thread.category;
    setEditCategory(getCategorySlug(categoryName));
  };

  const saveThreadEdit = async () => {
    console.log('saveThreadEdit called - initial checks');
    
    if (!thread || !editTitle.trim() || !editContent.trim()) {
      console.log('saveThreadEdit - Missing thread or empty title/content');
      return;
    }

    // Check if user authentication is still loading
    if (userLoading) {
      console.log('saveThreadEdit - User authentication still loading, please wait');
      alert('Please wait for authentication to complete');
      return;
    }

    // Debug: Check user authentication state
    console.log('saveThreadEdit - User state:', { 
      user: user?.id, 
      isAuthenticated: !!user,
      userLoading
    });
    console.log('saveThreadEdit - Thread state:', { threadId: thread.id, threadIdType: typeof thread.id });
    
    if (!user) {
      console.error('saveThreadEdit - User object is null/undefined');
      alert('Authentication required. Please refresh the page and try again.');
      return;
    }
    
    if (!user.id) {
      console.error('saveThreadEdit - User ID is missing from user object:', user);
      alert('User ID is missing. Please refresh the page and try again.');
      return;
    }

    if (!thread.id) {
      console.error('saveThreadEdit - Thread ID is missing or invalid');
      alert('Thread ID is missing');
      return;
    }

    try {
      const requestBody = {
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        author_id: user.id
      };
      
      const apiUrl = `/api/forum/threads/${thread.id}`;
      console.log('saveThreadEdit - About to make request');
      console.log('saveThreadEdit - API URL:', apiUrl);
      console.log('saveThreadEdit - Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('saveThreadEdit - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('saveThreadEdit - API Error:', errorText);
        throw new Error(`Failed to update thread: ${response.status} - ${errorText}`);
      }

      const updatedThread = await response.json();
      console.log('saveThreadEdit - Success:', updatedThread);
      
      setThread({
        ...thread,
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory
      });
      
      setEditingThread(null);
      setEditTitle('');
      setEditContent('');
      setEditCategory('');
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  const cancelEditThread = () => {
    setEditingThread(null);
    setEditTitle('');
    setEditContent('');
    setEditCategory('');
  };

  // Reply edit functionality
  const startEditingReply = (reply: Reply) => {
    setEditingReply(reply.id);
    setEditContent(reply.content);
  };

  const saveReplyEdit = async () => {
    if (!editingReply || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .update({ content: editContent.trim() })
        .eq('id', editingReply);

      if (error) throw error;

      setReplies(prev => 
        prev.map(reply => 
          reply.id === editingReply 
            ? { ...reply, content: editContent.trim() }
            : reply
        )
      );
      
      setEditingReply(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const cancelEditReply = () => {
    setEditingReply(null);
    setEditContent('');
  };

  // Delete functionality
  const deleteThread = async (threadId: string) => {
    if (!window.confirm('Are you sure you want to delete this thread?')) return;

    try {
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
      
      router.push('/forum');
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const deleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      setReplies(prev => prev.filter(reply => reply.id !== replyId));
      
      if (thread) {
        await supabase
          .from('forum_threads')
          .update({ reply_count: Math.max(0, thread.reply_count - 1) })
          .eq('id', thread.id);

        setThread(prev => prev ? {
          ...prev, 
          reply_count: Math.max(0, prev.reply_count - 1)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
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

      if (response.ok && thread) {
        setThread({ ...thread, is_pinned: !currentPinStatus });
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gothic-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gothic-silver mx-auto mb-4"></div>
          <p className="text-gothic-steel">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gothic-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-gothic text-gothic-silver mb-4">Thread Not Found</h1>
          <Link 
            href="/forum"
            className="cyber-button inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gothic-charcoal text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link 
            href="/forum"
            className="inline-flex items-center gap-2 text-gothic-steel hover:text-gothic-silver transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Forum
          </Link>
        </div>

        {/* Thread Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gothic-dark-gray/20 rounded-lg border border-gothic-dark-gray/30 mb-8"
        >
          {/* Thread Header */}
          <div className="p-6 border-b border-gothic-dark-gray">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-2 flex-1">
                {thread.is_pinned && <Pin size={20} className="text-yellow-400" />}
                {editingThread === thread.id ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-gothic text-gothic-silver bg-gothic-dark-gray border border-gothic-dark-gray rounded px-2 py-1 focus:outline-none focus:border-gothic-silver"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="bg-gothic-dark-gray border border-gothic-dark-gray rounded px-2 py-1 text-gothic-silver focus:outline-none focus:border-gothic-silver text-sm"
                    >
                      <option value="general">General Discussion</option>
                      <option value="crimson">Crimson Chronicles</option>
                      <option value="silver">Silver Transmissions</option>
                      <option value="convergence">The Convergence</option>
                      <option value="mysteries">Unsolved Mysteries</option>
                    </select>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-gothic text-gothic-silver">{thread.title}</h1>
                  </div>
                )}
              </div>
              
              {/* Thread actions for author or admin */}
              {(canEditDelete(thread.author_id) || isAdmin()) && editingThread !== thread.id && (
                <div className="flex items-center space-x-2">
                  {/* Pin button (Admin only) */}
                  {isAdmin() && (
                    <button
                      onClick={() => togglePinThread(thread.id, thread.is_pinned)}
                      className={`transition-colors p-1 ${
                        thread.is_pinned 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-gothic-steel hover:text-yellow-400'
                      }`}
                      title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                    >
                      <Pin size={16} fill={thread.is_pinned ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  
                  {/* Edit button (Author or Admin) */}
                  {canEditDelete(thread.author_id) && (
                    <button
                      onClick={() => startEditingThread(thread)}
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
                  {canEditDelete(thread.author_id) && (
                    <button
                      onClick={() => deleteThread(thread.id)}
                      className="text-gothic-steel hover:text-gothic-crimson transition-colors p-1"
                      title="Delete thread"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Save/Cancel buttons when editing */}
              {editingThread === thread.id && (
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
              <span className={`font-medium ${getCityColor(thread.profiles?.city_affiliation || 'general')}`}>
                {thread.profiles?.username || 'Unknown User'}
              </span>
              <span>•</span>
              <span className={`px-2 py-1 rounded text-xs ${getCityBadge(thread.profiles?.city_affiliation || 'general')}`}>
                {(thread as any).forum_categories?.name || thread.category}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(thread.created_at)}</span>
            </div>
          </div>

          {/* Thread Content */}
          <div className="p-6">
            <div className="bg-gothic-dark-gray/30 p-4 rounded-lg border border-gothic-dark-gray/30 mb-4">
              {editingThread === thread.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver resize-none"
                  rows={8}
                />
              ) : (
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {thread.content}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-gothic-steel">
                <Eye size={16} className="mr-1" />
                {thread.view_count} views
              </div>
              {user && (
                <button
                  onClick={() => handleLike('thread', thread.id)}
                  className={`flex items-center transition-colors ${
                    likedItems.has(`thread_${thread.id}`)
                      ? 'text-gothic-crimson'
                      : 'text-gothic-steel hover:text-gothic-crimson'
                  }`}
                >
                  <Heart size={16} className="mr-1" fill={likedItems.has(`thread_${thread.id}`) ? 'currentColor' : 'none'} />
                  {thread.like_count} likes
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Replies */}
        <div className="space-y-6">
          <h2 className="text-xl font-gothic text-gothic-silver">
            Replies ({replies.length})
          </h2>
          
          {replies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group bg-gothic-dark-gray/20 p-4 rounded-lg border border-gothic-dark-gray/30"
            >
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
            </motion.div>
          ))}
        </div>

        {/* Reply Form */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 bg-gothic-dark-gray/20 p-6 rounded-lg border border-gothic-dark-gray/30"
          >
            <h3 className="text-lg font-gothic text-gothic-silver mb-4">Add Reply</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded px-3 py-2 text-white focus:outline-none focus:border-gothic-silver"
                placeholder="Write your reply..."
                rows={4}
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
