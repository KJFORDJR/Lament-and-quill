import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// GET dossier entries based on authentication status
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Create a client with the user's token to check authentication
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        isAuthenticated = !error && !!user;
      } catch {
        isAuthenticated = false;
      }
    }

    let query = supabaseAdmin
      .from('dossier_entries')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // If user is not authenticated, only show public classification entries
    if (!isAuthenticated) {
      query = query.eq('classification', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dossier entries:', error);
      return NextResponse.json({ error: 'Failed to fetch dossier entries' }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      isAuthenticated,
      message: !isAuthenticated ? 'Showing public entries only. Login for full access.' : undefined
    });
  } catch (err) {
    console.error('Unexpected error fetching dossier entries:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
