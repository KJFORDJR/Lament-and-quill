import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Fetching all lament fragments for admin');

    // Get lament fragments using admin client
    const { data, error } = await supabaseAdmin
      .from('lament_fragments_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('API: Fragments loading error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Fragments loaded:', data?.length || 0);

    return NextResponse.json({ 
      success: true, 
      data: data || []
    });

  } catch (err: any) {
    console.error('API: Fragments fetch exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
