import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all published dossier entries (public)
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('dossier_entries')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published dossier entries:', error);
      return NextResponse.json({ error: 'Failed to fetch dossier entries' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error fetching dossier entries:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
