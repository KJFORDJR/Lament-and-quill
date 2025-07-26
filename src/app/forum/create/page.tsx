'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  city_affiliation: string;
  user_role: string;
}

export default function CreateThreadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showDraftRestored, setShowDraftRestored] = useState(false);

  // Load saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('forum_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.title || draft.content) {
          setNewThread(draft);
          setShowDraftRestored(true);
          // Hide the notification after 5 seconds
          setTimeout(() => setShowDraftRestored(false), 5000);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('forum_draft');
      }
    }
  }, []);

  // Auto-save draft every 30 seconds when there's content
  useEffect(() => {
    const saveDraft = () => {
      if (newThread.title.trim() || newThread.content.trim()) {
        localStorage.setItem('forum_draft', JSON.stringify(newThread));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    };

    // Save immediately when content changes (debounced)
    const timeoutId = setTimeout(saveDraft, 2000);
    
    // Also save periodically
    const interval = setInterval(saveDraft, 30000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [newThread]);

  // Clear draft when thread is successfully created
  const clearDraft = () => {
    localStorage.removeItem('forum_draft');
  };

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, router, authLoading]);

  // Create new thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThread.title.trim() || !newThread.content.trim()) return;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          title: newThread.title.trim(),
          content: newThread.content.trim(),
          category: newThread.category,
          author_id: user.id
        })
        .select('id')
        .single();

      if (error) throw error;

      if (data) {
        // Clear the draft when successfully created
        clearDraft();
        // Redirect to the new thread
        router.push(`/forum/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      setSubmitting(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gothic-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gothic-silver mx-auto mb-4"></div>
          <p className="text-gothic-steel">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gothic-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gothic-silver mx-auto mb-4"></div>
          <p className="text-gothic-steel">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gothic-charcoal text-white">
      {/* Draft Restored Notification */}
      {showDraftRestored && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-40 bg-gothic-silver/10 border border-gothic-silver/30 rounded-lg p-4 max-w-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="text-gothic-silver" size={20} />
            <div>
              <p className="text-gothic-silver font-medium">Draft Restored</p>
              <p className="text-gothic-steel text-sm">Your previous draft has been loaded</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Draft Saved Notification */}
      {draftSaved && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed bottom-4 right-4 z-40 bg-gothic-dark-gray/80 border border-gothic-steel/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Save className="text-gothic-steel" size={16} />
            <p className="text-gothic-steel text-sm">Draft saved</p>
          </div>
        </motion.div>
      )}

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

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-gothic text-gothic-silver mb-4">
            Create New Discussion
          </h1>
          <p className="text-lg text-gothic-steel max-w-2xl mx-auto">
            Share your thoughts with both cities
          </p>
        </motion.div>

        {/* Create Thread Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gothic-dark-gray/20 rounded-lg border border-gothic-dark-gray/30 p-8">
            <form onSubmit={handleCreateThread} className="space-y-6">
              <div>
                <label className="block text-gothic-silver text-lg font-medium mb-3">
                  Discussion Title
                </label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-gothic-silver transition-colors"
                  placeholder="Enter a compelling title for your discussion..."
                  required
                  maxLength={200}
                />
                <p className="text-gothic-steel text-sm mt-2">
                  {newThread.title.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-gothic-silver text-lg font-medium mb-3">
                  Category
                </label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-gothic-silver transition-colors"
                >
                  <option value="general">General Discussion</option>
                  <option value="crimson_affairs">Crimson City Affairs</option>
                  <option value="silver_matters">Silver City Matters</option>
                  <option value="inter_city">Inter-City Relations</option>
                  <option value="announcements">Announcements</option>
                </select>
                <p className="text-gothic-steel text-sm mt-2">
                  Choose the most appropriate category for your discussion
                </p>
              </div>

              <div>
                <label className="block text-gothic-silver text-lg font-medium mb-3">
                  Content
                </label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-gothic-silver transition-colors resize-none"
                  placeholder="Share your thoughts, ideas, or questions with the community..."
                  rows={12}
                  required
                  maxLength={5000}
                />
                <p className="text-gothic-steel text-sm mt-2">
                  {newThread.content.length}/5000 characters
                </p>
              </div>

              {/* User Info Display */}
              {profile && (
                <div className="bg-gothic-dark-gray/30 p-4 rounded-lg border border-gothic-dark-gray/50">
                  <p className="text-gothic-steel text-sm mb-1">Posting as:</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      profile.city_affiliation === 'crimson_city' ? 'text-gothic-crimson' :
                      profile.city_affiliation === 'silver_city' ? 'text-gothic-silver' :
                      'text-gothic-steel'
                    }`}>
                      {profile.username}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      profile.city_affiliation === 'crimson_city' ? 'bg-gothic-crimson/20 text-gothic-crimson' :
                      profile.city_affiliation === 'silver_city' ? 'bg-gothic-silver/20 text-gothic-silver' :
                      'bg-gothic-steel/20 text-gothic-steel'
                    }`}>
                      {profile.city_affiliation === 'crimson_city' ? 'Crimson City' :
                       profile.city_affiliation === 'silver_city' ? 'Silver City' :
                       'General'}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className="cyber-button flex items-center justify-center gap-2 text-lg px-8 py-3"
                  disabled={!newThread.title.trim() || !newThread.content.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Discussion
                    </>
                  )}
                </button>
                
                <Link 
                  href="/forum"
                  className="px-8 py-3 bg-gothic-dark-gray text-gothic-steel rounded-lg hover:bg-gothic-dark-gray/80 transition-colors text-center text-lg font-medium"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <div className="bg-gothic-dark-gray/10 rounded-lg border border-gothic-dark-gray/20 p-6">
            <h3 className="text-lg font-gothic text-gothic-silver mb-4">Discussion Guidelines</h3>
            <ul className="space-y-2 text-gothic-steel">
              <li className="flex items-start gap-2">
                <span className="text-gothic-crimson mt-1">•</span>
                Keep discussions respectful and constructive
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gothic-silver mt-1">•</span>
                Choose appropriate categories to help others find your discussion
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gothic-crimson mt-1">•</span>
                Use clear, descriptive titles that summarize your topic
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gothic-silver mt-1">•</span>
                Search existing discussions before creating duplicates
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
