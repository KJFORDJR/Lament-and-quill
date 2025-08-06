import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🔍 Testing newsletter table access...');
    
    // Test if newsletter_subscriptions table exists and is accessible
    const { data: testData, error: testError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id, user_id, is_subscribed')
      .limit(1);

    if (testError) {
      console.error('❌ Newsletter table test failed:', testError);
      return NextResponse.json({
        status: 'error',
        message: 'Newsletter table access failed',
        error: testError.message,
        code: testError.code
      });
    }

    console.log('✅ Newsletter table accessible');
    
    // Test newsletter_campaigns table
    const { data: campaignData, error: campaignError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('id, title, status')
      .limit(1);

    if (campaignError) {
      console.error('❌ Newsletter campaigns table test failed:', campaignError);
      return NextResponse.json({
        status: 'partial',
        message: 'Newsletter subscriptions accessible but campaigns table failed',
        error: campaignError.message,
        subscriptions_count: testData?.length || 0
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'All newsletter tables accessible',
      subscriptions_count: testData?.length || 0,
      campaigns_count: campaignData?.length || 0
    });

  } catch (error) {
    console.error('❌ Newsletter test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Newsletter test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
