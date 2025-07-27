'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Clock, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EmailVerificationPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pending_verification_email');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pending_verification_email', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to register
      router.push('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email || isResending || !canResend) return;

    setIsResending(true);
    setResendStatus('idle');

    try {
      // Get the correct redirect URL with fallbacks
      const redirectUrl = process.env.NEXT_PUBLIC_EMAIL_REDIRECT_URL ||
        (process.env.NODE_ENV === 'production' 
          ? 'https://lamentandquill.com/verify-email'
          : `${window.location.origin}/verify-email`);

      console.log('Resend redirect URL:', redirectUrl);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Resend error:', error);
        setResendStatus('error');
      } else {
        setResendStatus('success');
        setCanResend(false);
        setCountdown(60);
        
        // Start new countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Resend exception:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-gothic-charcoal to-gothic-dark-gray">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="gothic-container p-8 text-center rounded-lg tech-border">
          {/* Header Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <div className="mx-auto w-16 h-16 bg-gothic-silver/20 rounded-full flex items-center justify-center border border-gothic-silver/30">
              <Mail className="text-gothic-silver" size={32} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-gothic text-gothic-silver mb-4"
          >
            Verify Your Chronicle
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            <p className="text-gothic-steel mb-4">
              A verification link has been sent to:
            </p>
            <div className="bg-gothic-dark-gray/30 rounded-lg p-3 border border-gothic-dark-gray/50">
              <p className="text-gothic-silver font-medium break-all">
                {email}
              </p>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-6 space-y-3"
          >
            <div className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 bg-gothic-crimson/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gothic-crimson text-sm font-bold">1</span>
              </div>
              <p className="text-gothic-steel text-sm">
                Check your email inbox (and spam folder)
              </p>
            </div>
            
            <div className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 bg-gothic-silver/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gothic-silver text-sm font-bold">2</span>
              </div>
              <p className="text-gothic-steel text-sm">
                Click the verification link in the email
              </p>
            </div>
            
            <div className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 bg-gothic-crimson/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gothic-crimson text-sm font-bold">3</span>
              </div>
              <p className="text-gothic-steel text-sm">
                Return to login with your verified account
              </p>
            </div>
          </motion.div>

          {/* Resend Status */}
          {resendStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-gothic-green/20 border border-gothic-green/30 rounded-lg"
            >
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="text-gothic-green" size={16} />
                <p className="text-gothic-green text-sm">
                  Verification email sent successfully!
                </p>
              </div>
            </motion.div>
          )}

          {resendStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-gothic-crimson/20 border border-gothic-crimson/30 rounded-lg"
            >
              <p className="text-gothic-crimson text-sm">
                Failed to resend email. Please try again later.
              </p>
            </motion.div>
          )}

          {/* Resend Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6"
          >
            <button
              onClick={handleResendVerification}
              disabled={!canResend || isResending}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canResend && !isResending
                  ? 'cyber-button'
                  : 'bg-gothic-dark-gray/50 text-gothic-steel/50 cursor-not-allowed border border-gothic-dark-gray/30'
              }`}
            >
              {isResending ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin" size={16} />
                  Sending...
                </div>
              ) : canResend ? (
                'Resend Verification Email'
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} />
                  Resend in {formatTime(countdown)}
                </div>
              )}
            </button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-3"
          >
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-gothic-dark-gray text-gothic-steel rounded-lg hover:bg-gothic-dark-gray/80 transition-colors text-center font-medium"
            >
              Go to Login
            </Link>
            
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-gothic-steel hover:text-gothic-silver transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back to Registration
            </Link>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gothic-dark-gray/30"
          >
            <p className="text-gothic-steel text-xs">
              The verification link will expire in 24 hours.<br />
              If you don&apos;t receive the email, check your spam folder.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
