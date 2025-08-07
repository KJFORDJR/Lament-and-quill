'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Check, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PollOption {
  id: string;
  option_text: string;
  display_order: number;
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  poll_options: PollOption[];
}

interface PollAnalytics {
  analytics: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
}

export default function PollBanner() {
  const { user, session } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [previousPollId, setPreviousPollId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchActivePoll();
  }, []);

  useEffect(() => {
    if (poll && user && session) {
      // Reset states if this is a new poll
      if (poll.id !== previousPollId) {
        setHasVoted(false);
        setSelectedOption(null);
        setShowResults(false);
        setAnalytics(null);
        setPreviousPollId(poll.id);
      }
      
      checkIfUserVoted();
    }
  }, [poll, user, session, previousPollId]);

  const fetchActivePoll = async () => {
    try {
      const response = await fetch('/api/polls');
      const data = await response.json();
      
      if (response.ok && data.poll) {
        setPoll(data.poll);
        
        // Check if poll has expired
        if (data.poll.expires_at && new Date(data.poll.expires_at) < new Date()) {
          setShowResults(true);
          fetchAnalytics(data.poll.id);
        }
      } else {
        setPoll(null);
      }
    } catch (error) {
      setPoll(null);
    }
  };

  const checkIfUserVoted = async () => {
    if (!poll || !user || !session) return;

    try {
      const response = await fetch(`/api/polls/vote-status?pollId=${poll.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setHasVoted(data.hasVoted);
        if (data.hasVoted) {
          setShowResults(true);
          fetchAnalytics(poll.id);
        }
      }
    } catch (error) {
      // Ignore error - assume user hasn't voted
      setHasVoted(false);
    }
  };

  const fetchAnalytics = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/analytics?id=${pollId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics({
          analytics: data.analytics,
          totalVotes: data.totalVotes
        });
      }
    } catch (error) {
      // Ignore error
    }
  };

  const submitVote = async () => {
    if (!poll || !selectedOption || !user || !session || isSubmitting || hasVoted) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selectedOption
        })
      });

      if (response.ok) {
        setHasVoted(true);
        setShowResults(true);
        setSelectedOption(null); // Clear selection after successful vote
        fetchAnalytics(poll.id);
      } else {
        const error = await response.json();
        if (error.error === 'You have already voted in this poll') {
          setHasVoted(true);
          setShowResults(true);
          setSelectedOption(null);
          fetchAnalytics(poll.id);
        } else {
          alert(error.error || 'Failed to submit vote');
        }
      }
    } catch (error) {
      alert('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = poll?.expires_at && new Date(poll.expires_at) < new Date();
  const shouldShowResults = showResults || hasVoted || isExpired;

  if (!poll || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-gothic-crimson/20 via-gothic-dark-gray to-gothic-silver/20 border-b border-gothic-silver/30"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 size={20} className="text-gothic-green" />
                  <span className="text-sm font-medium text-gothic-silver">
                    Community Poll
                  </span>
                </div>
                {isExpired && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    <Clock size={10} className="mr-1" />
                    Expired
                  </span>
                )}
              </div>

              <h3 className="text-lg font-gothic font-bold text-gothic-silver mb-2">
                {poll.question}
              </h3>

              {poll.description && (
                <p className="text-sm text-gothic-steel mb-4">
                  {poll.description}
                </p>
              )}

              {!user ? (
                <div className="text-sm text-gothic-steel italic">
                  Please log in to participate in this poll
                </div>
              ) : shouldShowResults && analytics ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-gothic-steel mb-3 flex items-center">
                    <Users size={14} className="mr-1" />
                    {analytics.totalVotes} total votes
                  </div>
                  
                  {analytics.analytics.map((option) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gothic-silver">
                          {option.text}
                        </span>
                        <span className="text-sm text-gothic-steel">
                          {option.votes} votes ({option.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gothic-dark-gray/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${option.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="bg-gradient-to-r from-gothic-green to-gothic-green/70 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}

                  {hasVoted && (
                    <div className="text-sm text-gothic-green flex items-center mt-3">
                      <Check size={14} className="mr-1" />
                      Thank you for voting!
                    </div>
                  )}
                </motion.div>
              ) : !hasVoted && !isExpired ? (
                <div className="space-y-3">
                  {poll.poll_options.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption(option.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedOption === option.id
                          ? 'border-gothic-green bg-gothic-green/10 text-gothic-green'
                          : 'border-gothic-dark-gray bg-gothic-charcoal/20 text-gothic-silver hover:border-gothic-silver/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id
                            ? 'border-gothic-green bg-gothic-green'
                            : 'border-gothic-steel'
                        }`}>
                          {selectedOption === option.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {option.option_text}
                        </span>
                      </div>
                    </motion.button>
                  ))}

                  {selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-3 pt-2"
                    >
                      <button
                        onClick={submitVote}
                        disabled={isSubmitting}
                        className="cyber-button text-sm px-4 py-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                      </button>
                      <button
                        onClick={() => setSelectedOption(null)}
                        className="cyber-button-secondary text-sm px-4 py-2"
                      >
                        Clear
                      </button>
                    </motion.div>
                  )}

                  {poll.expires_at && (
                    <div className="text-xs text-gothic-steel mt-3 flex items-center">
                      <Clock size={12} className="mr-1" />
                      Expires: {new Date(poll.expires_at).toLocaleDateString()} at{' '}
                      {new Date(poll.expires_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gothic-steel italic">
                  {hasVoted 
                    ? 'You have already voted in this poll. Thank you for participating!' 
                    : isExpired 
                    ? 'This poll has expired.'
                    : 'Loading poll status...'
                  }
                </div>
              )}
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="ml-4 p-1 text-gothic-steel hover:text-gothic-silver transition-colors"
              title="Dismiss poll"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
