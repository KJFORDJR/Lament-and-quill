import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Fetching all lament submissions for admin');

    // Get lament submissions with profile data using admin client
    const { data: submissionsData, error: submissionsError } = await supabaseAdmin
      .from('lament_submissions')
      .select(`
        *,
        profiles!lament_submissions_author_id_fkey(username, user_role)
      `)
      .order('created_at', { ascending: false });
    
    if (submissionsError) {
      console.error('API: Submissions loading error:', submissionsError);
      return NextResponse.json({ error: submissionsError.message }, { status: 500 });
    }

    console.log('API: Raw submissions loaded:', submissionsData?.length || 0);

    // Get tips for these submissions if they exist
    const submissionIds = submissionsData?.map(s => s.id) || [];
    let tipsData: any[] = [];
    
    if (submissionIds.length > 0) {
      console.log('API: Loading tips for submission IDs:', submissionIds.length);
      const { data: tips, error: tipsError } = await supabaseAdmin
        .from('tips')
        .select('submission_id, amount')
        .eq('submission_type', 'lament_submission')
        .in('submission_id', submissionIds);

      if (tipsError) {
        console.error('API: Tips error (non-fatal):', tipsError);
      } else {
        console.log('API: Tips loaded:', tips?.length || 0);
        tipsData = tips || [];
      }
    }

    // Combine submissions with tip data
    const submissionsWithTips = submissionsData?.map(submission => ({
      ...submission,
      tips: tipsData.filter(tip => tip.submission_id === submission.id) || [],
      tipTotal: tipsData.filter(tip => tip.submission_id === submission.id)
        .reduce((sum, tip) => sum + parseFloat(tip.amount), 0) || 0
    })) || [];

    console.log('API: Final submissions with tips:', submissionsWithTips.length);

    return NextResponse.json({ 
      success: true, 
      data: submissionsWithTips
    });

  } catch (err: any) {
    console.error('API: Submissions fetch exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
