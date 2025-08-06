import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { user_id, email, preferences } = await request.json();

    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabaseAdmin
        .from('newsletter_subscriptions')
        .update({
          preferences: preferences || {
            new_posts: true,
            newsletters: true,
            announcements: true
          },
          is_subscribed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        console.error('Newsletter subscription update error:', error);
        return NextResponse.json(
          { error: 'Failed to update newsletter subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Newsletter subscription updated successfully',
        subscription: data
      });
    } else {
      // Create new subscription
      const { data, error } = await supabaseAdmin
        .from('newsletter_subscriptions')
        .insert({
          user_id,
          email,
          preferences: preferences || {
            new_posts: true,
            newsletters: true,
            announcements: true
          },
          is_subscribed: true
        })
        .select()
        .single();

      if (error) {
        console.error('Newsletter subscription creation error:', error);
        return NextResponse.json(
          { error: 'Failed to create newsletter subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Newsletter subscription created successfully',
        subscription: data
      });
    }
  } catch (error) {
    console.error('Newsletter subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({ is_subscribed: false })
      .eq('user_id', user_id);

    if (error) {
      console.error('Newsletter unsubscribe error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe from newsletter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
