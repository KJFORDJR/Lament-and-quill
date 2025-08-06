import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/emailService';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: stats, error } = await supabaseAdmin
      .rpc('get_newsletter_stats');

    if (error) {
      console.error('Error fetching newsletter stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch newsletter statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Newsletter stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, campaign_id, sender_id } = await request.json();

    if (action !== 'send' || !campaign_id || !sender_id) {
      return NextResponse.json(
        { error: 'Invalid action or missing parameters' },
        { status: 400 }
      );
    }

    // Verify sender is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_role')
      .eq('id', sender_id)
      .single();

    if (!profile || !['admin', 'moderator'].includes(profile.user_role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only send draft campaigns' },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('user_id, email')
      .eq('is_subscribed', true);

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Update campaign status to sending
    await supabaseAdmin
      .from('newsletter_campaigns')
      .update({ 
        status: 'sending',
        recipient_count: subscribers.length
      })
      .eq('id', campaign_id);

    // Create delivery log entries
    const deliveryEntries = subscribers.map(subscriber => ({
      campaign_id,
      user_id: subscriber.user_id,
      email: subscriber.email,
      status: 'pending'
    }));

    if (deliveryEntries.length > 0) {
      const { error: deliveryError } = await supabaseAdmin
        .from('newsletter_delivery_log')
        .insert(deliveryEntries);

      if (deliveryError) {
        console.error('Error creating delivery log:', deliveryError);
      }
    }

    // Actually send emails using Resend
    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers...`);
    
    try {
      const emailResults = await emailService.sendNewsletterCampaign(
        {
          id: campaign.id,
          title: campaign.title,
          subject: campaign.subject,
          content: campaign.content,
          content_type: campaign.content_type as 'html' | 'text'
        },
        subscribers
      );

      // Update delivery status in database
      let successCount = 0;
      let failureCount = 0;

      for (const result of emailResults) {
        const status = result.success ? 'sent' : 'failed';
        const errorMessage = result.success ? null : result.error;
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }

        await supabaseAdmin
          .from('newsletter_delivery_log')
          .update({ 
            status,
            sent_at: result.success ? new Date().toISOString() : null,
            error_message: errorMessage
          })
          .eq('campaign_id', campaign_id)
          .eq('user_id', result.subscriber.user_id);
      }

      console.log(`✅ Email sending completed: ${successCount} sent, ${failureCount} failed`);

      // Update campaign status
      const finalStatus = failureCount === 0 ? 'sent' : (successCount > 0 ? 'sent' : 'failed');
      await supabaseAdmin
        .from('newsletter_campaigns')
        .update({ 
          status: finalStatus,
          sent_at: new Date().toISOString()
        })
        .eq('id', campaign_id);

      return NextResponse.json({
        message: `Newsletter campaign completed: ${successCount} emails sent successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        recipient_count: subscribers.length,
        success_count: successCount,
        failure_count: failureCount
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Update campaign status to failed
      await supabaseAdmin
        .from('newsletter_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaign_id);

      return NextResponse.json({
        error: 'Failed to send newsletter emails',
        details: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Newsletter send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
