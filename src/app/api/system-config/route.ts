import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get system configuration
    const { data: config, error } = await supabase
      .from('system_config')
      .select('*')
      .single();

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

    return NextResponse.json(config || defaultConfig);
  } catch (error) {
    console.error('Unexpected error fetching system config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}
