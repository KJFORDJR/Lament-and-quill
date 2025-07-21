'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, LogIn, AlertTriangle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MaintenancePage() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`Login failed: ${error.message}`);
        console.error('Admin login error:', error);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile || profile.user_role !== 'admin') {
          // Not an admin, sign out and show error
          await supabase.auth.signOut();
          setError('Access denied. Only administrators can access during maintenance.');
          return;
        }

        // Admin login successful, redirect to admin panel
        router.push('/admin');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gothic-black via-gothic-dark-gray to-gothic-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-gothic-dark-gray/30 border border-gothic-red/30 rounded-lg backdrop-blur-sm p-8 text-center">
          {/* Maintenance Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.3 }}
            className="w-20 h-20 bg-gothic-red/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Settings className="w-10 h-10 text-gothic-red animate-spin" style={{ animationDuration: '3s' }} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl font-gothic font-bold text-gothic-silver glow-text mb-4"
          >
            System Under Maintenance
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4 mb-8"
          >
            <p className="text-gothic-steel leading-relaxed">
              The nexus is temporarily offline for system upgrades and maintenance. 
              The chronicles will return shortly.
            </p>
            <div className="flex items-center justify-center text-gothic-steel text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 text-gothic-red" />
              <span>Normal operations will resume soon</span>
            </div>
          </motion.div>

          {!showAdminLogin ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              onClick={() => setShowAdminLogin(true)}
              className="cyber-button flex items-center justify-center gap-2 w-full"
            >
              <LogIn className="w-5 h-5" />
              Administrator Access
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full cyber-input px-4 py-3 bg-gothic-charcoal border border-gothic-dark-gray rounded-lg focus:border-gothic-red focus:ring-1 focus:ring-gothic-red text-gothic-silver placeholder-gothic-steel"
                    placeholder="Enter admin email"
                    required
                  />
                </div>

                <div className="text-left">
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full cyber-input px-4 py-3 pr-12 bg-gothic-charcoal border border-gothic-dark-gray rounded-lg focus:border-gothic-red focus:ring-1 focus:ring-gothic-red text-gothic-silver placeholder-gothic-steel"
                      placeholder="Enter password"
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
                </div>

                {error && (
                  <div className="p-3 bg-gothic-red/20 border border-gothic-red/40 rounded text-gothic-red text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 cyber-button-secondary py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 cyber-button py-2 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gothic-silver border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Access System
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 pt-6 border-t border-gothic-red/20"
          >
            <p className="text-xs text-gothic-steel/70">
              Lament and Quill - Two cities. Two Ghosts. One reckoning.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
