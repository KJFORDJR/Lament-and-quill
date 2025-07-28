import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET forum statistics
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get total active threads
    const { count: activeThreads } = await supabaseAdmin
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    // Get registered users count
    const { count: registeredUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get daily posts count (threads + replies from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { count: todayThreads } = await supabaseAdmin
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .eq('is_deleted', false);

    const { count: todayReplies } = await supabaseAdmin
      .from('forum_replies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .eq('is_deleted', false);

    const dailyPosts = (todayThreads || 0) + (todayReplies || 0);

    // Get total replies count
    const { count: totalReplies } = await supabaseAdmin
      .from('forum_replies')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    // Get online users count (users active in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { count: onlineUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', fifteenMinutesAgo);

    // Get recent activity (latest 5 threads)
    const { data: recentThreads } = await supabaseAdmin
      .from('forum_threads')
      .select(`
        id,
        title,
        category,
        created_at,
        last_activity_at,
        profiles:author_id (
          username,
          city_affiliation
        )
      `)
      .eq('is_deleted', false)
      .order('last_activity_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      activeThreads: activeThreads || 0,
      registeredUsers: registeredUsers || 0,
      dailyPosts,
      totalReplies: totalReplies || 0,
      onlineUsers: onlineUsers || 0,
      recentActivity: recentThreads || []
    });
  } catch (err) {
    console.error('Unexpected error fetching forum stats:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
