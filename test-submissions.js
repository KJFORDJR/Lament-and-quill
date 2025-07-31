const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubmissionTables() {
  console.log('🔍 Checking submission tables...');
  
  try {
    // Check lament_submissions table
    console.log('\n--- LAMENT SUBMISSIONS ---');
    const { data: lamentData, error: lamentError } = await supabase
      .from('lament_submissions')
      .select('*')
      .limit(5);
      
    console.log('Lament submissions error:', lamentError);
    console.log('Lament submissions count:', lamentData?.length || 0);
    console.log('Sample lament submissions:', lamentData);
    
    // Check crimson_confessions table
    console.log('\n--- CRIMSON CONFESSIONS ---');
    const { data: crimsonData, error: crimsonError } = await supabase
      .from('crimson_confessions')
      .select('*')
      .limit(5);
      
    console.log('Crimson confessions error:', crimsonError);
    console.log('Crimson confessions count:', crimsonData?.length || 0);
    console.log('Sample crimson confessions:', crimsonData);
    
    // Check if the old crimson_confessions_submissions table exists
    console.log('\n--- CRIMSON CONFESSIONS SUBMISSIONS (OLD) ---');
    const { data: oldCrimsonData, error: oldCrimsonError } = await supabase
      .from('crimson_confessions_submissions')
      .select('*')
      .limit(5);
      
    console.log('Old crimson submissions error:', oldCrimsonError);
    console.log('Old crimson submissions count:', oldCrimsonData?.length || 0);
    console.log('Sample old crimson submissions:', oldCrimsonData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

checkSubmissionTables();
