const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Running ban system migration...');
    
    // Add columns to profiles table
    console.log('Adding ban columns to profiles table...');
    
    // Check if columns already exist by trying to select them
    try {
      await supabase.from('profiles').select('is_banned').limit(1);
      console.log('✅ Ban columns already exist in profiles table');
    } catch (error) {
      console.log('Adding ban columns to profiles table...');
      // Columns don't exist, but we can't add them via the JS client
      console.log('❌ Cannot add columns via JS client. Please run the SQL directly in Supabase dashboard.');
    }
    
    // Check if ban_history table exists
    try {
      await supabase.from('ban_history').select('id').limit(1);
      console.log('✅ ban_history table already exists');
    } catch (error) {
      console.log('❌ ban_history table does not exist. Please run the SQL migration in Supabase dashboard.');
    }
    
    console.log('✅ Migration check completed!');
    console.log('📝 Please run the SQL in database/add-ban-system.sql directly in your Supabase dashboard if tables/columns are missing.');
    
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigration();
