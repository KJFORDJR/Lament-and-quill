'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
      });

      if (error) {
        setError(`Reset failed: ${error.message}`);
        console.error('Password reset error:', error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gothic-black via-gothic-dark-gray to-gothic-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md p-8"
        >
          <div className="bg-gothic-dark-gray/30 border border-gothic-green/30 rounded-lg backdrop-blur-sm p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
              className="w-16 h-16 bg-gothic-green/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-gothic-green" />
            </motion.div>

            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">
              Reset Link Sent
            </h2>
            <p className="text-gothic-steel mb-6 leading-relaxed">
              We&apos;ve sent a password reset link to <strong className="text-gothic-green">{email}</strong>. 
              Check your email and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-gothic-steel/70 mb-6">
              Don&apos;t see the email? Check your spam folder or wait a few minutes for delivery.
            </p>
            
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full cyber-button py-3"
            >
              Return to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gothic-black via-gothic-dark-gray to-gothic-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/login"
            className="inline-flex items-center text-gothic-crimson hover:text-gothic-silver transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-gothic font-bold text-gothic-silver glow-text mb-2">
            Forgot Password
          </h1>
          <p className="text-gothic-steel font-noir italic">
            Restore access to your digital realm
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gothic-dark-gray/30 border border-gothic-red/30 rounded-lg backdrop-blur-sm p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-gothic-crimson/20 border border-gothic-crimson/40 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-gothic-crimson mr-3 flex-shrink-0" />
              <span className="text-gothic-crimson text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-2"
            >
              <label htmlFor="email" className="block text-sm font-medium text-gothic-silver">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input w-full pl-12 pr-4 py-3 bg-gothic-charcoal border border-gothic-dark-gray rounded-lg focus:border-gothic-red focus:ring-1 focus:ring-gothic-red text-gothic-silver placeholder-gothic-steel"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <p className="text-sm text-gothic-steel/70">
                We&apos;ll send you a link to reset your password
              </p>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full cyber-button text-center py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gothic-steel text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-gothic-crimson hover:text-gothic-silver transition-colors font-medium">
                Return to Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
