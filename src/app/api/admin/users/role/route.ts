import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    // Get the user data
    const { userId, userRole } = await request.json();
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['user', 'moderator', 'admin', 'banned'].includes(userRole)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Updating user role:', userId, 'to', userRole);

    // Update the user role using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        user_role: userRole,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('API: User role update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: User role updated successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (err: any) {
    console.error('API: User role update exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
