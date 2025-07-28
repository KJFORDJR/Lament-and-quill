const { supabaseAdmin } = require('./src/lib/supabase');
const fs = require('fs');

async function createFunction() {
  try {
    const sql = fs.readFileSync('./database/create_update_thread_category_function.sql', 'utf8');
    
    console.log('Creating update_thread_category function...');
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error creating function:', error);
    } else {
      console.log('Function created successfully:', data);
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

createFunction();
