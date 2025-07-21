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

export async function GET() {
  try {
    console.log('Fetching crimson submissions via admin API...');

    // Get submissions with user profiles and tip counts
    const { data, error } = await supabaseAdmin
      .from('crimson_confessions_submissions')
      .select(`
        id,
        title,
        content,
        author_id,
        status,
        created_at,
        profiles:author_id (
          username
        ),
        tips:crimson_confessions_tips (
          id,
          amount
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching crimson submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crimson submissions' },
        { status: 500 }
      );
    }

    // Calculate tip totals
    const submissionsWithTotals = (data || []).map(submission => ({
      ...submission,
      tipTotal: submission.tips?.reduce((total: number, tip: any) => total + (tip.amount || 0), 0) || 0
    }));

    console.log(`Successfully fetched ${submissionsWithTotals.length} crimson submissions`);

    return NextResponse.json({
      message: 'Crimson submissions fetched successfully',
      data: submissionsWithTotals
    });

  } catch (error) {
    console.error('Crimson submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
