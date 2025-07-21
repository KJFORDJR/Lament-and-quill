const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnoseDatabaseSchema() {
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

  console.log('🔍 Diagnosing database schema for dossier_entries...');

  try {
    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('dossier_entries')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('relation "dossier_entries" does not exist')) {
        console.log('❌ Table "dossier_entries" does NOT exist');
        console.log('\n📝 Run this SQL in your Supabase SQL Editor to create it:');
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

-- Policies
CREATE POLICY "Public can read published dossier entries" ON dossier_entries
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated can read all dossier entries" ON dossier_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage dossier entries" ON dossier_entries
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Sample data
INSERT INTO dossier_entries (title, summary, content, type, city, classification, is_published) VALUES
('The Red Archivist', 'Keeper of Crimson Secrets', 'A mysterious figure who maintains the bloody records of the lower city.', 'character', 'crimson', 'secret', true),
('Chrome Magistrate', 'Silver Heights Authority', 'The cybernetic enforcer of Silver Heights digital laws.', 'character', 'silver', 'public', true);
        `);
        return;
      } else {
        console.error('❌ Unexpected error:', tableError.message);
        return;
      }
    }

    console.log('✅ Table exists! Checking column structure...');

    // Test each column
    const columns = [
      'title', 'summary', 'content', 'subtitle', 'description', 
      'type', 'city', 'classification', 'is_published'
    ];

    const existingColumns = [];
    const missingColumns = [];

    for (const column of columns) {
      try {
        const { error } = await supabase
          .from('dossier_entries')
          .select(column)
          .limit(1);
        
        if (error) {
          if (error.message.includes(`column "${column}" does not exist`)) {
            missingColumns.push(column);
          } else {
            console.log(`❓ Column '${column}': ${error.message}`);
          }
        } else {
          existingColumns.push(column);
        }
      } catch (err) {
        missingColumns.push(column);
      }
    }

    console.log('\n📊 Column Analysis:');
    console.log('✅ Existing columns:', existingColumns.join(', '));
    console.log('❌ Missing columns:', missingColumns.join(', '));

    // Test insertion capability
    if (existingColumns.includes('title') && existingColumns.includes('summary') && existingColumns.includes('content')) {
      console.log('\n🧪 Testing data insertion...');
      
      const testData = {
        title: 'Test Entry ' + Date.now(),
        summary: 'Test Summary',
        content: 'Test Content',
        type: 'character',
        city: 'crimson',
        classification: 'public',
        is_published: false
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('dossier_entries')
        .insert([testData])
        .select();

      if (insertError) {
        console.error('❌ Cannot insert data:', insertError.message);
        
        if (insertError.message.includes('violates check constraint')) {
          console.log('\n🔧 Constraint issue detected. Run this SQL to fix:');
          console.log(`
-- Fix type constraint
ALTER TABLE dossier_entries DROP CONSTRAINT IF EXISTS dossier_entries_type_check;
ALTER TABLE dossier_entries ADD CONSTRAINT dossier_entries_type_check 
  CHECK (type IN ('character', 'location', 'event'));

-- Fix classification constraint  
ALTER TABLE dossier_entries DROP CONSTRAINT IF EXISTS dossier_entries_classification_check;
ALTER TABLE dossier_entries ADD CONSTRAINT dossier_entries_classification_check 
  CHECK (classification IN ('public', 'confidential', 'secret', 'top-secret'));
          `);
        }
      } else {
        console.log('✅ Data insertion successful!');
        // Clean up
        if (insertResult?.[0]?.id) {
          await supabase.from('dossier_entries').delete().eq('id', insertResult[0].id);
          console.log('✅ Test data cleaned up');
        }
        console.log('\n🎉 Your database schema is working correctly!');
      }
    } else if (existingColumns.includes('subtitle') && existingColumns.includes('description')) {
      console.log('\n🔧 Old schema detected. Run this SQL to update:');
      console.log(`
-- Rename old columns to new names
ALTER TABLE dossier_entries RENAME COLUMN subtitle TO summary;
ALTER TABLE dossier_entries RENAME COLUMN description TO content;
      `);
    } else {
      console.log('\n❌ Schema is incomplete or corrupted. Consider recreating the table.');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseDatabaseSchema();
