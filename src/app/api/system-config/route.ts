import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching system configuration...');
    
    if (!supabaseAdmin) {
      console.error('API: Supabase admin client not available');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Get system configuration with admin privileges (bypasses RLS)
    const { data: config, error } = await supabaseAdmin
      .from('system_config')
      .select('*')
      .single();

    console.log('API: Raw config data:', config);
    console.log('API: Error:', error);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching system config:', error);
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
      site_title: 'Lament and Quill',
      site_description: 'Two cities. Two Ghosts. One reckoning.',
    };

    const finalConfig = config || defaultConfig;
    console.log('API: Final config being returned:', finalConfig);
    console.log('API: Marketplace enabled in response:', finalConfig.marketplace_enabled);

    // Return with no-cache headers
    const response = NextResponse.json(finalConfig);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Unexpected error fetching system config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}
