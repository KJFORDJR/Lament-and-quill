import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all forum threads with counts and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('Forum threads API called with category:', category);

    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Simple query first to test basic functionality
    let query = supabaseAdmin
      .from('forum_threads')
      .select('*')
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    console.log('Executing threads query...');
    const { data: threads, error } = await query;

    if (error) {
      console.error('Error fetching forum threads:', error);
      return NextResponse.json({ error: 'Failed to fetch threads', details: error.message }, { status: 500 });
    }

    console.log('Threads fetched successfully:', threads?.length || 0, 'threads');

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      data: threads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error('Unexpected error fetching threads:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST new forum thread
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { title, content, category, author_id } = body;

    // Validate required fields
    if (!title || !content || !category || !author_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['general', 'crimson', 'silver', 'convergence', 'mysteries'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const { data: thread, error } = await supabaseAdmin
      .from('forum_threads')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author_id,
        last_activity_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles:author_id (
          id,
          username,
          city_affiliation,
          user_role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating forum thread:', error);
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
    }

    return NextResponse.json({ data: thread }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating thread:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
