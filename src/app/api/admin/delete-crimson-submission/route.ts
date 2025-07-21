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
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete crimson submission via admin API:', submissionId);

    // First, delete related tips
    const { error: tipError } = await supabaseAdmin
      .from('crimson_confessions_tips')
      .delete()
      .eq('submission_id', submissionId);

    if (tipError) {
      console.error('Error deleting related tips:', tipError);
      // Continue with submission deletion even if tip deletion fails
    }

    // Then delete the submission
    const { data, error } = await supabaseAdmin
      .from('crimson_confessions_submissions')
      .delete()
      .eq('id', submissionId)
      .select();

    if (error) {
      console.error('Error deleting crimson submission:', error);
      return NextResponse.json(
        { error: 'Failed to delete crimson submission' },
        { status: 500 }
      );
    }

    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} crimson submission record(s)`);

    return NextResponse.json({
      message: 'Crimson submission deleted successfully',
      deletedCount,
      deletedRecords: data
    });

  } catch (error) {
    console.error('Delete crimson submission API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
