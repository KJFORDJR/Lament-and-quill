import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Newsletter subscription fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter subscription' },
        { status: 500 }
      );
    }

    if (!data) {
      // No subscription found, return default state
      return NextResponse.json({
        subscription: {
          is_subscribed: false,
          preferences: {
            new_posts: true,
            newsletters: true,
            announcements: true
          }
        }
      });
    }

    return NextResponse.json({
      subscription: data
    });
  } catch (error) {
    console.error('Newsletter subscription GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
