import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Test email to verify domain setup
    const result = await resend.emails.send({
      from: 'support@lamentandquill.com',
      to: testEmail,
      subject: 'Test Email from Lament & Quill',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from Lament & Quill to verify that the email system is working correctly.</p>
        <p><strong>Domain:</strong> lamentandquill.com</p>
        <p><strong>Service:</strong> Resend</p>
        <p><strong>Status:</strong> ✅ Working</p>
        <hr>
        <p><em>"Two cities. Two Ghosts. One reckoning."</em></p>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}
