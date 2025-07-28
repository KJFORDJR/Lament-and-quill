const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Running ban system migration...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./database/add-ban-system.sql', 'utf8');
    
    // Split into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement.trim() + ';' 
        });
        
        if (error) {
          console.error('❌ Error with statement:', error);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Ban system migration completed!');
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigration();
