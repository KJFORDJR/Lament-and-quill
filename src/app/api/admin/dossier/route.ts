import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all dossier entries (admin only)
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('dossier_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dossier entries:', error);
      return NextResponse.json({ error: 'Failed to fetch dossier entries' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error fetching dossier entries:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new dossier entry (admin only)
export async function POST(request: Request) {
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
      .insert({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        type,
        city,
        classification: classification || 'public',
        image_url,
        is_published: is_published ?? false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dossier entry:', error);
      return NextResponse.json({ error: 'Failed to create dossier entry' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating dossier entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
