const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyNewsletterSchema() {
  try {
    console.log('Reading newsletter schema...');
    const schemaSQL = fs.readFileSync('./database/newsletter_schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';'
      });

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error);
        // Continue with next statement instead of failing completely
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n🎉 Newsletter schema application completed!');
    
    // Verify tables were created
    console.log('\nVerifying newsletter tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'newsletter%');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Newsletter tables found:', tables?.map(t => t.table_name) || []);
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

applyNewsletterSchema();
