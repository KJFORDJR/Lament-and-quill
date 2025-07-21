import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE reply (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id;
    const body = await request.json();
    const { author_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Verify reply ownership or admin role
    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select(`
        author_id,
        profiles:author_id(user_role)
      `)
      .eq('id', replyId)
      .single();

    const profile = Array.isArray(reply?.profiles) ? reply.profiles[0] : reply?.profiles;
    if (!reply || (reply.author_id !== author_id && profile?.user_role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete the reply
    const { error } = await supabaseAdmin
      .from('forum_replies')
      .update({ is_deleted: true })
      .eq('id', replyId);

    if (error) {
      console.error('Error deleting reply:', error);
      return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting reply:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update reply
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id;
    const body = await request.json();
    const { content, author_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify reply ownership or admin role
    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select(`
        author_id,
        profiles:author_id(user_role)
      `)
      .eq('id', replyId)
      .single();

    const profile = Array.isArray(reply?.profiles) ? reply.profiles[0] : reply?.profiles;
    if (!reply || (reply.author_id !== author_id && profile?.user_role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the reply
    const { data: updatedReply, error } = await supabaseAdmin
      .from('forum_replies')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', replyId)
      .select(`
        *,
        profiles:author_id (
          id,
          username,
          city_affiliation,
          user_role,
          created_at
        )
      `)
      .single();

    if (error) {
      console.error('Error updating reply:', error);
      return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 });
    }

    return NextResponse.json(updatedReply);
  } catch (err) {
    console.error('Unexpected error updating reply:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
