'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function UnsubscribePage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      handleUnsubscribe(tokenParam);
    } else {
      setError('Invalid unsubscribe link');
      setLoading(false);
    }
  }, []);

  const handleUnsubscribe = async (userToken: string) => {
    try {
      const response = await fetch(`/api/newsletter/subscribe?user_id=${userToken}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unsubscribe');
      }
    } catch (err) {
      setError('An error occurred while unsubscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gothic-steel hover:text-gothic-silver transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Return to the Nexus
        </Link>

        {/* Unsubscribe Form */}
        <div className="gothic-container p-8 rounded-lg tech-border">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Mail size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h1 className="text-3xl font-gothic font-bold text-gothic-silver glow-text mb-2">
                Newsletter Unsubscribe
              </h1>
              <p className="text-gothic-steel">
                Managing your subscription to the chronicles
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gothic-silver">Processing your request...</div>
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Successfully Unsubscribed
              </h2>
              <p className="text-gothic-steel mb-6">
                You have been removed from our newsletter. You will no longer receive 
                updates from the chronicles of Silver Heights and Crimson Vale.
              </p>
              <div className="space-y-4">
                <Link href="/profile">
                  <div className="cyber-button w-full text-center py-3">
                    Manage All Preferences
                  </div>
                </Link>
                <Link href="/">
                  <div className="cyber-button-secondary w-full text-center py-3">
                    Return to Chronicles
                  </div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Unsubscribe Failed
              </h2>
              <p className="text-gothic-steel mb-6">
                {error || 'Unable to process your unsubscribe request at this time.'}
              </p>
              <div className="space-y-4">
                <Link href="/profile">
                  <div className="cyber-button w-full text-center py-3">
                    Manage Preferences Manually
                  </div>
                </Link>
                <Link href="/">
                  <div className="cyber-button-secondary w-full text-center py-3">
                    Return to Chronicles
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gothic-steel text-sm">
              Want to resubscribe?{' '}
              <Link href="/register" className="text-gothic-crimson hover:text-gothic-silver transition-colors">
                Create an account
              </Link>
              {' '}or{' '}
              <Link href="/profile" className="text-gothic-crimson hover:text-gothic-silver transition-colors">
                manage your preferences
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
