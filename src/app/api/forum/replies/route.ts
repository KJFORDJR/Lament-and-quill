import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST new reply to a thread
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { thread_id, content, author_id, parent_reply_id } = body;

    // Validate required fields
    if (!thread_id || !content || !author_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if thread exists and is not deleted
    const { data: thread } = await supabaseAdmin
      .from('forum_threads')
      .select('id, is_deleted')
      .eq('id', thread_id)
      .single();

    if (!thread || thread.is_deleted) {
      return NextResponse.json({ error: 'Thread not found or deleted' }, { status: 404 });
    }

    // Create the reply
    const { data: reply, error } = await supabaseAdmin
      .from('forum_replies')
      .insert({
        thread_id,
        content: content.trim(),
        author_id,
        parent_reply_id: parent_reply_id || null
      })
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
      console.error('Error creating reply:', error);
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
    }

    // Update thread's last activity
    await supabaseAdmin
      .from('forum_threads')
      .update({ 
        last_activity_at: new Date().toISOString(),
        latest_reply_id: reply.id
      })
      .eq('id', thread_id);

    return NextResponse.json({ data: reply }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating reply:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
