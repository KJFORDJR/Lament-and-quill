import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the fragment data
    const { title, content, author_name, category } = await request.json();
    
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Creating fragment:', { title, author_name, category });

    // Create the fragment using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('lament_fragments_entries')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_name: author_name || 'Admin',
        category: category || 'System Messages',
        is_published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('API: Fragment creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Fragment created successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (err: any) {
    console.error('API: Fragment creation exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the fragment data
    const { id, title, content, author_name, category, is_published } = await request.json();
    
    if (!id || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Updating fragment:', id);

    // Update the fragment using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('lament_fragments_entries')
      .update({
        title: title.trim(),
        content: content.trim(),
        author_name: author_name || 'Admin',
        category: category || 'System Messages',
        is_published: is_published !== undefined ? is_published : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('API: Fragment update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Fragment updated successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (err: any) {
    console.error('API: Fragment update exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
