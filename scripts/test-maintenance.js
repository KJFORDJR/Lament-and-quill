// Simple script to test and initialize system_config table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSystemConfig() {
  console.log('Testing system_config table...');
  
  try {
    // Try to fetch config
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .single();
    
    if (error && error.code === 'PGRST116') {
      console.log('No system config found, creating default...');
      
      // Insert default config
      const { data: insertData, error: insertError } = await supabase
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
        console.error('Error creating default config:', insertError);
        return;
      }
      
      console.log('Default config created:', insertData);
    } else if (error) {
      console.error('Error fetching system config:', error);
      return;
    } else {
      console.log('System config found:', data);
    }
    
    // Now test enabling maintenance mode
    console.log('\nTesting maintenance mode toggle...');
    const { error: updateError } = await supabase
      .from('system_config')
      .update({ maintenance_mode: true })
      .single();
    
    if (updateError) {
      console.error('Error enabling maintenance mode:', updateError);
    } else {
      console.log('Maintenance mode enabled successfully!');
      
      // Verify the update
      const { data: updatedData } = await supabase
        .from('system_config')
        .select('maintenance_mode')
        .single();
      
      console.log('Current maintenance_mode:', updatedData?.maintenance_mode);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSystemConfig();
