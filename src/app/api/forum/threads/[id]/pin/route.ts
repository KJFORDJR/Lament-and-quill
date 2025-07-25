import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PATCH to pin/unpin a thread (Admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    const body = await request.json();
    const { is_pinned, admin_user_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Verify admin user exists and has admin role
    if (!admin_user_id) {
      return NextResponse.json({ error: 'Admin user ID required' }, { status: 400 });
    }

    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', admin_user_id)
      .single();

    if (adminError || !adminProfile || adminProfile.user_role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Check if thread exists
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('forum_threads')
      .select('id, title, is_pinned')
      .eq('id', threadId)
      .eq('is_deleted', false)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Update the pin status
    const { data: updatedThread, error: updateError } = await supabaseAdmin
      .from('forum_threads')
      .update({ 
        is_pinned: is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating thread pin status:', updateError);
      return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: is_pinned ? 'Thread pinned successfully' : 'Thread unpinned successfully',
      data: updatedThread
    });

  } catch (err) {
    console.error('Unexpected error updating thread pin status:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
