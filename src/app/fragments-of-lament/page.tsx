'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, BookOpen, Eye, X, Heart } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useReadModal } from '@/hooks/useReadModal';
import { ReadModal } from '@/components/ReadModal';
import { useAuth } from '@/contexts/AuthContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fragments of Lament - Silver Chronicles',
  description: 'Lament city\'s official chronicles, maintained by the silver administration. Explore the ethereal tales and mysteries of Silver Heights.',
  keywords: ['fragments of lament', 'silver heights', 'chronicles', 'lament city', 'official journal', 'silver administration'],
  openGraph: {
    title: 'Fragments of Lament - Silver Chronicles | Lament and Quill',
    description: 'Lament city\'s official chronicles, maintained by the silver administration.',
    url: 'https://lamentandquill.com/fragments-of-lament',
  },
  alternates: {
    canonical: '/fragments-of-lament',
  },
}

const GUEST_ENTRY_LIMIT = 5;

interface Fragment {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  is_published: boolean;
  likeCount?: number;
  isLiked?: boolean;
}

export default function FragmentsOfLament() {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isOpen, selectedItem: readingFragment, openModal, closeModal, updateSelectedItem } = useReadModal<Fragment>();
  const { user } = useAuth();
  const [likingFragments, setLikingFragments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializePage = async () => {
      // Check user authentication
      setIsAuthenticated(!!user);
      
      // Fetch fragments with user context
      await fetchFragmentsWithUser(user);
    };
    
    initializePage();
  }, [user]);

  const fetchFragmentsWithUser = async (currentUser: any = user) => {
    try {
      // Try to order by display_order first, fall back to published_at if column doesn't exist
      let data, error;
      
      try {
        let query = supabase
          .from('lament_fragments_entries')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        // Apply limit for non-authenticated users
        if (!currentUser) {
          query = query.limit(GUEST_ENTRY_LIMIT);
        }

        const result = await query;
        
        if (result.error && result.error.message.includes('column "display_order" does not exist')) {
          // Fall back to published_at ordering
          let fallbackQuery = supabase
            .from('lament_fragments_entries')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

          if (!currentUser) {
            fallbackQuery = fallbackQuery.limit(GUEST_ENTRY_LIMIT);
          }

          const fallbackResult = await fallbackQuery;
          data = fallbackResult.data;
          error = fallbackResult.error;
        } else {
          data = result.data;
          error = result.error;
        }
      } catch (err) {
        // If ordering by display_order fails, use published_at
        let fallbackQuery = supabase
          .from('lament_fragments_entries')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (!currentUser) {
          fallbackQuery = fallbackQuery.limit(GUEST_ENTRY_LIMIT);
        }

        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        console.error('Error fetching fragments:', error);
        return;
      }

      // Fetch likes for each fragment
      const fragmentsWithLikes = await Promise.all(
        (data || []).map(async (fragment) => {
          try {
            const response = await fetch(`/api/fragments/likes?fragmentId=${fragment.id}${currentUser ? `&userId=${currentUser.id}` : ''}`);
            const likeData = await response.json();
            
            return {
              ...fragment,
              likeCount: likeData.likeCount || 0,
              isLiked: likeData.isLiked || false
            };
          } catch (err) {
            console.error('Error fetching likes for fragment:', fragment.id, err);
            return {
              ...fragment,
              likeCount: 0,
              isLiked: false
            };
          }
        })
      );

      setFragments(fragmentsWithLikes);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const readFragment = (fragment: Fragment) => {
    openModal(fragment);
  };

  const handleLike = async (fragment: Fragment) => {
    if (!user) {
      alert('Please log in to like fragments');
      return;
    }

    if (likingFragments.has(fragment.id)) {
      return; // Prevent double-clicking
    }

    setLikingFragments(prev => {
      const newSet = new Set(prev);
      newSet.add(fragment.id);
      return newSet;
    });

    try {
      const action = fragment.isLiked ? 'unlike' : 'like';
      const response = await fetch('/api/fragments/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fragmentId: fragment.id,
          userId: user.id,
          action
        }),
      });

      if (response.ok) {
        // Update the fragment's like status in state
        setFragments(prev => prev.map(f => 
          f.id === fragment.id 
            ? {
                ...f,
                isLiked: !f.isLiked,
                likeCount: f.isLiked ? (f.likeCount || 0) - 1 : (f.likeCount || 0) + 1
              }
            : f
        ));

        // Also update reading fragment if it's the same one
        if (readingFragment && readingFragment.id === fragment.id) {
          updateSelectedItem(prev => prev ? {
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? (prev.likeCount || 0) - 1 : (prev.likeCount || 0) + 1
          } : null);
        }
      } else {
        const errorData = await response.json();
        console.error('Error liking fragment:', errorData);
        if (errorData.error !== 'Already liked') {
          alert('Error updating like status');
        }
      }
    } catch (error) {
      console.error('Error liking fragment:', error);
      alert('Error updating like status');
    } finally {
      setLikingFragments(prev => {
        const newSet = new Set(prev);
        newSet.delete(fragment.id);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: 'linear-gradient(135deg, #708090 0%, #2a2a2a 100%)',
      borderColor: '#c0c0c0'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-gothic font-bold mb-4 text-gothic-silver glow-text">
            Fragments of Lament
          </h1>
          <p className="text-xl text-green-400 mb-2 font-tech">
            Neural Archives from Silver Heights
          </p>
          <p className="text-lg text-gothic-steel max-w-3xl mx-auto font-noir">
            Ethereal transmissions from the quantum consciousness networks of the upper districts. 
            Each fragment carries the weight of digital memories and the whisper of awakening minds.
          </p>
        </motion.div>

        {/* Authentication Notice for Non-Authenticated Users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 border border-amber-500/30 rounded-lg p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-tech text-amber-400">Limited Access Mode</h3>
            </div>
            <p className="text-amber-300 mb-4">
              You are viewing the first {GUEST_ENTRY_LIMIT} fragments as a guest. 
              <Link href="/login" className="text-green-400 hover:text-green-300 mx-1 underline transition-colors">
                Login
              </Link>
              or
              <Link href="/register" className="text-green-400 hover:text-green-300 mx-1 underline transition-colors">
                Register
              </Link>
              to access the complete neural archives.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
              <span className="text-amber-400 font-tech text-sm">Guest Network Access</span>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gothic-steel">Loading neural transmissions...</p>
          </div>
        ) : fragments.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 border border-gothic-silver/20 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%)'
          }}>
            <BookOpen size={64} className="mx-auto text-gothic-steel mb-4" />
            <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Fragments Found</h3>
            <p className="text-gothic-steel">
              No fragments have been published to the neural archives yet. 
              The quantum consciousness networks await their first transmissions.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-tech text-sm">Neural Networks Standby</span>
            </div>
          </div>
        ) : (
          /* Fragments Grid */
          <>
            <div className="space-y-8">
              {fragments.map((fragment, index) => (
                <motion.article
                  key={fragment.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-gothic-silver/30 rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
                  }}
                >
                  <div className="p-8">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 text-xs font-tech font-bold bg-green-500/20 text-green-400 rounded-full border border-green-400/30">
                        {fragment.category || 'Neural Transmission'}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(fragment.published_at || fragment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(fragment.published_at || fragment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-gothic font-bold text-gothic-silver mb-4 hover:text-green-400 transition-colors cursor-pointer">
                      {fragment.title}
                    </h2>

                    {/* Content Preview */}
                    <div className="border-l-4 border-green-400/50 pl-6 mb-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
                      <p className="text-gothic-silver italic text-lg leading-relaxed font-noir">
                        {fragment.content.length > 200 
                          ? `"${fragment.content.substring(0, 200)}..."` 
                          : `"${fragment.content}"`
                        }
                      </p>
                    </div>

                    {/* Author and Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-gothic-silver/20">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-gothic-silver" />
                          <span className="text-gothic-silver font-medium">{fragment.author_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm font-tech">
                            {Math.ceil(fragment.content.split(' ').length / 200)} min read
                          </span>
                        </div>
                        
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(fragment)}
                          disabled={!user || likingFragments.has(fragment.id)}
                          className={`flex items-center space-x-2 px-3 py-1 border rounded-md transition-colors text-sm ${
                            fragment.isLiked 
                              ? 'bg-green-500/20 border-green-400/50 text-green-400' 
                              : 'bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-400 hover:text-green-300'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${likingFragments.has(fragment.id) ? 'opacity-50 cursor-wait' : ''}`}
                          title={!user ? 'Please log in to like fragments' : fragment.isLiked ? 'Unlike this fragment' : 'Like this fragment'}
                        >
                          <Heart 
                            size={14} 
                            className={fragment.isLiked ? 'fill-current' : ''} 
                          />
                          <span className="font-tech">{fragment.likeCount || 0}</span>
                        </button>
                        
                        {fragment.content.length > 200 && (
                          <button
                            onClick={() => readFragment(fragment)}
                            className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-400/30 rounded-md transition-colors text-green-400 hover:text-green-300 text-sm"
                            title="Read Full Entry"
                          >
                            <Eye size={14} />
                            <span className="font-tech">Read Full Entry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-16 p-8 border border-gothic-silver/20 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%)'
              }}
            >
              <h3 className="text-xl font-gothic text-gothic-silver mb-3">
                Neural Archive Status
              </h3>
              <p className="text-gothic-steel font-noir text-lg">
                The quantum consciousness networks continue to process and archive the ethereal transmissions 
                from Silver Heights. {fragments.length} fragment{fragments.length !== 1 ? 's' : ''} catalogued in the neural substrate.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-tech text-sm">Neural Networks Active</span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Read Full Entry Modal */}
      <ReadModal
        isOpen={isOpen}
        onClose={closeModal}
        title={readingFragment?.title || 'Fragment'}
        theme="silver"
        size="xl"
      >
        {readingFragment && (
          <>
            <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-6">
              <div className="flex items-center space-x-2">
                <User size={14} className="text-gothic-silver" />
                <span className="text-gothic-silver font-medium">{readingFragment.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(readingFragment.published_at || readingFragment.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{new Date(readingFragment.published_at || readingFragment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="px-2 py-1 text-xs font-tech font-bold bg-green-500/20 text-green-400 rounded-full border border-green-400/30">
                {readingFragment.category || 'Neural Transmission'}
              </span>
            </div>

            <div className="flex justify-end mb-4">
              {/* Like Button in Modal */}
              <button
                onClick={() => handleLike(readingFragment)}
                disabled={!user || likingFragments.has(readingFragment.id)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
                  readingFragment.isLiked 
                    ? 'bg-green-500/20 border-green-400/50 text-green-400' 
                    : 'bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-400 hover:text-green-300'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${likingFragments.has(readingFragment.id) ? 'opacity-50 cursor-wait' : ''}`}
                title={!user ? 'Please log in to like fragments' : readingFragment.isLiked ? 'Unlike this fragment' : 'Like this fragment'}
              >
                <Heart 
                  size={16} 
                  className={readingFragment.isLiked ? 'fill-current' : ''} 
                />
                <span className="font-tech">{readingFragment.likeCount || 0}</span>
              </button>
            </div>

            <div className="border-l-4 border-green-400/50 pl-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
              <p className="text-gothic-silver italic text-lg leading-relaxed font-noir whitespace-pre-wrap">
                &ldquo;{readingFragment.content}&rdquo;
              </p>
            </div>
          </>
        )}
      </ReadModal>
    </div>
  );
}
