import { NextRequest, NextResponse } from 'next/server';
import { testResendSMTP, validateResendConfig } from '@/lib/resend-smtp';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Test email address is required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address format'
      }, { status: 400 });
    }

    // Validate Resend configuration
    const configValidation = validateResendConfig();
    if (!configValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Configuration issues: ${configValidation.issues.join(', ')}`,
        provider: 'Resend'
      }, { status: 500 });
    }

    // Test Resend SMTP
    const result = await testResendSMTP(testEmail);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail} via Resend SMTP`,
        provider: 'Resend',
        messageId: result.messageId,
        deliveryTime: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        provider: 'Resend'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('SMTP test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'SMTP test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'Resend'
    }, { status: 500 });
  }
}
