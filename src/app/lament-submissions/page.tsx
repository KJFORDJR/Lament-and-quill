'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Coins, Clock, User, Send, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Submission {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  author_id: string;
  tip_count: number;
  total_tip_amount: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function LamentSubmissions() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_anonymous: false
  });

  useEffect(() => {
    if (user) {
      fetchUserSubmissions();
    }
  }, [user]);

  const fetchUserSubmissions = async () => {
    if (!user) return;
    
    try {
      // Use the API endpoint to bypass RLS policies
      const response = await fetch(`/api/submissions/user?userId=${user.id}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching submissions:', result);
        return;
      }

      setSubmissions(result.data || []);
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
      console.log('Submitting with user:', user);
      console.log('User ID:', user?.id);
      console.log('Profile:', profile);
      console.log('User object keys:', user ? Object.keys(user) : 'no user');
      console.log('Form data:', formData);
      
      // Get username from profile or user metadata
      const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'anonymous';
      console.log('Using username:', username);
      
      // Use the API endpoint to bypass RLS policies
      const response = await fetch('/api/submissions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          is_anonymous: formData.is_anonymous,
          author_id: user.id,
          username: username
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API submission error:', result);
        throw new Error(result.error || 'Submission failed');
      }

      console.log('Submission successful:', result);
      alert('Your lament has been submitted for review!');
      setFormData({ title: '', content: '', is_anonymous: false });
      setShowSubmissionForm(false);
      fetchUserSubmissions();
    } catch (err: any) {
      console.error('Submit error details:', err);
      alert(`Error submitting your lament: ${err.message || 'Please try again.'}`);
    }
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
        background: 'linear-gradient(135deg, #708090 0%, #2a2a2a 100%)'
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-gothic font-bold mb-6 text-gothic-silver">
            Lament Submissions
          </h1>
          <p className="text-xl text-green-400 mb-8">
            Please log in to submit and view your laments from Silver Heights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: 'linear-gradient(135deg, #708090 0%, #2a2a2a 100%)'
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
            Lament Submissions
          </h1>
          <p className="text-xl text-green-400 mb-2 font-tech">
            Neural Transmissions from Silver Heights
          </p>
          <p className="text-lg text-gothic-steel max-w-3xl mx-auto font-noir">
            Submit your digital laments to the quantum consciousness networks. 
            Share your fragments of memory, hope, and technological transcendence.
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
            className="inline-flex items-center space-x-2 px-8 py-4 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors font-tech"
          >
            <Plus size={20} />
            <span>Submit New Lament</span>
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
            <div className="border border-gothic-silver/30 rounded-lg p-8" style={{
              background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
            }}>
              <h3 className="text-2xl font-gothic font-bold text-gothic-silver mb-6">
                Submit Your Lament
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
                    className="w-full px-4 py-3 border border-gothic-silver/30 rounded-md text-gothic-silver focus:border-green-400/50 focus:outline-none"
                    style={{backgroundColor: '#1a1a1a'}}
                    placeholder="Enter your lament's title..."
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
                    className="w-full px-4 py-3 border border-gothic-silver/30 rounded-md text-gothic-silver focus:border-green-400/50 focus:outline-none resize-none"
                    style={{backgroundColor: '#1a1a1a'}}
                    placeholder="Share your neural transmission from Silver Heights..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                    className="w-4 h-4 text-green-400 border-gothic-silver/30 rounded focus:ring-green-400"
                    style={{backgroundColor: '#1a1a1a'}}
                  />
                  <label htmlFor="anonymous" className="text-gothic-silver font-medium flex items-center space-x-2">
                    {formData.is_anonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Submit anonymously</span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="px-6 py-3 border border-gothic-silver/30 text-gothic-steel rounded-lg hover:bg-gothic-charcoal/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Submit Lament</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* User's Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-8">
            Your Submitted Laments ({submissions.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gothic-steel mt-4">Loading your laments...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 border border-gothic-silver/20 rounded-lg" style={{
              background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%)'
            }}>
              <MessageCircle size={64} className="mx-auto text-gothic-steel mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Laments Yet</h3>
              <p className="text-gothic-steel mb-6">
                You haven't submitted any laments to the neural networks. 
                Share your first transmission from Silver Heights.
              </p>
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Plus size={16} />
                <span>Submit Your First Lament</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gothic-silver/30 rounded-lg p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-2">
                        {submission.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {submission.is_anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{submission.is_anonymous ? 'Anonymous' : 'Public'}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-tech font-bold rounded-full border ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gothic-steel leading-relaxed mb-4 font-noir">
                    {submission.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gothic-silver/20">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-green-400">
                        <Heart size={14} />
                        <span className="text-sm">{submission.tip_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400">
                        <Coins size={14} />
                        <span className="text-sm">{submission.total_tip_amount || 0} credits</span>
                      </div>
                    </div>
                    <span className="text-xs text-gothic-steel">
                      Submitted {new Date(submission.created_at).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
