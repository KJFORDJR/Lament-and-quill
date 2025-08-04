'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BarChart3, 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  Calendar,
  ToggleLeft,
  ToggleRight,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Poll {
  id: string;
  question: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  poll_options: Array<{
    id: string;
    option_text: string;
    display_order: number;
  }>;
  poll_votes: Array<{
    id: string;
    option_id: string;
    user_id: string;
    voted_at: string;
  }>;
}

interface PollAnalytics {
  poll: Poll;
  analytics: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
  votingTimeline: Array<{
    id: string;
    option_text: string;
    voted_at: string;
  }>;
}

export default function PollsManagementPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null);
  
  // Create form state
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiresAt: ''
  });

  useEffect(() => {
    if (user) {
      fetchPolls();
    }
  }, [user]);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/admin/polls');
      const data = await response.json();
      
      if (response.ok) {
        setPolls(data.polls || []);
      }
    } catch (error) {
      alert('Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async () => {
    try {
      const filteredOptions = newPoll.options.filter(opt => opt.trim() !== '');
      
      if (!newPoll.question.trim() || filteredOptions.length < 2) {
        alert('Please provide a question and at least 2 options');
        return;
      }

      const response = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          description: newPoll.description,
          options: filteredOptions,
          expiresAt: newPoll.expiresAt || null
        })
      });

      if (response.ok) {
        setNewPoll({ question: '', description: '', options: ['', ''], expiresAt: '' });
        setShowCreateForm(false);
        fetchPolls();
        alert('Poll created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create poll: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create poll');
    }
  };

  const togglePollStatus = async (pollId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/polls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, isActive })
      });

      if (response.ok) {
        fetchPolls();
        alert(`Poll ${isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to update poll: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to update poll status');
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/polls?id=${pollId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPolls();
        setSelectedPoll(null);
        setAnalytics(null);
        alert('Poll deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete poll: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete poll');
    }
  };

  const fetchAnalytics = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/analytics?id=${pollId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data);
        setSelectedPoll(pollId);
      }
    } catch (error) {
      alert('Failed to fetch analytics');
    }
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading polls...</div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <button className="cyber-button-secondary flex items-center space-x-2">
                  <ArrowLeft size={16} />
                  <span>Back to Admin</span>
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-gothic font-bold text-gothic-silver">
                  Polls Management
                </h1>
                <p className="text-gothic-steel">Create and manage community polls</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="cyber-button flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Poll</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="gothic-container p-4 text-center">
              <div className="text-2xl font-bold text-gothic-silver mb-2">
                {polls.length}
              </div>
              <div className="text-sm text-gothic-steel">Total Polls</div>
            </div>
            <div className="gothic-container p-4 text-center">
              <div className="text-2xl font-bold text-gothic-green mb-2">
                {polls.filter(p => p.is_active).length}
              </div>
              <div className="text-sm text-gothic-green">Active Polls</div>
            </div>
            <div className="gothic-container p-4 text-center">
              <div className="text-2xl font-bold text-gothic-silver mb-2">
                {polls.reduce((sum, poll) => sum + poll.poll_votes.length, 0)}
              </div>
              <div className="text-sm text-gothic-steel">Total Votes</div>
            </div>
            <div className="gothic-container p-4 text-center">
              <div className="text-2xl font-bold text-gothic-silver mb-2">
                {polls.filter(p => p.expires_at && new Date(p.expires_at) < new Date()).length}
              </div>
              <div className="text-sm text-gothic-steel">Expired Polls</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Polls List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="gothic-container p-6 rounded-lg"
          >
            <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
              Polls ({polls.length})
            </h2>

            <div className="space-y-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedPoll === poll.id
                      ? 'border-gothic-green bg-gothic-green/10'
                      : 'border-gothic-dark-gray bg-gothic-charcoal/20 hover:border-gothic-silver/50'
                  }`}
                  onClick={() => fetchAnalytics(poll.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gothic-silver mb-1">
                        {poll.question}
                      </h3>
                      {poll.description && (
                        <p className="text-sm text-gothic-steel mb-2">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePollStatus(poll.id, !poll.is_active);
                        }}
                        className={`p-1 rounded transition-colors ${
                          poll.is_active 
                            ? 'text-gothic-green hover:text-gothic-green/70' 
                            : 'text-gothic-steel hover:text-gothic-silver'
                        }`}
                        title={poll.is_active ? 'Deactivate Poll' : 'Activate Poll'}
                      >
                        {poll.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePoll(poll.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Poll"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        poll.is_active 
                          ? 'bg-gothic-green/20 text-gothic-green border border-gothic-green/30'
                          : 'bg-gothic-steel/20 text-gothic-steel border border-gothic-steel/30'
                      }`}>
                        {poll.is_active ? (
                          <>
                            <CheckCircle size={10} className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock size={10} className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      <div className="flex items-center text-gothic-steel">
                        <Users size={12} className="mr-1" />
                        {poll.poll_votes.length} votes
                      </div>
                    </div>
                    <div className="text-gothic-steel">
                      {new Date(poll.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {poll.expires_at && (
                    <div className="mt-2 text-xs text-gothic-steel flex items-center">
                      <Calendar size={10} className="mr-1" />
                      Expires: {new Date(poll.expires_at).toLocaleDateString()}
                      {new Date(poll.expires_at) < new Date() && (
                        <span className="ml-2 text-red-400">(Expired)</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {polls.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3 size={48} className="text-gothic-steel mx-auto mb-4" />
                  <p className="text-gothic-steel">No polls created yet</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 cyber-button-secondary"
                  >
                    Create Your First Poll
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Analytics Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="gothic-container p-6 rounded-lg"
          >
            <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
              Poll Analytics
            </h2>

            {analytics ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gothic-silver mb-2">
                    {analytics.poll.question}
                  </h3>
                  <div className="text-sm text-gothic-steel mb-4">
                    Total Votes: {analytics.totalVotes}
                  </div>
                </div>

                <div className="space-y-3">
                  {analytics.analytics.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gothic-silver">
                          {option.text}
                        </span>
                        <span className="text-sm text-gothic-steel">
                          {option.votes} votes ({option.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gothic-dark-gray rounded-full h-2">
                        <div
                          className="bg-gothic-green h-2 rounded-full transition-all duration-500"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {analytics.votingTimeline.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gothic-silver mb-3">Recent Votes</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analytics.votingTimeline.map((vote, index) => (
                        <div
                          key={vote.id}
                          className="flex justify-between items-center text-sm p-2 bg-gothic-charcoal/30 rounded"
                        >
                          <span className="text-gothic-steel">
                            {vote.option_text}
                          </span>
                          <span className="text-gothic-steel">
                            {new Date(vote.voted_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye size={48} className="text-gothic-steel mx-auto mb-4" />
                <p className="text-gothic-steel">
                  Select a poll to view analytics
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Create Poll Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gothic-dark-gray border border-gothic-silver/30 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Create New Poll
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="What would you like to ask?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    rows={3}
                    placeholder="Additional context for your poll..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Options * (minimum 2)
                  </label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gothic-charcoal border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                          placeholder={`Option ${index + 1}`}
                        />
                        {newPoll.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addOption}
                    className="mt-2 text-sm text-gothic-green hover:text-gothic-green/70 transition-colors"
                  >
                    + Add Option
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Expires At (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newPoll.expiresAt}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPoll({ question: '', description: '', options: ['', ''], expiresAt: '' });
                  }}
                  className="flex-1 cyber-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createPoll}
                  className="flex-1 cyber-button"
                >
                  Create Poll
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
