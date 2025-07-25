// Script to create ads_config table as a workaround
const { createClient } = require('@supabase/supabase-js');
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

async function createAdsConfigTable() {
  console.log('Creating ads_config table...');
  
  try {
    // Create ads_config table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ads_config (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        ads_enabled BOOLEAN DEFAULT false,
        ads_client_id TEXT,
        ads_slot_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });

    if (createError) {
      console.log('Table creation error (might already exist):', createError);
    }

    // Insert default record
    const { data: existingConfig, error: selectError } = await supabase
      .from('ads_config')
      .select('*')
      .limit(1);

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing ads config:', selectError);
      return;
    }

    if (!existingConfig || existingConfig.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('ads_config')
        .insert({
          ads_enabled: false,
          ads_client_id: 'ca-pub-9483812306598147'
        })
        .select();

      if (insertError) {
        console.error('Error inserting default ads config:', insertError);
      } else {
        console.log('✅ Default ads config created:', insertData[0]);
      }
    } else {
      console.log('✅ Ads config table exists with data:', existingConfig[0]);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdsConfigTable();
