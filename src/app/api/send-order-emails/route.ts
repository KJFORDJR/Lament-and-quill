import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    console.log('🔍 Email API called with orderId:', orderId, 'Type:', typeof orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch order details with user profile using ADMIN client to bypass RLS
    console.log('🔍 Attempting to fetch order from database...');
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          quantity,
          unit_price,
          merchandise(title, price, category, image_url)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Order fetch error:', orderError);
      console.error('❌ Failed to find order with ID:', orderId);
      
      // Let's try to see what orders exist using ADMIN client
      const { data: allOrders, error: listError } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!listError && allOrders) {
        console.log('🔍 Recent orders in database:', allOrders);
      }
      
      return NextResponse.json(
        { error: 'Order not found', details: orderError.message },
        { status: 404 }
      );
    }

    if (!order) {
      console.error('❌ Order is null/undefined');
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found order:', {
      id: order.id,
      order_number: order.order_number,
      user_id: order.user_id,
      total_amount: order.total_amount
    });

    // Fetch user profile and email separately using ADMIN client
    console.log('🔍 Fetching user profile and email...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', order.user_id)
      .single();

    // Get user email from auth.users using admin client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    
    if (authError) {
      console.error('❌ Auth user fetch error:', authError);
      return NextResponse.json(
        { error: 'User not found', details: authError.message },
        { status: 404 }
      );
    }

    console.log('✅ Found user email:', authUser.user?.email);

    // Combine the data
    const orderWithUser = {
      ...order,
      profiles: {
        email: authUser.user?.email,
        first_name: profile?.first_name,
        last_name: profile?.last_name
      }
    };

    console.log('📧 Preparing to send emails for order:', orderWithUser.order_number);

    // Generate email content
    const customerEmail = generateCustomerEmail(orderWithUser);
    const adminNotification = generateAdminNotification(orderWithUser);

    // Send emails using Resend with your verified domain
    try {
      const fromEmail = 'support@lamentandquill.com';
      const customerEmailAddress = orderWithUser.profiles?.email || orderWithUser.shipping_address?.email;
      
      if (!customerEmailAddress) {
        throw new Error('Customer email address not found');
      }

      console.log('📤 Sending customer confirmation to:', customerEmailAddress);
      console.log('📤 Sending admin notification to: support@lamentandquill.com');

      // Send customer confirmation email
      const customerResult = await resend.emails.send({
        from: fromEmail,
        to: customerEmailAddress,
        subject: customerEmail.subject,
        html: customerEmail.html,
      });

      console.log('✅ Customer email sent:', customerResult);

      // Send admin notification email
      const adminResult = await resend.emails.send({
        from: fromEmail,
        to: 'support@lamentandquill.com',
        subject: adminNotification.subject,
        html: adminNotification.html,
      });

      console.log('✅ Admin notification sent:', adminResult);
      console.log('✅ Order confirmation emails sent successfully');
      
    } catch (emailError) {
      console.error('❌ Failed to send emails:', emailError);
      
      // Log the actual error for debugging
      if (emailError instanceof Error) {
        console.error('Email error details:', emailError.message);
      }
      
      return NextResponse.json({
        success: false,
        message: 'Failed to send emails - check server logs for details',
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
        emailAddresses: {
          customer: orderWithUser.profiles?.email || orderWithUser.shipping_address?.email,
          admin: 'support@lamentandquill.com'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order emails sent successfully',
      emailsSent: {
        customer: orderWithUser.profiles?.email || orderWithUser.shipping_address?.email,
        admin: 'support@lamentandquill.com'
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
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #333;">
        ${item.merchandise.title}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">
        $${(item.unit_price * item.quantity).toFixed(2)}
      </td>
    </tr>`
  ).join('');

  const customerName = order.profiles?.first_name ? 
    `${order.profiles.first_name} ${order.profiles.last_name || ''}`.trim() : 
    'Valued Customer';

  return {
    subject: `Order Confirmation - ${order.order_number} | Lament & Quill`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="margin: 0 0 10px 0; color: #c9aa71;">Lament & Quill</h1>
    <p style="margin: 0; font-style: italic; color: #888;">"Two cities. Two Ghosts. One reckoning."</p>
  </div>

  <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #c9aa71; margin-top: 0;">Thank you for your order!</h2>
    
    <p>Dear ${customerName},</p>
    <p>Thank you for your order from Lament & Quill - where shadows meet substance.</p>
    
    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">Order Details</h3>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
      <p><strong>Payment Status:</strong> ${order.payment_status === 'paid' ? '✅ PAID' : '⏳ Processing'}</p>
      <p><strong>Total Amount:</strong> <span style="font-size: 18px; color: #c9aa71;"><strong>$${order.total_amount.toFixed(2)}</strong></span></p>
    </div>

    <h3 style="color: #333;">Items Ordered</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #333; color: #fff;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>

    ${hasDigitalItems ? `
    <div style="background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007cba;">
      <h4 style="margin-top: 0; color: #007cba;">🔮 Digital Goods</h4>
      <p>Your digital items are being processed and access links will be sent within 24 hours.</p>
    </div>
    ` : ''}

    ${hasPhysicalItems ? `
    <div style="background-color: #f0f8e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
      <h4 style="margin-top: 0; color: #4caf50;">📦 Shipping Information</h4>
      <p>Your physical items are being prepared for shipment.</p>
      <p><strong>Expected delivery:</strong> 3-5 business days</p>
      <p>Tracking information will be provided once shipped.</p>
    </div>
    ` : ''}

    <div style="border-top: 2px solid #c9aa71; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p>Questions? Contact us at <a href="mailto:support@lamentandquill.com" style="color: #c9aa71;">support@lamentandquill.com</a></p>
      <p style="margin-bottom: 0;">Thank you for choosing Lament & Quill.</p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>This email was sent to confirm your order. Please keep this for your records.</p>
  </div>
</body>
</html>
    `
  };
}

function generateAdminNotification(order: any) {
  const itemsList = order.order_items?.map((item: any) => 
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.merchandise.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.unit_price * item.quantity).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">
        <span style="padding: 2px 8px; background-color: ${item.merchandise.category === 'digital' ? '#e3f2fd' : '#f3e5f5'}; 
                     color: ${item.merchandise.category === 'digital' ? '#1976d2' : '#7b1fa2'}; border-radius: 12px; font-size: 12px;">
          ${item.merchandise.category === 'digital' ? '📱 Digital' : '📦 Physical'}
        </span>
      </td>
    </tr>`
  ).join('');

  const customerName = order.profiles?.first_name ? 
    `${order.profiles.first_name} ${order.profiles.last_name || ''}`.trim() : 
    'Customer';

  const shippingInfo = order.shipping_address ? `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h4 style="margin-top: 0; color: #495057;">Shipping Address</h4>
      <p style="margin: 5px 0;">${order.shipping_address.firstName} ${order.shipping_address.lastName}</p>
      <p style="margin: 5px 0;">${order.shipping_address.address1}</p>
      ${order.shipping_address.address2 ? `<p style="margin: 5px 0;">${order.shipping_address.address2}</p>` : ''}
      <p style="margin: 5px 0;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}</p>
      <p style="margin: 5px 0;">${order.shipping_address.country}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${order.shipping_address.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shipping_address.phone}</p>
    </div>
  ` : '';

  return {
    subject: `🛍️ New Order: ${order.order_number} - $${order.total_amount.toFixed(2)}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #dc3545; color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
    <h1 style="margin: 0 0 10px 0;">🚨 NEW ORDER RECEIVED!</h1>
    <p style="margin: 0; font-size: 18px; font-weight: bold;">Order ${order.order_number}</p>
  </div>

  <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background-color: #28a745; color: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <h2 style="margin: 0; text-align: center;">💰 Total: $${order.total_amount.toFixed(2)}</h2>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
        <h4 style="margin-top: 0; color: #495057;">Customer Info</h4>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${order.profiles?.email || order.shipping_address?.email}</p>
        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
        <h4 style="margin-top: 0; color: #495057;">Payment Info</h4>
        <p><strong>Status:</strong> 
          <span style="color: ${order.payment_status === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">
            ${order.payment_status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
          </span>
        </p>
        <p><strong>Method:</strong> ${order.payment_method.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
        ${order.stripe_payment_intent_id ? `<p><strong>Stripe ID:</strong> ${order.stripe_payment_intent_id}</p>` : ''}
      </div>
    </div>

    <h3 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">Items Ordered</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #343a40; color: #fff;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Total</th>
          <th style="padding: 10px; text-align: center;">Type</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList}
      </tbody>
    </table>

    ${shippingInfo}

    <div style="background-color: #17a2b8; color: #fff; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <h4 style="margin-top: 0;">📋 Action Required:</h4>
      <ul style="margin: 10px 0;">
        <li>✅ Prepare items for shipment/delivery</li>
        <li>📊 Update order status as needed</li>
        <li>📱 Process any digital goods delivery</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
      <p style="margin: 0;">
        <a href="http://localhost:3000/admin" 
           style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View in Admin Panel
        </a>
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
    <p>This is an automated notification from Lament & Quill order system.</p>
  </div>
</body>
</html>
    `
  };
}
