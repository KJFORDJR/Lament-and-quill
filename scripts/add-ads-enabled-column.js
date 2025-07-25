// Script to add ads_enabled column to system_config table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addAdsEnabledColumn() {
  console.log('Adding ads_enabled column to system_config table...');
  
  try {
    // Add the column (this will not fail if column already exists)
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE system_config 
        ADD COLUMN IF NOT EXISTS ads_enabled BOOLEAN DEFAULT false;
      `
    });

    if (alterError) {
      console.log('Note: Column might already exist, trying direct update...');
    }

    // Update existing records to ensure they have the new field
    const { error: updateError } = await supabase
      .from('system_config')
      .update({ ads_enabled: false })
      .is('ads_enabled', null);

    if (updateError && updateError.code !== 'PGRST116') {
      console.error('Error updating existing records:', updateError);
    }

    // Verify the column exists by trying to read it
    const { data, error: selectError } = await supabase
      .from('system_config')
      .select('ads_enabled')
      .limit(1);

    if (selectError) {
      console.error('Error verifying ads_enabled column:', selectError);
    } else {
      console.log('✅ ads_enabled column added successfully!');
      console.log('Current ads_enabled values:', data);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addAdsEnabledColumn();
