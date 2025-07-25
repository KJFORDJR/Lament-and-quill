import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET single dossier entry
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('dossier_entries')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching dossier entry:', error);
      return NextResponse.json({ error: 'Failed to fetch dossier entry' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error fetching dossier entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update dossier entry (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = await request.json();
    const { title, summary, content, type, city, classification, image_url, is_published } = body;

    // Validate required fields
    if (!title || !summary || !content || !type || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate enum values
    if (!['character', 'location', 'event'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be character, location, or event' }, { status: 400 });
    }

    if (!['crimson', 'silver'].includes(city)) {
      return NextResponse.json({ error: 'Invalid city. Must be crimson or silver' }, { status: 400 });
    }

    if (classification && !['public', 'confidential', 'secret', 'top-secret'].includes(classification)) {
      return NextResponse.json({ error: 'Invalid classification' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('dossier_entries')
      .update({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        type,
        city,
        classification: classification || 'public',
        image_url,
        is_published: is_published ?? false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dossier entry:', error);
      return NextResponse.json({ error: 'Failed to update dossier entry' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error updating dossier entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE dossier entry (admin only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('dossier_entries')
      .delete()
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting dossier entry:', error);
      return NextResponse.json({ error: 'Failed to delete dossier entry' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error deleting dossier entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
