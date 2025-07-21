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

export async function PUT(request: NextRequest) {
  try {
    const { submissionId, status } = await request.json();

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Submission ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved, rejected, or pending' },
        { status: 400 }
      );
    }

    console.log(`Updating crimson submission ${submissionId} status to ${status}`);

    const { data, error } = await supabaseAdmin
      .from('crimson_confessions_submissions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select();

    if (error) {
      console.error('Error updating crimson submission status:', error);
      return NextResponse.json(
        { error: 'Failed to update submission status' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    console.log('Crimson submission status updated successfully');

    return NextResponse.json({
      message: 'Submission status updated successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Update crimson submission status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
