import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET specific thread with all replies
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get current view count and increment it
    const { data: currentThread } = await supabaseAdmin
      .from('forum_threads')
      .select('view_count')
      .eq('id', threadId)
      .single();
    
    await supabaseAdmin
      .from('forum_threads')
      .update({ 
        view_count: (currentThread?.view_count || 0) + 1,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', threadId);

    // Get thread with author info
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('forum_threads')
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
      .eq('id', threadId)
      .eq('is_deleted', false)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Get all replies for the thread
    const { data: replies, error: repliesError } = await supabaseAdmin
      .from('forum_replies')
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
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    return NextResponse.json({
      thread,
      replies: replies || []
    });
  } catch (err) {
    console.error('Unexpected error fetching thread:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE thread (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    const body = await request.json();
    const { author_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get the thread info
    const { data: thread } = await supabaseAdmin
      .from('forum_threads')
      .select('author_id')
      .eq('id', threadId)
      .single();

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Get the requester's profile to check admin status
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', author_id)
      .single();

    // Check if user is the author or an admin
    const isAuthor = thread.author_id === author_id;
    const isAdmin = requesterProfile?.user_role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete the thread
    const { error } = await supabaseAdmin
      .from('forum_threads')
      .update({ is_deleted: true })
      .eq('id', threadId);

    if (error) {
      console.error('Error deleting thread:', error);
      return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Thread deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting thread:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update thread
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id;
    const body = await request.json();
    const { title, content, author_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get the thread info
    const { data: thread } = await supabaseAdmin
      .from('forum_threads')
      .select('author_id')
      .eq('id', threadId)
      .single();

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Get the requester's profile to check admin status
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', author_id)
      .single();

    // Check if user is the author or an admin
    const isAuthor = thread.author_id === author_id;
    const isAdmin = requesterProfile?.user_role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the thread
    const { data: updatedThread, error } = await supabaseAdmin
      .from('forum_threads')
      .update({ 
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId)
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
      console.error('Error updating thread:', error);
      return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
    }

    return NextResponse.json(updatedThread);
  } catch (err) {
    console.error('Unexpected error updating thread:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
