import { supabase } from '@/lib/supabase';

/**
 * Clear corrupted authentication state
 */
export async function clearAuthState() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local storage manually as backup
    if (typeof window !== 'undefined') {
      // Clear all Supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage too
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleared successfully');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}

/**
 * Refresh the page to restart auth state
 */
export function refreshAuthState() {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
