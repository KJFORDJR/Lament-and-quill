// Clear corrupted browser auth state
// Run this in the browser console if you get auth errors

console.log('🔧 Clearing corrupted authentication state...');

// Clear all localStorage items related to Supabase
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase')) {
    localStorage.removeItem(key);
    console.log('Removed localStorage item:', key);
  }
});

// Clear all sessionStorage items related to Supabase
Object.keys(sessionStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase')) {
    sessionStorage.removeItem(key);
    console.log('Removed sessionStorage item:', key);
  }
});

console.log('✅ Auth state cleared! Refreshing page...');
window.location.reload();
