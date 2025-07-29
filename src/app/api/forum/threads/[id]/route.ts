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

    // Get thread with author and category info
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
        ),
        forum_categories:category_id (
          id,
          name,
          color
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
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    return NextResponse.json({
      thread,
      replies: replies || []
    });
  } catch (err) {
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
      return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Thread deleted successfully' });
  } catch (err) {
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
    const { title, content, category, author_id } = body;

    // Basic validations
    if (!author_id) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Prepare update data
    const updateData: any = {
      title: title.trim(),
      content: content.trim(),
      updated_at: new Date().toISOString()
    };

    // Handle category update if provided
    if (category !== undefined) {
      if (category === null || category === '') {
        updateData.category = 'general';
      } else {
        updateData.category = category;
      }
    }

    // Update the thread
    const { data: updatedThread, error: updateError } = await supabaseAdmin
      .from('forum_threads')
      .update(updateData)
      .eq('id', threadId)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json(updatedThread);

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
