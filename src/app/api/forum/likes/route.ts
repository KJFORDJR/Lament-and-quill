import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST/DELETE like for thread or reply
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { user_id, thread_id, reply_id } = body;

    // Validate required fields
    if (!user_id || (!thread_id && !reply_id)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if like already exists
    let query = supabaseAdmin
      .from('forum_likes')
      .select('id')
      .eq('user_id', user_id);

    if (thread_id) {
      query = query.eq('thread_id', thread_id).is('reply_id', null);
    } else {
      query = query.eq('reply_id', reply_id).is('thread_id', null);
    }

    const { data: existingLike } = await query.single();

    if (existingLike) {
      // Unlike - remove the like
      const { error } = await supabaseAdmin
        .from('forum_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Error removing like:', error);
        return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 });
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like - add the like
      const { error } = await supabaseAdmin
        .from('forum_likes')
        .insert({
          user_id,
          thread_id: thread_id || null,
          reply_id: reply_id || null
        });

      if (error) {
        console.error('Error adding like:', error);
        return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    console.error('Unexpected error handling like:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET like status for user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const thread_id = searchParams.get('thread_id');
    const reply_id = searchParams.get('reply_id');

    if (!user_id || (!thread_id && !reply_id)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let query = supabaseAdmin
      .from('forum_likes')
      .select('id')
      .eq('user_id', user_id);

    if (thread_id) {
      query = query.eq('thread_id', thread_id).is('reply_id', null);
    } else {
      query = query.eq('reply_id', reply_id).is('thread_id', null);
    }

    const { data: like } = await query.single();

    return NextResponse.json({ liked: !!like });
  } catch (err) {
    console.error('Unexpected error checking like status:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
