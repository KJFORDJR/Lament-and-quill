import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { fragmentId, userId, action } = await request.json();

    if (!fragmentId || !userId || !action) {
      return NextResponse.json(
        { error: 'Fragment ID, user ID, and action are required' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      // Add like
      const { data, error } = await supabaseAdmin
        .from('lament_fragment_likes')
        .insert({
          fragment_id: fragmentId,
          user_id: userId
        })
        .select();

      if (error) {
        // Check if it's a duplicate key error (user already liked)
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Already liked' },
            { status: 409 }
          );
        }
        console.error('Error adding like:', error);
        return NextResponse.json(
          { error: 'Failed to add like' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Like added successfully',
        data: data[0]
      });

    } else if (action === 'unlike') {
      // Remove like
      const { error } = await supabaseAdmin
        .from('lament_fragment_likes')
        .delete()
        .eq('fragment_id', fragmentId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing like:', error);
        return NextResponse.json(
          { error: 'Failed to remove like' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Like removed successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fragmentId = searchParams.get('fragmentId');
    const userId = searchParams.get('userId');

    if (!fragmentId) {
      return NextResponse.json(
        { error: 'Fragment ID is required' },
        { status: 400 }
      );
    }

    // Get like count and user's like status
    const { data: likes, error } = await supabaseAdmin
      .from('lament_fragment_likes')
      .select('user_id')
      .eq('fragment_id', fragmentId);

    if (error) {
      console.error('Error fetching likes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch likes' },
        { status: 500 }
      );
    }

    const likeCount = likes.length;
    const isLiked = userId ? likes.some(like => like.user_id === userId) : false;

    return NextResponse.json({
      likeCount,
      isLiked
    });

  } catch (error) {
    console.error('Get likes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
