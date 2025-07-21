import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    // Get the submission data
    const { submissionId, status } = await request.json();
    
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Updating submission status:', submissionId, 'to', status);

    // Update the submission using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('lament_submissions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', submissionId)
      .select();

    if (error) {
      console.error('API: Submission status update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Submission status updated successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (err: any) {
    console.error('API: Submission status update exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
