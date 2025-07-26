import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
  city_affiliation: string;
  user_role: string;
  created_at: string;
  last_seen?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session timeout management
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetActivityTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      
      if (user) {
        sessionStorage.setItem('last_activity', Date.now().toString());
        
        // Show warning after 25 minutes of inactivity
        warningTimer = setTimeout(() => {
          const event = new CustomEvent('sessionWarning');
          window.dispatchEvent(event);
        }, 25 * 60 * 1000);

        // Auto-logout after 30 minutes
        logoutTimer = setTimeout(async () => {
          await supabase.auth.signOut();
          const event = new CustomEvent('sessionTimeout');
          window.dispatchEvent(event);
        }, 30 * 60 * 1000);
      }
    };

    // Get initial session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Clear any corrupted session data
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          sessionStorage.setItem('auth_session_active', 'true');
          sessionStorage.setItem('last_activity', Date.now().toString());
          fetchProfile(session.user.id);
          resetActivityTimers();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear corrupted auth state
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
        setLoading(false);
        sessionStorage.clear();
        localStorage.removeItem('forum_draft');
        clearTimeout(warningTimer);
        clearTimeout(logoutTimer);
        return;
      } else if (event === 'SIGNED_IN') {
        sessionStorage.setItem('auth_session_active', 'true');
        sessionStorage.setItem('last_activity', Date.now().toString());
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        resetActivityTimers();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Track user activity for session timeout
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimers, true);
    });

    return () => {
      subscription.unsubscribe();
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimers, true);
      });
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading };
}
