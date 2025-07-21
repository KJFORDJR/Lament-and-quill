import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(email, full_name),
        order_items(
          quantity,
          merchandise(title, price, category)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // For now, we'll log the email content
    // In production, you'd integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - Nodemailer

    const customerEmail = generateCustomerEmail(order);
    const adminNotification = generateAdminNotification(order);

    // Log emails (replace with actual email sending)
    console.log('=== CUSTOMER CONFIRMATION EMAIL ===');
    console.log(`To: ${order.profiles?.email}`);
    console.log(`Subject: ${customerEmail.subject}`);
    console.log(customerEmail.body);
    console.log('\n=== ADMIN NOTIFICATION EMAIL ===');
    console.log(`To: admin@lamentandquill.com`);
    console.log(`Subject: ${adminNotification.subject}`);
    console.log(adminNotification.body);

    return NextResponse.json({
      success: true,
      message: 'Order emails sent successfully',
      emailsSent: {
        customer: order.profiles?.email,
        admin: 'admin@lamentandquill.com'
      }
    });

  } catch (error: any) {
    console.error('Error sending order emails:', error);
    return NextResponse.json(
      { error: 'Failed to send order emails', details: error.message },
      { status: 500 }
    );
  }
}

function generateCustomerEmail(order: any) {
  const hasDigitalItems = order.order_items?.some((item: any) => item.merchandise.category === 'digital');
  const hasPhysicalItems = order.order_items?.some((item: any) => item.merchandise.category !== 'digital');
  
  const itemsList = order.order_items?.map((item: any) => 
    `- ${item.merchandise.title} (${item.quantity}x) - $${(item.merchandise.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return {
    subject: `Order Confirmation - ${order.order_number} | Lament & Quill`,
    body: `
Dear ${order.profiles?.full_name || 'Valued Customer'},

Thank you for your order from Lament & Quill - where shadows meet substance.

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.order_number}
Order Date: ${new Date(order.created_at).toLocaleDateString()}
Payment Status: ${order.payment_status === 'paid' ? '✓ PAID' : 'Processing'}
Total Amount: $${order.total_amount.toFixed(2)}

ITEMS ORDERED:
${itemsList}

${hasDigitalItems ? `
🔮 DIGITAL GOODS:
Your digital items are being processed and access links will be sent within 24 hours.
` : ''}

${hasPhysicalItems ? `
📦 SHIPPING INFORMATION:
Your physical items are being prepared for shipment.
Expected delivery: 3-5 business days
Tracking information will be provided once shipped.
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Contact us at support@lamentandquill.com

Thank you for choosing Lament & Quill.
"Two cities. Two Ghosts. One reckoning."

The Lament & Quill Team
    `
  };
}

function generateAdminNotification(order: any) {
  const itemsList = order.order_items?.map((item: any) => 
    `- ${item.merchandise.title} (${item.quantity}x) - $${(item.merchandise.price * item.quantity).toFixed(2)} [${item.merchandise.category}]`
  ).join('\n');

  return {
    subject: `🛍️ New Order: ${order.order_number} - $${order.total_amount.toFixed(2)}`,
    body: `
NEW ORDER RECEIVED!

Order: ${order.order_number}
Customer: ${order.profiles?.full_name} (${order.profiles?.email})
Date: ${new Date(order.created_at).toLocaleString()}
Payment: ${order.payment_status === 'paid' ? '✓ PAID' : 'PENDING'}
Total: $${order.total_amount.toFixed(2)}

ITEMS:
${itemsList}

SHIPPING ADDRESS:
${order.shipping_address ? JSON.stringify(order.shipping_address, null, 2) : 'N/A'}

${order.stripe_payment_intent_id ? `Stripe Payment Intent: ${order.stripe_payment_intent_id}` : ''}

Action Required:
- Prepare items for shipment/delivery
- Update order status as needed
- Process any digital goods delivery

View order in admin panel: http://localhost:3000/admin
    `
  };
}
