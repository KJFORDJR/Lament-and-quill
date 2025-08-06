import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  content_type: 'html' | 'text';
}

interface Subscriber {
  user_id: string;
  email: string;
}

export class EmailService {
  private defaultFrom = process.env.RESEND_FROM_EMAIL || 'newsletter@lamentandquill.com';

  async sendSingleEmail(options: EmailOptions) {
    try {
      const emailData: any = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
      };

      if (options.html) {
        emailData.html = options.html;
      }
      if (options.text) {
        emailData.text = options.text;
      }

      const { data, error } = await resend.emails.send(emailData);

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Email send error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendNewsletterCampaign(
    campaign: NewsletterCampaign, 
    subscribers: Subscriber[]
  ) {
    const results = [];
    const batchSize = 10; // Send in batches to avoid rate limits

    // Create email template
    const emailTemplate = this.createNewsletterTemplate(campaign);

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const batchPromises = batch.map(subscriber => 
        this.sendNewsletterToSubscriber(campaign, subscriber, emailTemplate)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map((result, index) => ({
        subscriber: batch[index],
        success: result.status === 'fulfilled' && result.value.success,
        error: result.status === 'rejected' ? result.reason : 
               (result.status === 'fulfilled' && !result.value.success ? result.value.error : null)
      })));

      // Add small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private async sendNewsletterToSubscriber(
    campaign: NewsletterCampaign,
    subscriber: Subscriber,
    emailTemplate: { html: string; text: string }
  ) {
    try {
      // Add unsubscribe link to content
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?token=${subscriber.user_id}`;
      
      const personalizedHtml = emailTemplate.html.replace(
        '{{UNSUBSCRIBE_URL}}', 
        unsubscribeUrl
      );
      
      const personalizedText = emailTemplate.text.replace(
        '{{UNSUBSCRIBE_URL}}', 
        unsubscribeUrl
      );

      return await this.sendSingleEmail({
        to: [subscriber.email],
        subject: campaign.subject,
        html: personalizedHtml,
        text: personalizedText
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private createNewsletterTemplate(campaign: NewsletterCampaign) {
    const baseHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.subject}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            background-color: #0a0a0a;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8B0000 0%, #4A0E0E 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .tagline {
            margin: 10px 0 0 0;
            font-style: italic;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #c0c0c0;
            border-bottom: 2px solid #8B0000;
            padding-bottom: 10px;
        }
        .footer {
            background-color: #0f0f0f;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #333;
        }
        .unsubscribe {
            color: #888;
            font-size: 12px;
        }
        .unsubscribe a {
            color: #8B0000;
            text-decoration: none;
        }
        .unsubscribe a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Lament and Quill</h1>
            <p class="tagline">Two cities. Two Ghosts. One reckoning.</p>
        </div>
        <div class="content">
            <h2>${campaign.title}</h2>
            ${campaign.content_type === 'html' ? campaign.content : `<p>${campaign.content.replace(/\n/g, '</p><p>')}</p>`}
        </div>
        <div class="footer">
            <p class="unsubscribe">
                You're receiving this because you subscribed to updates from Lament and Quill.<br>
                <a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile">Manage Preferences</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const baseText = `
LAMENT AND QUILL
Two cities. Two Ghosts. One reckoning.

${campaign.title}
${'='.repeat(campaign.title.length)}

${campaign.content_type === 'html' ? campaign.content.replace(/<[^>]*>/g, '') : campaign.content}

---

You're receiving this because you subscribed to updates from Lament and Quill.
Unsubscribe: {{UNSUBSCRIBE_URL}}
Manage Preferences: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile
`;

    return {
      html: baseHtml,
      text: baseText
    };
  }
}

export const emailService = new EmailService();
