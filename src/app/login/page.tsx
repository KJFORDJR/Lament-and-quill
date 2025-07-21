'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Redirect to dashboard or home page
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

        {/* Login Form */}
        <div className="gothic-container p-8 rounded-lg tech-border">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <LogIn size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h1 className="text-3xl font-gothic font-bold text-gothic-silver glow-text">
                Enter the Chronicle
              </h1>
              <p className="text-gothic-steel mt-2">
                Resume your journey through the twin cities
              </p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gothic-crimson/10 border border-gothic-crimson/30 rounded-md flex items-center"
            >
              <AlertCircle size={20} className="text-gothic-crimson mr-3" />
              <p className="text-gothic-crimson text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gothic-silver mb-2">
                Chronicle Identifier
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md 
                         text-gothic-silver placeholder-gothic-steel focus:outline-none focus:border-gothic-crimson 
                         focus:ring-1 focus:ring-gothic-crimson transition-colors"
                placeholder="Enter your email address"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gothic-silver mb-2">
                Shadow Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md 
                           text-gothic-silver placeholder-gothic-steel focus:outline-none focus:border-gothic-crimson 
                           focus:ring-1 focus:ring-gothic-crimson transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gothic-steel hover:text-gothic-silver"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center text-gothic-steel">
                <input type="checkbox" className="mr-2 rounded bg-gothic-charcoal border-gothic-dark-gray" />
                Remember this chronicle
              </label>
              <Link href="/forgot-password" className="text-gothic-crimson hover:text-gothic-silver transition-colors">
                Forgotten shadows?
              </Link>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full cyber-button text-center py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accessing...' : 'Enter the Nexus'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gothic-steel">
              New to the chronicles?{' '}
              <Link href="/register" className="text-gothic-crimson hover:text-gothic-silver transition-colors font-medium">
                Begin your narrative
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
