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

    // Get the reply info
    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select('author_id')
      .eq('id', replyId)
      .single();

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Get the requester's profile to check admin status
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', author_id)
      .single();

    // Check if user is the author or an admin
    const isAuthor = reply.author_id === author_id;
    const isAdmin = requesterProfile?.user_role === 'admin';

    if (!isAuthor && !isAdmin) {
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

    // Get the reply info
    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select('author_id')
      .eq('id', replyId)
      .single();

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Get the requester's profile to check admin status
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', author_id)
      .single();

    // Check if user is the author or an admin
    const isAuthor = reply.author_id === author_id;
    const isAdmin = requesterProfile?.user_role === 'admin';

    if (!isAuthor && !isAdmin) {
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
