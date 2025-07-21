import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    // Get the fragment ID from the request
    const { fragmentId } = await request.json();
    
    if (!fragmentId) {
      return NextResponse.json({ error: 'Fragment ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin privileges not available' }, { status: 500 });
    }

    console.log('API: Attempting to delete fragment:', fragmentId);

    // Delete the fragment using admin client
    const { error: deleteError, count } = await supabaseAdmin
      .from('lament_fragments_entries')
      .delete({ count: 'exact' })
      .eq('id', fragmentId);

    if (deleteError) {
      console.error('API: Fragment deletion error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('API: Delete result count:', count);

    if (count === 0) {
      return NextResponse.json({ error: 'No records were deleted. Fragment may not exist.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${count} fragment(s)`,
      deletedCount: count 
    });

  } catch (error: any) {
    console.error('API: Delete fragment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
