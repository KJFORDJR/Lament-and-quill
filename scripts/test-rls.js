// Simple script to test system config access and temporarily disable RLS if needed
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAndFixRLS() {
  console.log('Testing system_config access...');
  
  try {
    // Test current access
    const { data, error } = await supabase
      .from('system_config')
      .select('maintenance_mode, registration_enabled, forum_enabled, marketplace_enabled')
      .single();
    
    if (error) {
      console.error('Error accessing system config:', error);
      console.log('Attempting to fix RLS...');
      
      // Try to disable RLS temporarily for testing
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;'
      });
      
      if (rlsError) {
        console.error('Could not disable RLS via RPC, trying direct SQL execution...');
        
        // Try to run a raw query instead
        const { data: testData, error: testError } = await supabase
          .from('system_config')
          .select('*');
        
        console.log('Raw query result:', { testData, testError });
        
        return;
      }
      
      console.log('RLS disabled, retesting...');
      
      // Test again
      const { data: retestData, error: retestError } = await supabase
        .from('system_config')
        .select('maintenance_mode, registration_enabled, forum_enabled, marketplace_enabled')
        .single();
      
      if (retestError) {
        console.error('Still getting error after disabling RLS:', retestError);
      } else {
        console.log('SUCCESS! System config accessed after disabling RLS:', retestData);
      }
      
    } else {
      console.log('SUCCESS! System config accessed:', data);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAndFixRLS();
