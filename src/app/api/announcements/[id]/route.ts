import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET specific announcement
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: announcement, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching announcement:', error);
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ data: announcement });
  } catch (err) {
    console.error('Unexpected error fetching announcement:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update announcement (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { title, content, priority, is_active, author_id } = body;

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
      .update({
        title: title?.trim(),
        content: content?.trim(),
        priority: priority !== undefined ? parseInt(priority) : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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
      console.error('Error updating announcement:', error);
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    return NextResponse.json({ data: announcement });
  } catch (err) {
    console.error('Unexpected error updating announcement:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE announcement (admin only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const author_id = searchParams.get('author_id');

    if (!author_id) {
      return NextResponse.json({ error: 'Author ID required' }, { status: 400 });
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

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting announcement:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
