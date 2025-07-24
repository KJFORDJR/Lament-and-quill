// Test script to toggle marketplace and verify it works
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

async function testMarketplaceToggle() {
  console.log('Testing marketplace toggle functionality...');
  
  try {
    // 1. Check current config
    console.log('\n1. Fetching current system config...');
    const { data: currentConfig, error: fetchError } = await supabase
      .from('system_config')
      .select('*')
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching config:', fetchError);
      return;
    }
    
    console.log('Current config:', currentConfig);
    
    // 2. If no config exists, create one
    if (!currentConfig) {
      console.log('\n2. Creating default system config...');
      const { data: newConfig, error: insertError } = await supabase
        .from('system_config')
        .insert({
          site_title: 'Lament and Quill',
          site_description: 'Two cities. Two Ghosts. One reckoning.',
          maintenance_mode: false,
          registration_enabled: true,
          forum_enabled: true,
          marketplace_enabled: true,
          email_notifications: true,
          max_file_size: 5,
          session_timeout: 30,
          backup_frequency: 'daily',
          analytics_enabled: true,
          debug_mode: false
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating config:', insertError);
        return;
      }
      
      console.log('Created config:', newConfig);
    }
    
    // 3. Test disabling marketplace
    console.log('\n3. Disabling marketplace...');
    const { error: disableError } = await supabase
      .from('system_config')
      .update({ marketplace_enabled: false })
      .eq('id', currentConfig.id);
    
    if (disableError) {
      console.error('Error disabling marketplace:', disableError);
      return;
    }
    
    console.log('✅ Marketplace disabled successfully');
    
    // 4. Verify the update
    const { data: disabledConfig } = await supabase
      .from('system_config')
      .select('marketplace_enabled')
      .eq('id', currentConfig.id)
      .single();
    
    console.log('Verified marketplace_enabled:', disabledConfig?.marketplace_enabled);
    
    // 5. Test API endpoint
    console.log('\n4. Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/system-config');
      if (response.ok) {
        const apiConfig = await response.json();
        console.log('API response marketplace_enabled:', apiConfig.marketplace_enabled);
      } else {
        console.log('API responded with status:', response.status);
      }
    } catch (apiError) {
      console.log('Could not test API (server might not be running):', apiError.message);
    }
    
    // 6. Re-enable marketplace
    console.log('\n5. Re-enabling marketplace...');
    const { error: enableError } = await supabase
      .from('system_config')
      .update({ marketplace_enabled: true })
      .eq('id', currentConfig.id);
    
    if (enableError) {
      console.error('Error re-enabling marketplace:', enableError);
      return;
    }
    
    console.log('✅ Marketplace re-enabled successfully');
    
    console.log('\n🎉 Marketplace toggle test completed!');
    console.log('🔍 If the toggle is still not working on your live site:');
    console.log('   1. Check browser console for logs');
    console.log('   2. Wait up to 30 seconds for the config to refresh');
    console.log('   3. Hard refresh the page (Ctrl+F5)');
    console.log('   4. Check if you\'re logged in as admin (admins bypass restrictions)');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testMarketplaceToggle();
