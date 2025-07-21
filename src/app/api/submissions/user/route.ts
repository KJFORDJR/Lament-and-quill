import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Fetching submissions for user:', userId);

    // Fetch user submissions using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('lament_submissions')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API: Submissions fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Submissions fetched successfully for user:', userId);

    return NextResponse.json({ 
      success: true, 
      data: data || []
    });

  } catch (error: any) {
    console.error('API: Get user submissions error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
