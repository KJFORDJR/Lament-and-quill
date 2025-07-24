// LOGOUT FIX SCRIPT
// Run this in your browser console if logout is still not working
// This will clear all cached authentication data

console.log('🔧 FIXING LOGOUT ISSUES...');

// Step 1: Clear all Supabase localStorage
console.log('📦 Clearing localStorage...');
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase')) {
    localStorage.removeItem(key);
    console.log('✅ Removed localStorage:', key);
  }
});

// Step 2: Clear all Supabase sessionStorage
console.log('📦 Clearing sessionStorage...');
Object.keys(sessionStorage).forEach(key => {
  if (key.startsWith('sb-') || key.includes('supabase')) {
    sessionStorage.removeItem(key);
    console.log('✅ Removed sessionStorage:', key);
  }
});

// Step 3: Clear any auth-related cookies
console.log('🍪 Clearing auth cookies...');
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Step 4: Force clear any remaining Supabase state
console.log('🧹 Final cleanup...');
try {
  // If supabase is available, sign out
  if (typeof window !== 'undefined' && window.supabase) {
    window.supabase.auth.signOut();
  }
} catch (e) {
  console.log('Supabase not available, continuing...');
}

console.log('✅ LOGOUT FIX COMPLETE!');
console.log('🔄 Refreshing page in 2 seconds...');

setTimeout(() => {
  window.location.href = '/';
}, 2000);
