import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');
    const userId = searchParams.get('userId');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Get like count for the entry
    const { data: likeCountData, error: countError } = await supabaseAdmin
      .from('crimson_ledger_likes')
      .select('*', { count: 'exact' })
      .eq('entry_id', entryId);

    if (countError) {
      console.error('Error fetching like count:', countError);
      return NextResponse.json({ error: 'Failed to fetch like count' }, { status: 500 });
    }

    const likeCount = likeCountData?.length || 0;
    let isLiked = false;

    // Check if user has liked this entry (only if userId is provided)
    if (userId) {
      const { data: userLikeData, error: userLikeError } = await supabaseAdmin
        .from('crimson_ledger_likes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', userId)
        .single();

      if (userLikeError && userLikeError.code !== 'PGRST116') {
        console.error('Error checking user like status:', userLikeError);
      } else if (userLikeData) {
        isLiked = true;
      }
    }

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error('Unexpected error in likes GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const body = await request.json();
    const { entryId, userId, action } = body;

    if (!entryId || !userId || !action) {
      return NextResponse.json({ error: 'Entry ID, User ID, and action are required' }, { status: 400 });
    }

    if (action === 'like') {
      // Check if already liked
      const { data: existingLike } = await supabaseAdmin
        .from('crimson_ledger_likes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        return NextResponse.json({ error: 'Already liked' }, { status: 400 });
      }

      // Add like
      const { error: insertError } = await supabaseAdmin
        .from('crimson_ledger_likes')
        .insert({
          entry_id: entryId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'liked' });

    } else if (action === 'unlike') {
      // Remove like
      const { error: deleteError } = await supabaseAdmin
        .from('crimson_ledger_likes')
        .delete()
        .eq('entry_id', entryId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'unliked' });

    } else {
      return NextResponse.json({ error: 'Invalid action. Must be "like" or "unlike"' }, { status: 400 });
    }

  } catch (error) {
    console.error('Unexpected error in likes POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
