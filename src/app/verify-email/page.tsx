'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw, User, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      // Get URL parameters
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');

      console.log('Verification parameters:', { token, type, access_token, refresh_token });

      // Handle different verification types
      if (type === 'signup' || type === 'email_change') {
        try {
          let result;
          
          if (token) {
            // Handle token-based verification
            result = await supabase.auth.verifyOtp({
              token_hash: token,
              type: type as any
            });
          } else if (access_token && refresh_token) {
            // Handle session-based verification
            result = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
          } else {
            throw new Error('Missing verification parameters');
          }

          console.log('Verification result:', result);

          if (result.error) {
            console.error('Verification error:', result.error);
            if (result.error.message.includes('expired') || result.error.message.includes('invalid')) {
              setStatus('expired');
              setMessage('Your verification link has expired or is invalid. Please request a new one.');
            } else {
              setStatus('error');
              setMessage(result.error.message || 'Email verification failed. Please try again.');
            }
          } else {
            setStatus('success');
            setMessage('Your email has been verified successfully! Welcome to the convergence.');
            
            // Get user email for display
            if (result.data.user?.email) {
              setUserEmail(result.data.user.email);
            }
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push('/login?verified=true');
            }, 3000);
          }
        } catch (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage('An unexpected error occurred during verification. Please try again.');
        }
      } else {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
      }
    };

    handleEmailVerification();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Redirect to register page with resend parameter
      router.push('/register?resend=true');
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="animate-spin text-gothic-silver" size={40} />;
      case 'success':
        return <CheckCircle className="text-gothic-green" size={40} />;
      case 'error':
      case 'expired':
        return <AlertCircle className="text-gothic-crimson" size={40} />;
      default:
        return <Mail className="text-gothic-silver" size={40} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-gothic-green/20 border-gothic-green/30';
      case 'error':
      case 'expired':
        return 'bg-gothic-crimson/20 border-gothic-crimson/30';
      default:
        return 'bg-gothic-silver/20 border-gothic-silver/30';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Chronicle...';
      case 'success':
        return 'Chronicle Activated!';
      case 'expired':
        return 'Verification Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
    }
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
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
            className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2 ${getStatusColor()}`}
          >
            {getStatusIcon()}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-gothic font-bold text-gothic-silver glow-text">
              {getStatusTitle()}
            </h1>
            
            <p className="text-gothic-steel leading-relaxed">
              {message}
            </p>

            {userEmail && status === 'success' && (
              <div className="bg-gothic-dark-gray/20 border border-gothic-green/20 rounded p-4 mt-4">
                <div className="flex items-center justify-center text-gothic-green text-sm">
                  <User className="w-4 h-4 mr-2" />
                  <span>Verified: {userEmail}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 space-y-3"
          >
            {status === 'success' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login?verified=true')}
                  className="w-full cyber-button flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>Enter the Nexus</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <p className="text-xs text-gothic-steel">
                  Redirecting automatically in a few seconds...
                </p>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full cyber-button flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-5 h-5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Processing...' : 'Request New Link'}</span>
                </button>
                
                <button
                  onClick={() => router.push('/register')}
                  className="w-full cyber-button-secondary flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  <span>Create New Account</span>
                </button>
              </div>
            )}

            {status === 'loading' && (
              <div className="bg-gothic-dark-gray/20 border border-gothic-silver/20 rounded p-4">
                <p className="text-xs text-gothic-steel">
                  Processing your verification link...
                </p>
              </div>
            )}

            {/* Back to Home Link */}
            <button
              onClick={() => router.push('/')}
              className="w-full text-gothic-steel hover:text-gothic-silver transition-colors text-sm"
            >
              Return to the Nexus
            </button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-6 border-t border-gothic-dark-gray"
          >
            <p className="text-xs text-gothic-steel/70">
              Two cities. Two ghosts. One reckoning.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
