import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { title, content, author_name, category } = await request.json();

    if (!title || !content || !author_name) {
      return NextResponse.json(
        { error: 'Title, content, and author_name are required' },
        { status: 400 }
      );
    }

    console.log('Creating crimson entry via admin API:', { title, author_name, category });

    const { data, error } = await supabaseAdmin
      .from('crimson_ledger_entries')
      .insert({
        title,
        content,
        author_name,
        category: category || 'Official Records',
        is_published: true,
        published_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error creating crimson entry:', error);
      return NextResponse.json(
        { error: 'Failed to create crimson entry' },
        { status: 500 }
      );
    }

    console.log('Crimson entry created successfully:', data[0]?.id);

    return NextResponse.json({
      message: 'Crimson entry created successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Create crimson entry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, author_name, category, is_published } = await request.json();

    if (!id || !title || !content || !author_name) {
      return NextResponse.json(
        { error: 'ID, title, content, and author_name are required' },
        { status: 400 }
      );
    }

    console.log('Updating crimson entry via admin API:', id);

    const { data, error } = await supabaseAdmin
      .from('crimson_ledger_entries')
      .update({
        title,
        content,
        author_name,
        category,
        is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating crimson entry:', error);
      return NextResponse.json(
        { error: 'Failed to update crimson entry' },
        { status: 500 }
      );
    }

    console.log('Crimson entry updated successfully:', data[0]?.id);

    return NextResponse.json({
      message: 'Crimson entry updated successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Update crimson entry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
