'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, BookOpen, Eye, X, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useReadModal } from '@/hooks/useReadModal';
import { ReadModal } from '@/components/ReadModal';

interface CrimsonEntry {
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

export default function CrimsonLedger() {
  const [entries, setEntries] = useState<CrimsonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, selectedItem: readingEntry, openModal, closeModal, updateSelectedItem } = useReadModal<CrimsonEntry>();
  const [user, setUser] = useState<any>(null);
  const [likingEntries, setLikingEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializePage = async () => {
      // Check user authentication
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch entries with user context
      await fetchEntriesWithUser(user);
    };
    
    initializePage();
  }, []);

  const fetchEntriesWithUser = async (currentUser: any = user) => {
    try {
      const { data, error } = await supabase
        .from('crimson_ledger_entries')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      // Fetch likes for each entry
      const entriesWithLikes = await Promise.all(
        (data || []).map(async (entry) => {
          try {
            const response = await fetch(`/api/crimson/likes?entryId=${entry.id}${currentUser ? `&userId=${currentUser.id}` : ''}`);
            const likeData = await response.json();
            
            return {
              ...entry,
              likeCount: likeData.likeCount || 0,
              isLiked: likeData.isLiked || false
            };
          } catch (err) {
            console.error('Error fetching likes for entry:', entry.id, err);
            return {
              ...entry,
              likeCount: 0,
              isLiked: false
            };
          }
        })
      );

      setEntries(entriesWithLikes);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const readEntry = (entry: CrimsonEntry) => {
    openModal(entry);
  };

  const handleLike = async (entry: CrimsonEntry) => {
    if (!user) {
      alert('Please log in to like entries');
      return;
    }

    if (likingEntries.has(entry.id)) {
      return; // Prevent double-clicking
    }

    setLikingEntries(prev => {
      const newSet = new Set(prev);
      newSet.add(entry.id);
      return newSet;
    });

    try {
      const action = entry.isLiked ? 'unlike' : 'like';
      const response = await fetch('/api/crimson/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: entry.id,
          userId: user.id,
          action
        }),
      });

      if (response.ok) {
        // Update the entry's like status in state
        setEntries(prev => prev.map(e => 
          e.id === entry.id 
            ? {
                ...e,
                isLiked: !e.isLiked,
                likeCount: e.isLiked ? (e.likeCount || 0) - 1 : (e.likeCount || 0) + 1
              }
            : e
        ));

        // Also update reading entry if it's the same one
        if (readingEntry && readingEntry.id === entry.id) {
          updateSelectedItem(prev => prev ? {
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? (prev.likeCount || 0) - 1 : (prev.likeCount || 0) + 1
          } : null);
        }
      } else {
        const errorData = await response.json();
        console.error('Error liking entry:', errorData);
        if (errorData.error !== 'Already liked') {
          alert('Error updating like status');
        }
      }
    } catch (error) {
      console.error('Error liking entry:', error);
      alert('Error updating like status');
    } finally {
      setLikingEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
          <p className="text-red-300 mt-4">Loading Crimson Archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: 'linear-gradient(135deg, #8B0000 0%, #2a2a2a 100%)',
      borderColor: '#dc143c'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-gothic font-bold mb-4 text-red-100 glow-text">
            Crimson Ledger
          </h1>
          <p className="text-xl text-red-400 mb-2 font-tech">
            Official Archives from the Blood Districts
          </p>
          <p className="text-lg text-red-300 max-w-3xl mx-auto font-noir">
            Official proclamations and records from the crimson depths of the Blood City. 
            Each entry carries the weight of administrative authority and the pulse of digital governance.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-red-300">Loading crimson transmissions...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 border border-red-500/20 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%)'
          }}>
            <BookOpen size={64} className="mx-auto text-red-300 mb-4" />
            <h3 className="text-xl font-gothic text-red-200 mb-2">No Entries Found</h3>
            <p className="text-red-300">
              No entries have been published to the crimson archives yet. 
              The blood district networks await administrative transmissions.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-tech text-sm">Blood Networks Standby</span>
            </div>
          </div>
        ) : (
          /* Entries Grid */
          <>
            <div className="space-y-8">
              {entries.map((entry, index) => (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-red-500/30 rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
                  }}
                >
                  <div className="p-8">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 text-xs font-tech font-bold bg-red-500/20 text-red-400 rounded-full border border-red-400/30">
                        {entry.category || 'Official Record'}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-red-300">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(entry.published_at || entry.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(entry.published_at || entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-gothic font-bold text-red-100 mb-4 hover:text-red-300 transition-colors cursor-pointer">
                      {entry.title}
                    </h2>

                    {/* Content Preview */}
                    <div className="border-l-4 border-red-400/50 pl-6 mb-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
                      <p className="text-red-200 italic text-lg leading-relaxed font-noir">
                        {entry.content.length > 200 
                          ? `"${entry.content.substring(0, 200)}..."` 
                          : `"${entry.content}"`
                        }
                      </p>
                    </div>

                    {/* Author and Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-red-200" />
                          <span className="text-red-200 font-medium">{entry.author_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen size={16} className="text-red-400" />
                          <span className="text-red-400 text-sm font-tech">
                            {Math.ceil(entry.content.split(' ').length / 200)} min read
                          </span>
                        </div>
                        
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(entry)}
                          disabled={!user || likingEntries.has(entry.id)}
                          className={`flex items-center space-x-2 px-3 py-1 border rounded-md transition-colors text-sm ${
                            entry.isLiked 
                              ? 'bg-red-500/20 border-red-400/50 text-red-400' 
                              : 'bg-red-500/10 hover:bg-red-500/20 border-red-400/30 text-red-400 hover:text-red-300'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${likingEntries.has(entry.id) ? 'opacity-50 cursor-wait' : ''}`}
                          title={!user ? 'Please log in to like entries' : entry.isLiked ? 'Unlike this entry' : 'Like this entry'}
                        >
                          <Heart 
                            size={14} 
                            className={entry.isLiked ? 'fill-current' : ''} 
                          />
                          <span className="font-tech">{entry.likeCount || 0}</span>
                        </button>
                        
                        {entry.content.length > 200 && (
                          <button
                            onClick={() => readEntry(entry)}
                            className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 rounded-md transition-colors text-red-400 hover:text-red-300 text-sm"
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
              className="text-center mt-16 p-8 border border-red-500/20 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%)'
              }}
            >
              <h3 className="text-xl font-gothic text-red-200 mb-3">
                Crimson Archive Status
              </h3>
              <p className="text-red-300 font-noir text-lg">
                The blood district networks continue to process and archive official transmissions 
                from the Crimson City administration. {entries.length} record{entries.length !== 1 ? 's' : ''} catalogued in the crimson substrate.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-tech text-sm">Blood Networks Active</span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Read Full Entry Modal */}
      <ReadModal
        isOpen={isOpen}
        onClose={closeModal}
        title={readingEntry?.title || 'Entry'}
        theme="crimson"
        size="xl"
      >
        {readingEntry && (
          <>
            <div className="flex items-center space-x-4 text-sm text-red-300 mb-6">
              <div className="flex items-center space-x-2">
                <User size={14} className="text-red-200" />
                <span className="text-red-200 font-medium">{readingEntry.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(readingEntry.published_at || readingEntry.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{new Date(readingEntry.published_at || readingEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="px-2 py-1 text-xs font-tech font-bold bg-red-500/20 text-red-400 rounded-full border border-red-400/30">
                {readingEntry.category || 'Official Record'}
              </span>
            </div>

            <div className="flex justify-end mb-4">
              {/* Like Button in Modal */}
              <button
                onClick={() => handleLike(readingEntry)}
                disabled={!user || likingEntries.has(readingEntry.id)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
                  readingEntry.isLiked 
                    ? 'bg-red-500/20 border-red-400/50 text-red-400' 
                    : 'bg-red-500/10 hover:bg-red-500/20 border-red-400/30 text-red-400 hover:text-red-300'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${likingEntries.has(readingEntry.id) ? 'opacity-50 cursor-wait' : ''}`}
                title={!user ? 'Please log in to like entries' : readingEntry.isLiked ? 'Unlike this entry' : 'Like this entry'}
              >
                <Heart 
                  size={16} 
                  className={readingEntry.isLiked ? 'fill-current' : ''} 
                />
                <span className="font-tech">{readingEntry.likeCount || 0}</span>
              </button>
            </div>

            <div className="border-l-4 border-red-400/50 pl-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
              <p className="text-red-200 italic text-lg leading-relaxed font-noir whitespace-pre-wrap">
                "{readingEntry.content}"
              </p>
            </div>
          </>
        )}
      </ReadModal>
    </div>
  );
}
