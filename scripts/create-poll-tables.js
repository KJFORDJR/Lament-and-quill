const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runPollMigration() {
  try {
    console.log('Creating poll tables...');
    
    // Create polls table
    const { data: pollsData, error: pollsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'polls');
      
    if (pollsData?.length === 0) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: `CREATE TABLE polls (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          question TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );`
      });
      
      if (error) {
        console.error('Polls table error:', error);
        return;
      }
      console.log('Polls table created!');
    } else {
      console.log('Polls table already exists');
    }
    
    // Create poll_options table
    const { data: optionsData, error: optionsSelectError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'poll_options');
      
    if (optionsData?.length === 0) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: `CREATE TABLE poll_options (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      });
      
      if (error) {
        console.error('Poll options table error:', error);
        return;
      }
      console.log('Poll options table created!');
    } else {
      console.log('Poll options table already exists');
    }
    
    // Create poll_votes table
    const { data: votesData, error: votesSelectError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'poll_votes');
      
    if (votesData?.length === 0) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: `CREATE TABLE poll_votes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
          option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(poll_id, user_id)
        );`
      });
      
      if (error) {
        console.error('Poll votes table error:', error);
        return;
      }
      console.log('Poll votes table created!');
    } else {
      console.log('Poll votes table already exists');
    }
    
    // Enable RLS
    await supabase.rpc('exec_sql', { 
      sql_query: `ALTER TABLE polls ENABLE ROW LEVEL SECURITY;`
    });
    await supabase.rpc('exec_sql', { 
      sql_query: `ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;`
    });
    await supabase.rpc('exec_sql', { 
      sql_query: `ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;`
    });
    
    // Create RLS policies
    await supabase.rpc('exec_sql', { 
      sql_query: `
        CREATE POLICY "Anyone can view active polls" ON polls FOR SELECT USING (is_active = true);
        CREATE POLICY "Admins can manage polls" ON polls FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin'));
        
        CREATE POLICY "Anyone can view poll options" ON poll_options FOR SELECT USING (
          poll_id IN (SELECT id FROM polls WHERE is_active = true)
        );
        CREATE POLICY "Admins can manage poll options" ON poll_options FOR ALL USING (
          auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
        );
        
        CREATE POLICY "Users can view their own votes" ON poll_votes FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own votes" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Admins can view all votes" ON poll_votes FOR SELECT USING (
          auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin')
        );
      `
    });
    
    console.log('Poll migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

runPollMigration();
