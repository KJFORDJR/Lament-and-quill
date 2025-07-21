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

export async function DELETE(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete crimson entry via admin API:', entryId);

    const { data, error } = await supabaseAdmin
      .from('crimson_ledger_entries')
      .delete()
      .eq('id', entryId)
      .select();

    if (error) {
      console.error('Error deleting crimson entry:', error);
      return NextResponse.json(
        { error: 'Failed to delete crimson entry' },
        { status: 500 }
      );
    }

    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} crimson entry record(s)`);

    return NextResponse.json({
      message: 'Crimson entry deleted successfully',
      deletedCount,
      deletedRecords: data
    });

  } catch (error) {
    console.error('Delete crimson entry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
