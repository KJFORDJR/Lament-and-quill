// Script to fix system_config RLS policies for service role access
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
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

async function fixSystemConfigRLS() {
  console.log('Fixing system_config RLS policies...');
  
  try {
    // Read and execute the SQL fix
    const sqlFix = fs.readFileSync('database/fix_system_config_rls.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlFix.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement.trim() 
        });
        
        if (error) {
          console.error('Error executing statement:', error);
          // Try direct approach
          const { error: directError } = await supabase
            .from('system_config')
            .select('*')
            .limit(1);
          
          if (directError) {
            console.error('Direct access also failed:', directError);
          } else {
            console.log('Direct access works, RLS might be configured correctly');
          }
        }
      }
    }
    
    console.log('RLS fix completed');
    
    // Test access again
    console.log('Testing system config access...');
    const { data, error } = await supabase
      .from('system_config')
      .select('maintenance_mode, registration_enabled, forum_enabled, marketplace_enabled')
      .single();
    
    if (error) {
      console.error('Error accessing system config after fix:', error);
    } else {
      console.log('System config accessed successfully:', data);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

fixSystemConfigRLS();
