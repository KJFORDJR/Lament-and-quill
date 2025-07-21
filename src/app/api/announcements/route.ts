import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all active announcements
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: announcements, error } = await supabaseAdmin
      .from('announcements')
      .select(`
        *,
        profiles:author_id (
          id,
          username,
          city_affiliation,
          user_role
        )
      `)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json({ data: announcements || [] });
  } catch (err) {
    console.error('Unexpected error fetching announcements:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new announcement (admin only)
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { title, content, author_id, priority = 0 } = body;

    // Validate required fields
    if (!title || !content || !author_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', author_id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id,
        priority: parseInt(priority) || 0
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
      console.error('Error creating announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating announcement:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
