const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function updateDatabaseSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log('🔄 Checking and updating database schema...');

  try {
    // Try to insert sample data with the new schema
    // This will tell us if the table has the right structure
    const sampleData = {
      title: 'Schema Test Entry',
      summary: 'Test Summary',
      content: 'Test Content',
      type: 'character',
      city: 'crimson',
      classification: 'public',
      is_published: false
    };

    console.log('Testing table structure...');
    const { data: testResult, error: testError } = await supabase
      .from('dossier_entries')
      .insert([sampleData])
      .select();

    if (testError) {
      if (testError.message.includes('relation "dossier_entries" does not exist')) {
        console.log('❌ Table does not exist. Please create it in your Supabase dashboard.');
        console.log('� Use the following SQL in your Supabase SQL editor:');
        console.log(`
CREATE TABLE IF NOT EXISTS dossier_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('character', 'location', 'event')),
  city TEXT NOT NULL CHECK (city IN ('crimson', 'silver')),
  classification TEXT NOT NULL DEFAULT 'public' CHECK (classification IN ('public', 'confidential', 'secret', 'top-secret')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE dossier_entries ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published entries
CREATE POLICY "Public can read published dossier entries" ON dossier_entries
  FOR SELECT USING (is_published = true);

-- Policy for authenticated users to read all entries
CREATE POLICY "Authenticated can read all dossier entries" ON dossier_entries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for service role to manage all entries
CREATE POLICY "Service role can manage dossier entries" ON dossier_entries
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
        `);
        return;
      } else {
        console.log('❌ Error with current schema:', testError.message);
        console.log('🔧 The table might have old column names. Please update the schema manually in Supabase.');
        return;
      }
    }

    // Clean up the test entry
    if (testResult && testResult[0]) {
      await supabase
        .from('dossier_entries')
        .delete()
        .eq('id', testResult[0].id);
    }

    console.log('✅ Table structure is correct!');

    // Check if sample data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('dossier_entries')
      .select('title')
      .in('title', ['The Red Archivist', 'Chrome Magistrate']);

    if (checkError) {
      console.error('❌ Error checking existing data:', checkError);
      return;
    }

    const existingTitles = existingData?.map(entry => entry.title) || [];
    
    const realSampleData = [
      {
        title: 'The Red Archivist',
        summary: 'Keeper of Crimson Secrets',
        content: 'A mysterious figure who maintains the bloody records of the lower city. Few have seen their face and lived to tell the tale. They operate from the shadows, cataloging every transaction, every secret, every drop of blood spilled in the name of power.',
        type: 'character',
        city: 'crimson',
        classification: 'secret',
        is_published: true
      },
      {
        title: 'Chrome Magistrate',
        summary: 'Silver Heights Authority',
        content: 'The cybernetic enforcer of Silver Heights digital laws. Their neural implants process justice at the speed of light, making decisions that reshape the digital landscape. Cold, calculated, and utterly without mercy for those who dare to break the code.',
        type: 'character',
        city: 'silver',
        classification: 'public',
        is_published: true
      },
      {
        title: 'The Bleeding Quarter',
        summary: 'Crimson City Commercial District',
        content: 'Where blood money flows like water and every transaction leaves a stain. The heart of the underground economy, where desperate souls trade their essence for fleeting power and temporary relief from the city\'s crushing weight.',
        type: 'location',
        city: 'crimson',
        classification: 'confidential',
        is_published: true
      },
      {
        title: 'Neural Nexus Plaza',
        summary: 'Silver Heights Data Hub',
        content: 'The gleaming center of information exchange, where thoughts become currency and privacy is a luxury. Massive data streams flow through crystalline conduits, processing the dreams and fears of millions.',
        type: 'location',
        city: 'silver',
        classification: 'public',
        is_published: true
      }
    ];

    // Insert only new entries
    const newEntries = realSampleData.filter(entry => !existingTitles.includes(entry.title));
    
    if (newEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('dossier_entries')
        .insert(newEntries);

      if (insertError) {
        console.error('❌ Error inserting sample data:', insertError);
      } else {
        console.log(`✅ Inserted ${newEntries.length} new sample entries`);
      }
    } else {
      console.log('✅ Sample data already exists');
    }

    console.log('🎉 Database schema check completed!');
  } catch (error) {
    console.error('❌ Schema update failed:', error);
  }
}

updateDatabaseSchema();
