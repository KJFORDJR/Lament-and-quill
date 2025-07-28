import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { userId, banType, reason, durationDays, restrictions, bannedBy } = body;

    if (!userId || !banType || !reason || !bannedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, banType, reason, bannedBy' 
      }, { status: 400 });
    }

    // Validate ban type
    if (!['temporary', 'permanent', 'shadowban'].includes(banType)) {
      return NextResponse.json({ 
        error: 'Invalid ban type. Must be temporary, permanent, or shadowban' 
      }, { status: 400 });
    }

    // Calculate expiration date for temporary bans
    let banExpiresAt = null;
    if (banType === 'temporary' && durationDays) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(durationDays));
      banExpiresAt = expirationDate.toISOString();
    }

    // Update user's ban status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: bannedBy,
        ban_reason: reason,
        ban_expires_at: banExpiresAt,
        ban_type: banType,
        user_role: 'banned' // Keep the existing role system for compatibility
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user ban status:', updateError);
      return NextResponse.json({ 
        error: 'Failed to ban user', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Add entry to ban history
    const { error: historyError } = await supabaseAdmin
      .from('ban_history')
      .insert({
        user_id: userId,
        banned_by: bannedBy,
        action: 'banned',
        ban_type: banType,
        reason,
        duration_days: banType === 'temporary' ? parseInt(durationDays) : null
      });

    if (historyError) {
      console.error('Error adding to ban history:', historyError);
      // Don't fail the request if history insertion fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${banType === 'temporary' ? 'temporarily' : 'permanently'} banned`,
      banExpiresAt 
    });

  } catch (error) {
    console.error('Error in ban user API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { userId, unbannedBy, reason } = body;

    if (!userId || !unbannedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, unbannedBy' 
      }, { status: 400 });
    }

    // Update user's ban status
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        ban_reason: null,
        ban_expires_at: null,
        ban_type: null,
        user_role: 'user' // Reset to default role
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user unban status:', updateError);
      return NextResponse.json({ 
        error: 'Failed to unban user', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Add entry to ban history
    const { error: historyError } = await supabaseAdmin
      .from('ban_history')
      .insert({
        user_id: userId,
        banned_by: unbannedBy,
        action: 'unbanned',
        reason: reason || 'Manual unban by admin'
      });

    if (historyError) {
      console.error('Error adding to ban history:', historyError);
      // Don't fail the request if history insertion fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User unbanned successfully' 
    });

  } catch (error) {
    console.error('Error in unban user API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
