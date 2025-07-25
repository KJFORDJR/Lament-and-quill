// Script to manually add ads_enabled field to existing system config
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

async function addAdsEnabledField() {
  console.log('Adding ads_enabled field to existing system config...');
  
  try {
    // Get the current config
    const { data: currentConfig, error: fetchError } = await supabase
      .from('system_config')
      .select('*')
      .single();

    if (fetchError) {
      console.error('Error fetching current config:', fetchError);
      return;
    }

    console.log('Current config:', currentConfig);

    // Update the config to include ads_enabled field (default to false)
    const updatedConfig = {
      ...currentConfig,
      ads_enabled: false,
      updated_at: new Date().toISOString()
    };

    // Remove the fields that shouldn't be updated
    delete updatedConfig.id;
    delete updatedConfig.created_at;

    const { data: updateData, error: updateError } = await supabase
      .from('system_config')
      .update(updatedConfig)
      .eq('id', currentConfig.id)
      .select();

    if (updateError) {
      console.error('Error updating config:', updateError);
    } else {
      console.log('✅ Successfully added ads_enabled field!');
      console.log('Updated config:', updateData[0]);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addAdsEnabledField();
