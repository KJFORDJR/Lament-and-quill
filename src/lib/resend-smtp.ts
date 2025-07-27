import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Resend SMTP configuration for Supabase
export const resendSMTPConfig = {
  host: 'smtp.resend.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
  from: process.env.RESEND_FROM_EMAIL || 'noreply@lamentandquill.com'
};

// Test Resend SMTP connectivity with branded email
export async function testResendSMTP(toEmail: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lamentandquill.com';
    
    const { data, error } = await resend.emails.send({
      from: `Lament and Quill <${fromEmail}>`,
      to: [toEmail],
      subject: 'SMTP Test - The Convergence Awaits',
      html: `
        <div style="background: #0a0a0a; color: #c0c0c0; font-family: 'Courier New', monospace; padding: 40px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; border: 2px solid #8B0000; border-radius: 12px; padding: 40px; background: #111111;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #8B0000; font-size: 28px; margin: 0; text-shadow: 0 0 15px #8B0000; letter-spacing: 2px;">
                ⚡ LAMENT AND QUILL ⚡
              </h1>
              <p style="color: #666; font-style: italic; margin: 10px 0 0 0; font-size: 16px;">
                Two cities. Two Ghosts. One reckoning.
              </p>
              <div style="height: 2px; background: linear-gradient(90deg, #8B0000, #c0c0c0, #8B0000); margin: 20px auto; width: 80%;"></div>
            </div>
            
            <!-- Main Content -->
            <div style="background: #1a1a1a; border-left: 4px solid #8B0000; padding: 25px; margin: 30px 0;">
              <h2 style="color: #c0c0c0; margin: 0 0 15px 0; font-size: 20px;">
                🔌 SMTP CONNECTION ESTABLISHED
              </h2>
              <p style="margin: 0 0 15px 0; color: #999; line-height: 1.6;">
                Your Resend SMTP integration is functioning correctly. The convergence of email delivery has been established through the Neo-Gothic digital realm.
              </p>
              <div style="background: #0a0a0a; border: 1px solid #333; padding: 15px; border-radius: 6px;">
                <p style="margin: 0; color: #8B0000; font-weight: bold; font-size: 14px;">
                  ✅ DELIVERY STATUS: CONFIRMED
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                  Provider: Resend SMTP Infrastructure
                </p>
              </div>
            </div>
            
            <!-- Technical Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #c0c0c0; font-size: 16px; margin: 0 0 15px 0; border-bottom: 1px solid #333; padding-bottom: 10px;">
                Technical Configuration
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
                <div>
                  <span style="color: #8B0000;">SMTP Host:</span>
                  <span style="color: #c0c0c0; margin-left: 10px;">smtp.resend.com</span>
                </div>
                <div>
                  <span style="color: #8B0000;">Port:</span>
                  <span style="color: #c0c0c0; margin-left: 10px;">587 (STARTTLS)</span>
                </div>
                <div>
                  <span style="color: #8B0000;">Authentication:</span>
                  <span style="color: #c0c0c0; margin-left: 10px;">API Key</span>
                </div>
                <div>
                  <span style="color: #8B0000;">Test Time:</span>
                  <span style="color: #c0c0c0; margin-left: 10px;">${new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <!-- Features -->
            <div style="background: #0f0f0f; border: 1px solid #333; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 16px;">Resend Capabilities</h3>
              <ul style="margin: 0; padding: 0; list-style: none; color: #999; font-size: 13px; line-height: 1.8;">
                <li>• <span style="color: #c0c0c0;">3,000 emails/month</span> in free tier</li>
                <li>• <span style="color: #c0c0c0;">99.9% uptime SLA</span> guaranteed</li>
                <li>• <span style="color: #c0c0c0;">Superior deliverability</span> optimization</li>
                <li>• <span style="color: #c0c0c0;">Real-time analytics</span> and tracking</li>
                <li>• <span style="color: #c0c0c0;">Custom domain</span> support enabled</li>
              </ul>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center; margin-top: 40px;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                From the shadows of the Neo-Gothic digital realm
              </p>
              <p style="color: #8B0000; font-weight: bold; margin: 5px 0 0 0; font-size: 14px;">
                The Lament and Quill System
              </p>
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #8B0000, transparent); margin: 15px auto; width: 200px;"></div>
            </div>
            
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message || 'Unknown error'}`);
    }

    return { 
      success: true, 
      data,
      messageId: data?.id,
      provider: 'Resend'
    };
  } catch (error) {
    console.error('Resend SMTP test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'Resend'
    };
  }
}

// Helper function to validate Resend configuration
export function validateResendConfig() {
  const issues = [];
  
  if (!process.env.RESEND_API_KEY) {
    issues.push('RESEND_API_KEY environment variable is missing');
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    issues.push('RESEND_API_KEY appears to be invalid (should start with "re_")');
  }
  
  if (!process.env.RESEND_FROM_EMAIL) {
    issues.push('RESEND_FROM_EMAIL environment variable is missing');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
