'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Coins, Clock, User, Send, Plus, Eye, EyeOff, X, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Confession {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function CrimsonConfessions() {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [readingConfession, setReadingConfession] = useState<Confession | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserConfessions();
    }
  }, [user]);

  const fetchUserConfessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crimson_confessions_submissions')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching confessions:', error);
        return;
      }

      setConfessions(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const { error } = await supabase
        .from('crimson_confessions_submissions')
        .insert({
          title: formData.title,
          content: formData.content,
          author_id: user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting:', error);
        alert('Error submitting your confession. Please try again.');
        return;
      }

      alert('Your confession has been submitted for review!');
      setFormData({ title: '', content: '' });
      setShowSubmissionForm(false);
      fetchUserConfessions();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error submitting your confession. Please try again.');
    }
  };

  const readConfession = (confession: Confession) => {
    setReadingConfession(confession);
    setShowReadModal(true);
  };

  const closeReadModal = () => {
    setShowReadModal(false);
    setReadingConfession(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4" style={{
        background: 'linear-gradient(135deg, #8b0000 0%, #000000 100%)'
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-gothic font-bold mb-6 text-gothic-silver">
            Crimson Confessions
          </h1>
          <p className="text-xl text-gothic-crimson mb-8">
            Please log in to submit and view your confessions from the Crimson Quarter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: 'linear-gradient(135deg, #8b0000 0%, #000000 100%)'
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-gothic font-bold mb-4 text-gothic-silver glow-text">
            Crimson Confessions
          </h1>
          <p className="text-xl text-gothic-crimson mb-2 font-tech">
            Blood-traced Transmissions from the Crimson Quarter
          </p>
          <p className="text-lg text-gothic-steel max-w-3xl mx-auto font-noir">
            Submit your darkest confessions to the blood-traced networks. 
            Share your fragments of guilt, desire, and crimson truths.
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <button
            onClick={() => setShowSubmissionForm(!showSubmissionForm)}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gothic-crimson/20 text-gothic-crimson border border-gothic-crimson/30 rounded-lg hover:bg-gothic-crimson/30 transition-colors font-tech"
          >
            <Plus size={20} />
            <span>Submit New Confession</span>
          </button>
        </motion.div>

        {/* Submission Form */}
        {showSubmissionForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12"
          >
            <div className="border border-gothic-crimson/30 rounded-lg p-8" style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%)'
            }}>
              <h3 className="text-2xl font-gothic font-bold text-gothic-silver mb-6">
                Submit Your Confession
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gothic-silver font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gothic-crimson/30 rounded-md text-gothic-silver focus:border-gothic-crimson/50 focus:outline-none"
                    style={{backgroundColor: '#1a1a1a'}}
                    placeholder="Enter your confession's title..."
                  />
                </div>

                <div>
                  <label className="block text-gothic-silver font-medium mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 border border-gothic-crimson/30 rounded-md text-gothic-silver focus:border-gothic-crimson/50 focus:outline-none resize-none"
                    style={{backgroundColor: '#1a1a1a'}}
                    placeholder="Share your blood-traced confession from the Crimson Quarter..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="px-6 py-3 border border-gothic-crimson/30 text-gothic-steel rounded-lg hover:bg-gothic-charcoal/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gothic-crimson/20 text-gothic-crimson border border-gothic-crimson/30 rounded-lg hover:bg-gothic-crimson/30 transition-colors flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Submit Confession</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* User's Confessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-8">
            Your Submitted Confessions ({confessions.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-gothic-crimson border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gothic-steel mt-4">Loading your confessions...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center py-16 border border-gothic-crimson/20 rounded-lg" style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(10, 10, 10, 0.8) 100%)'
            }}>
              <MessageCircle size={64} className="mx-auto text-gothic-steel mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Confessions Yet</h3>
              <p className="text-gothic-steel mb-6">
                You haven't submitted any confessions to the blood-traced networks. 
                Share your first transmission from the Crimson Quarter.
              </p>
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gothic-crimson/20 text-gothic-crimson border border-gothic-crimson/30 rounded-lg hover:bg-gothic-crimson/30 transition-colors"
              >
                <Plus size={16} />
                <span>Submit Your First Confession</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {confessions.map((confession, index) => (
                <motion.div
                  key={confession.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gothic-crimson/30 rounded-lg p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-2">
                        {confession.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(confession.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>Submitted</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-tech font-bold rounded-full border ${getStatusColor(confession.status)}`}>
                      {confession.status.charAt(0).toUpperCase() + confession.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gothic-steel leading-relaxed mb-4 font-noir">
                    {confession.content.length > 200 
                      ? `${confession.content.substring(0, 200)}...` 
                      : confession.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gothic-crimson/20">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gothic-crimson">
                        <MessageCircle size={14} />
                        <span className="text-sm">Confession</span>
                      </div>
                      
                      {confession.content.length > 200 && (
                        <button
                          onClick={() => readConfession(confession)}
                          className="flex items-center space-x-2 px-3 py-1 bg-gothic-crimson/10 hover:bg-gothic-crimson/20 border border-gothic-crimson/30 rounded-md transition-colors text-gothic-crimson hover:text-red-300 text-sm"
                          title="Read Full Confession"
                        >
                          <Eye size={14} />
                          <span className="font-tech">Read Full Confession</span>
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gothic-steel">
                      Submitted {new Date(confession.created_at).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Read Full Confession Modal */}
      {showReadModal && readingConfession && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
          onClick={closeReadModal}
          style={{zIndex: 99999}}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/95 border border-gothic-crimson/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(42, 42, 42, 0.95) 100%)'
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gothic-crimson/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-2">
                    {readingConfession.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gothic-crimson" />
                      <span className="text-gothic-crimson font-medium">Your Confession</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(readingConfession.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{new Date(readingConfession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-tech font-bold rounded-full border ${getStatusColor(readingConfession.status)}`}>
                      {readingConfession.status.charAt(0).toUpperCase() + readingConfession.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={closeReadModal}
                    className="p-2 hover:bg-gothic-crimson/10 rounded-lg transition-colors text-gothic-silver hover:text-gothic-crimson"
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="border-l-4 border-gothic-crimson/50 pl-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
                <p className="text-gothic-silver italic text-lg leading-relaxed font-noir whitespace-pre-wrap">
                  "{readingConfession.content}"
                </p>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
