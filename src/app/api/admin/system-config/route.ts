import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Admin fetching full system configuration...');
    
    if (!supabaseAdmin) {
      console.error('API: Supabase admin client not available');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Get FULL system configuration for admins only
    const { data: config, error } = await supabaseAdmin
      .from('system_config')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching admin system config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system configuration' },
        { status: 500 }
      );
    }

    // Return default config if none exists
    const defaultConfig = {
      maintenance_mode: false,
      registration_enabled: true,
      forum_enabled: true,
      marketplace_enabled: true,
      email_notifications: true,
      ads_enabled: false,
      site_title: 'Lament and Quill',
      site_description: 'Two cities. Two Ghosts. One reckoning.',
      max_file_size: 5,
      session_timeout: 30,
      backup_frequency: 'daily',
      admin_email: '',
      analytics_enabled: true,
      debug_mode: false
    };

    const finalConfig = config || defaultConfig;
    
    // Add ads_enabled from environment variable if not in database
    if (finalConfig.ads_enabled === undefined) {
      finalConfig.ads_enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
    }
    
    console.log('API: Full admin config returned (sensitive data excluded from logs)');

    // Return with no-cache headers
    const response = NextResponse.json(finalConfig);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Unexpected error fetching admin system config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Update system configuration
    const { data, error } = await supabaseAdmin
      .from('system_config')
      .upsert(body)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin system config:', error);
      return NextResponse.json(
        { error: 'Failed to update system configuration' },
        { status: 500 }
      );
    }

    console.log('API: Admin system config updated successfully');

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error updating admin system config:', error);
    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    );
  }
}
