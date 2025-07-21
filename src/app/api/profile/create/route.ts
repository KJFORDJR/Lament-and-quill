import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the profile data
    const { id, username, user_role, city_affiliation } = await request.json();
    
    if (!id || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Creating profile for user:', id, 'with username:', username);

    // Create the profile using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: id,
        username: username,
        user_role: user_role || 'user',
        city_affiliation: city_affiliation || 'neutral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('API: Profile creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Profile created successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (err: any) {
    console.error('API: Profile creation exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
