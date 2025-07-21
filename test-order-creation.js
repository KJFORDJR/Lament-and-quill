const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kechblfqfvcvodwvxgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2hibGZxZnZjdm9kd3Z4Z2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjA4NzYsImV4cCI6MjA2ODUzNjg3Nn0.ZmTPCpRnQ1GpP9AqdI48qIipUXPcec51ZnLNchyKWOo'
);

// Service role for admin operations
const supabaseAdmin = createClient(
  'https://kechblfqfvcvodwvxgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2hibGZxZnZjdm9kd3Z4Z2l2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MDg3NiwiZXhwIjoyMDY4NTM2ODc2fQ.c2gQU1gOowMhW-IAQfOP3E8vb5X3YwO-ACcPGkaw8mU'
);

async function testOrderCreation() {
  console.log('🔍 Testing order creation...');

  // First, check if we have any users in the database
  const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  console.log('Users found:', users?.users?.length || 0);
  
  if (!users?.users?.length) {
    console.log('❌ No users found - creating test user is needed');
    return;
  }
  
  const testUserId = users.users[0].id;
  console.log('✅ Using test user ID:', testUserId);

  // Generate order number
  const { data: orderNumber, error: orderNumError } = await supabase
    .rpc('generate_order_number');
  
  if (orderNumError) {
    console.error('❌ Order number error:', orderNumError);
    return;
  }
  
  console.log('✅ Generated order number:', orderNumber);

  // Try to create a test order
  const testOrder = {
    user_id: testUserId,
    order_number: orderNumber,
    total_amount: 99.99,
    shipping_address: {
      firstName: "Test",
      lastName: "User", 
      address1: "123 Test St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
      email: "test@test.com",
      phone: "555-0123"
    },
    payment_method: "test-order",
    payment_status: "paid",
    status: "processing"
  };

  console.log('🔄 Creating test order...');
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(testOrder)
    .select()
    .single();

  if (orderError) {
    console.error('❌ Order creation error:', orderError);
    console.error('Order data attempted:', testOrder);
  } else {
    console.log('✅ Order created successfully:', order);
    
    // Now test the email system with this real order
    console.log('\n📧 Testing email system with real order...');
    try {
      const response = await fetch('http://localhost:3000/api/send-order-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      const result = await response.json();
      console.log('Email API Response:', result);
      
      if (response.ok) {
        console.log('✅ Emails sent successfully!');
      } else {
        console.log('❌ Email sending failed:', result);
      }
    } catch (emailError) {
      console.error('❌ Email request error:', emailError);
    }
  }
}

testOrderCreation().catch(console.error);
