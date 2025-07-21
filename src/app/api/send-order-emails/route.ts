import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('📧 Testing email functionality for order:', orderId);

    // Test email sending with mock data
    const fromEmail = 'support@lamentandquill.com';
    const testCustomerEmail = 'customer@example.com';
    
    // Basic HTML email templates
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #c9aa71;">Thank you for your order!</h1>
        <p>Order Number: <strong>${orderId}</strong></p>
        <p>Total: <strong>$25.00</strong></p>
        <p>We'll process your order shortly.</p>
        <p>Best regards,<br>Lament & Quill Team</p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545;">🚨 New Order Received</h1>
        <p>Order Number: <strong>${orderId}</strong></p>
        <p>Customer: ${testCustomerEmail}</p>
        <p>Total: <strong>$25.00</strong></p>
        <p>Please process this order.</p>
      </div>
    `;

    console.log('📤 Sending test emails...');

    // Send customer confirmation email
    const customerResult = await resend.emails.send({
      from: fromEmail,
      to: testCustomerEmail,
      subject: `Order Confirmation - ${orderId} | Lament & Quill`,
      html: customerHtml,
    });

    console.log('✅ Customer email result:', customerResult);

    // Send admin notification email
    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: 'support@lamentandquill.com',
      subject: `🛍️ New Order: ${orderId} - $25.00`,
      html: adminHtml,
    });

    console.log('✅ Admin email result:', adminResult);

    return NextResponse.json({
      success: true,
      message: 'Test order emails sent successfully',
      emailsSent: {
        customer: testCustomerEmail,
        admin: 'support@lamentandquill.com'
      },
      emailIds: {
        customer: customerResult.data?.id,
        admin: adminResult.data?.id
      }
    });
    
  } catch (error) {
    console.error('❌ Error sending order emails:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send order emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
