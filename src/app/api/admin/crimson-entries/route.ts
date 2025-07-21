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

export async function GET() {
  try {
    console.log('Fetching crimson entries via admin API...');

    const { data, error } = await supabaseAdmin
      .from('crimson_ledger_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching crimson entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crimson entries' },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} crimson entries`);

    return NextResponse.json({
      message: 'Crimson entries fetched successfully',
      data: data || []
    });

  } catch (error) {
    console.error('Crimson entries API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
