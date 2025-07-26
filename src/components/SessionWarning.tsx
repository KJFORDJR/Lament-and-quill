'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const handleSessionWarning = () => {
      setShowWarning(true);
      setTimeLeft(300);
    };

    const handleSessionTimeout = () => {
      setShowWarning(false);
      // Could show a "Session Expired" notification here
    };

    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionTimeout', handleSessionTimeout);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionTimeout', handleSessionTimeout);
    };
  }, []);

  useEffect(() => {
    if (!showWarning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    sessionStorage.setItem('last_activity', Date.now().toString());
    // Trigger a small activity to reset the timers
    document.dispatchEvent(new Event('click'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Warning Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gothic-charcoal border border-gothic-crimson/50 rounded-lg p-8 max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gothic-crimson/20 rounded-full">
                  <AlertTriangle className="text-gothic-crimson" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-gothic text-gothic-silver">
                    Session Expiring
                  </h3>
                  <p className="text-gothic-steel text-sm">
                    Your session will expire soon
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gothic-dark-gray/30 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="text-gothic-crimson" size={20} />
                  <span className="text-2xl font-mono text-gothic-crimson font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-gothic-steel text-sm">
                  Time remaining before automatic logout
                </p>
              </div>

              {/* Message */}
              <p className="text-gothic-steel mb-6 text-center">
                You&apos;ve been inactive for a while. To protect your account and any unsaved work, 
                your session will expire automatically.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleStayLoggedIn}
                  className="cyber-button flex items-center justify-center gap-2 w-full py-3"
                >
                  <RefreshCw size={18} />
                  Stay Logged In
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-gothic-dark-gray text-gothic-steel rounded-lg hover:bg-gothic-dark-gray/80 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
