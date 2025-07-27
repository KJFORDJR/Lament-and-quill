// Utility script to manually run database migrations
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration() {
  try {
    console.log('Running display_order migration...');

    // Add display_order column to lament_ledger_entries if it doesn't exist
    console.log('Adding display_order column to lament_ledger_entries...');
    const { error: ledgerAlterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'crimson_ledger_entries' 
            AND column_name = 'display_order'
          ) THEN
            ALTER TABLE crimson_ledger_entries ADD COLUMN display_order INTEGER DEFAULT 0;
          END IF;
        END $$;
      `
    });

    if (ledgerAlterError) {
      console.error('Error adding display_order to crimson_ledger_entries:', ledgerAlterError);
    } else {
      console.log('✓ Added display_order column to crimson_ledger_entries');
    }

    // Add display_order column to lament_fragments_entries if it doesn't exist
    console.log('Adding display_order column to lament_fragments_entries...');
    const { error: fragmentsAlterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'lament_fragments_entries' 
            AND column_name = 'display_order'
          ) THEN
            ALTER TABLE lament_fragments_entries ADD COLUMN display_order INTEGER DEFAULT 0;
          END IF;
        END $$;
      `
    });

    if (fragmentsAlterError) {
      console.error('Error adding display_order to lament_fragments_entries:', fragmentsAlterError);
    } else {
      console.log('✓ Added display_order column to lament_fragments_entries');
    }

    // Set initial display_order values for crimson ledger entries
    console.log('Setting initial display_order values for crimson ledger entries...');
    const { data: ledgerEntries } = await supabaseAdmin
      .from('crimson_ledger_entries')
      .select('id')
      .order('created_at', { ascending: true });

    if (ledgerEntries) {
      for (let i = 0; i < ledgerEntries.length; i++) {
        await supabaseAdmin
          .from('crimson_ledger_entries')
          .update({ display_order: i })
          .eq('id', ledgerEntries[i].id);
      }
      console.log(`✓ Set display_order for ${ledgerEntries.length} crimson ledger entries`);
    }

    // Set initial display_order values for fragment entries
    console.log('Setting initial display_order values for fragment entries...');
    const { data: fragmentEntries } = await supabaseAdmin
      .from('lament_fragments_entries')
      .select('id')
      .order('created_at', { ascending: true });

    if (fragmentEntries) {
      for (let i = 0; i < fragmentEntries.length; i++) {
        await supabaseAdmin
          .from('lament_fragments_entries')
          .update({ display_order: i })
          .eq('id', fragmentEntries[i].id);
      }
      console.log(`✓ Set display_order for ${fragmentEntries.length} fragment entries`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
