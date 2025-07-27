import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile to check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.user_role !== 'Admin' && profile.user_role !== 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('Running migration: Add display_order columns...');

    // Check if columns already exist
    const { data: crimsonColumns } = await supabaseAdmin.rpc('get_table_columns', {
      table_name: 'crimson_ledger_entries'
    });
    
    const { data: fragmentColumns } = await supabaseAdmin.rpc('get_table_columns', {
      table_name: 'lament_fragments_entries'
    });

    const results = [];

    // For now, let's just try to query the columns to see if they exist
    try {
      const { data: crimsonTest } = await supabaseAdmin
        .from('crimson_ledger_entries')
        .select('display_order')
        .limit(1);
      
      const { data: fragmentTest } = await supabaseAdmin
        .from('lament_fragments_entries')
        .select('display_order')
        .limit(1);

      if (crimsonTest !== null && fragmentTest !== null) {
        return NextResponse.json({ 
          message: 'Display order columns already exist',
          status: 'already_exists'
        });
      }
    } catch (error) {
      // Columns don't exist, which is expected
      results.push({ message: 'Columns need to be created' });
    }

    return NextResponse.json({ 
      message: 'Migration check completed. Please add the display_order columns manually to the database.',
      instructions: [
        'ALTER TABLE crimson_ledger_entries ADD COLUMN display_order INTEGER DEFAULT 0;',
        'ALTER TABLE lament_fragments_entries ADD COLUMN display_order INTEGER DEFAULT 0;',
        'UPDATE crimson_ledger_entries SET display_order = (SELECT ROW_NUMBER() OVER (ORDER BY created_at) FROM crimson_ledger_entries c2 WHERE c2.id = crimson_ledger_entries.id);',
        'UPDATE lament_fragments_entries SET display_order = (SELECT ROW_NUMBER() OVER (ORDER BY created_at) FROM lament_fragments_entries f2 WHERE f2.id = lament_fragments_entries.id);'
      ],
      results 
    });
  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
