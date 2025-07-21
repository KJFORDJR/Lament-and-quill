import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    // Get the submission ID from the request
    const { submissionId } = await request.json();
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin privileges not available' }, { status: 500 });
    }

    console.log('API: Attempting to delete submission:', submissionId);

    // First delete associated tips using admin client
    const { error: tipsError } = await supabaseAdmin
      .from('tips')
      .delete()
      .eq('submission_id', submissionId)
      .eq('submission_type', 'lament_submission');

    if (tipsError) {
      console.error('API: Tips deletion error:', tipsError);
      // Continue with submission deletion even if tips deletion fails
    }

    // Then delete the submission using admin client
    const { error: deleteError, count } = await supabaseAdmin
      .from('lament_submissions')
      .delete({ count: 'exact' })
      .eq('id', submissionId);

    if (deleteError) {
      console.error('API: Submission deletion error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('API: Delete result count:', count);

    if (count === 0) {
      return NextResponse.json({ error: 'No records were deleted. Submission may not exist.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${count} record(s)`,
      deletedCount: count 
    });

  } catch (error: any) {
    console.error('API: Delete submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
