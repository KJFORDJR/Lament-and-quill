import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the profile data
    const { id, username, city_affiliation } = await request.json();
    
    console.log('API: Received profile creation request:', {
      id,
      username,
      city_affiliation
    });
    
    if (!id || !username) {
      console.log('API: Missing required fields - id:', !!id, 'username:', !!username);
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      console.log('API: Supabase admin client not available');
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Creating profile for user:', id, 'with username:', username);

    // Normalize city_affiliation to lowercase to match database constraint
    const normalizedAffiliation = city_affiliation ? city_affiliation.toLowerCase() : 'neutral';
    console.log('API: Normalized city affiliation from', city_affiliation, 'to', normalizedAffiliation);

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('API: Error checking existing profile:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingProfile) {
      console.log('API: Profile already exists for user:', id, 'username:', existingProfile.username);
      return NextResponse.json({ 
        success: true, 
        data: existingProfile,
        message: 'Profile already exists'
      });
    }

    // Create the profile using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: id,
        username: username,
        display_name: username, // Use username as display name initially
        city_affiliation: normalizedAffiliation,
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
