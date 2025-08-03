'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated and handle URL fragments
  useEffect(() => {
    const checkAuth = async () => {
      // Check for error parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for errors in URL
      const error_code = hashParams.get('error_code') || urlParams.get('error_code');
      const error_description = hashParams.get('error_description') || urlParams.get('error_description');
      
      if (error_code) {
        if (error_code === 'otp_expired') {
          setError('The password reset link has expired. Please request a new one.');
        } else {
          setError(`Authentication error: ${error_description || error_code}`);
        }
        return;
      }
      
      // Check for access tokens
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Set the session with the tokens from the URL
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          setError('Authentication error. Please try the password reset process again.');
          return;
        }
        
        // Clear the URL hash for security
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      
      // If no tokens in URL, check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setError('Authentication error. Please try the password reset process again.');
        return;
      }
      
      if (!session) {
        // No active session, redirect to forgot password
        router.push('/forgot-password?error=no_session');
        return;
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(`Password reset failed: ${error.message}`);
      } else {
        setSuccess(true);
        // Redirect to login after successful reset
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
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
              Password Reset Complete
            </h2>
            <p className="text-gothic-steel mb-6 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <p className="text-sm text-gothic-steel/70 mb-6">
              Redirecting to login in 3 seconds...
            </p>
            
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full cyber-button py-3"
            >
              Login Now
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
            Reset Password
          </h1>
          <p className="text-gothic-steel font-noir italic">
            Create a new password for your account
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
              <label htmlFor="password" className="block text-sm font-medium text-gothic-silver">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input w-full pl-12 pr-12 py-3 bg-gothic-charcoal border border-gothic-dark-gray rounded-lg focus:border-gothic-red focus:ring-1 focus:ring-gothic-red text-gothic-silver placeholder-gothic-steel"
                  placeholder="Enter your new password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gothic-steel hover:text-gothic-silver transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-2"
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gothic-silver">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="cyber-input w-full pl-12 pr-12 py-3 bg-gothic-charcoal border border-gothic-dark-gray rounded-lg focus:border-gothic-red focus:ring-1 focus:ring-gothic-red text-gothic-silver placeholder-gothic-steel"
                  placeholder="Confirm your new password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gothic-steel hover:text-gothic-silver transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gothic-dark-gray/20 border border-gothic-red/20 rounded p-3"
            >
              <h4 className="text-sm font-medium text-gothic-silver mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gothic-steel space-y-1">
                <li className={password.length >= 6 ? 'text-gothic-green' : ''}>
                  • At least 6 characters long
                </li>
                <li className={password === confirmPassword && password !== '' ? 'text-gothic-green' : ''}>
                  • Passwords match
                </li>
              </ul>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="w-full cyber-button text-center py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
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
