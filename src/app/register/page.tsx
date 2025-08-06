'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletterSubscription: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Get the correct redirect URL with fallbacks
      const redirectUrl = process.env.NEXT_PUBLIC_EMAIL_REDIRECT_URL ||
        (process.env.NODE_ENV === 'production' 
          ? 'https://lamentandquill.com/verify-email'
          : `${window.location.origin}/verify-email`);

      console.log('Registration redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: formData.username,
            newsletter_subscription: formData.newsletterSubscription
          }
        }
      });

      if (error) {
        setError(`Registration failed: ${error.message}`);
        console.error('Supabase registration error:', error);
        return;
      }

      if (data.user) {
        // Create user profile using API endpoint to bypass RLS
        try {
          console.log('Creating profile for user:', data.user.id, 'with username:', formData.username);
          
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              username: formData.username,
              user_role: 'user',
              city_affiliation: 'neutral'
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('Profile creation API error:', result);
            // Don't fail the registration, just log the error
          } else {
            console.log('Profile created successfully via API');
            
            // Subscribe to newsletter if user opted in
            if (formData.newsletterSubscription) {
              try {
                const newsletterResponse = await fetch('/api/newsletter/subscribe', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_id: data.user.id,
                    email: formData.email,
                    preferences: {
                      new_posts: true,
                      newsletters: true,
                      announcements: true
                    }
                  }),
                });

                if (!newsletterResponse.ok) {
                  console.error('Newsletter subscription failed:', await newsletterResponse.json());
                }
              } catch (newsletterErr) {
                console.error('Newsletter subscription exception:', newsletterErr);
              }
            }
          }
        } catch (profileErr) {
          console.error('Profile creation exception:', profileErr);
        }

        // Redirect to verification pending page instead of showing success message
        router.push(`/email-verification-pending?email=${encodeURIComponent(formData.email)}`);
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

        {/* Registration Form */}
        <div className="gothic-container p-8 rounded-lg tech-border">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <UserPlus size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h1 className="text-3xl font-gothic font-bold text-gothic-silver glow-text">
                Begin Your Chronicle
              </h1>
              <p className="text-gothic-steel mt-2">
                Join the convergence of two cities, two destinies
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gothic-silver mb-2">
                Chronicle Name
              </label>
              <input
                type="text"
                id="username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md 
                         text-gothic-silver placeholder-gothic-steel focus:outline-none focus:border-gothic-crimson 
                         focus:ring-1 focus:ring-gothic-crimson transition-colors"
                placeholder="Choose your identity in the chronicles"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
              transition={{ delay: 0.5, duration: 0.5 }}
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
                  placeholder="Create your password"
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gothic-silver mb-2">
                Confirm Shadow Key
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md 
                           text-gothic-silver placeholder-gothic-steel focus:outline-none focus:border-gothic-crimson 
                           focus:ring-1 focus:ring-gothic-crimson transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gothic-steel hover:text-gothic-silver"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-sm"
            >
              <label className="flex items-start text-gothic-steel">
                <input type="checkbox" required className="mr-3 mt-1 rounded bg-gothic-charcoal border-gothic-dark-gray" />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-gothic-crimson hover:text-gothic-silver transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-gothic-crimson hover:text-gothic-silver transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="text-sm"
            >
              <label className="flex items-start text-gothic-steel">
                <input 
                  type="checkbox" 
                  checked={formData.newsletterSubscription}
                  onChange={(e) => setFormData({ ...formData, newsletterSubscription: e.target.checked })}
                  className="mr-3 mt-1 rounded bg-gothic-charcoal border-gothic-dark-gray focus:ring-gothic-crimson focus:border-gothic-crimson" 
                />
                <span>
                  Stay informed of new chronicles and announcements from both cities
                  <span className="block text-xs text-gothic-steel/70 mt-1">
                    (You can change this preference in your profile settings at any time)
                  </span>
                </span>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-full cyber-button text-center py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Initiating Chronicle...' : 'Begin Your Journey'}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gothic-steel">
              Already part of the chronicles?{' '}
              <Link href="/login" className="text-gothic-crimson hover:text-gothic-silver transition-colors font-medium">
                Continue your narrative
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
