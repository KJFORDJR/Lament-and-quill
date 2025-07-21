import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Include email from auth user
    const profileWithEmail = {
      ...profile,
      email: user.email
    };

    return NextResponse.json(profileWithEmail);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      username, 
      display_name, 
      email,
      phone_number,
      bio,
      city_affiliation,
      shipping_address 
    } = body;

    // Update profile in database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name,
        last_name,
        username,
        display_name,
        phone_number,
        bio,
        city_affiliation,
        shipping_address,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
    }

    // Update email if changed
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email
      });

      if (emailError) {
        console.error('Email update error:', emailError);
        // Profile was updated successfully, but email change failed
        return NextResponse.json({ 
          ...profile, 
          email: user.email, // Return old email
          emailUpdateError: 'Email change requires verification. Check your inbox.' 
        });
      }
    }

    return NextResponse.json({ 
      ...profile, 
      email: email || user.email 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
