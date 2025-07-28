'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  user_role: 'user' | 'admin' | 'moderator';
  city_affiliation: 'crimson' | 'silver' | 'neutral';
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.user_role === 'admin';

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the API endpoint to bypass RLS policies
      const response = await fetch(`/api/profile?userId=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching user profile:', result);
        return null;
      }

      return result.data as UserProfile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error during initialization:', error);
          // Clear any corrupted session data
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          setProfile(userProfile);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        // Clear corrupted auth state
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          // Token refresh handled silently
        }

        // Only update state if we have a valid session or explicitly no session
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || session === null) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id);
            setProfile(userProfile);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state immediately to prevent UI flicker
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force a page refresh to ensure all state is cleared
      // and redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
