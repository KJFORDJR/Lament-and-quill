const { createClient } = require('@supabase/supabase-js');

// Regular client (anon role)
const supabase = createClient(
  'https://kechblfqfvcvodwvxgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2hibGZxZnZjdm9kd3Z4Z2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjA4NzYsImV4cCI6MjA2ODUzNjg3Nn0.ZmTPCpRnQ1GpP9AqdI48qIipUXPcec51ZnLNchyKWOo'
);

// Admin client (service role)
const supabaseAdmin = createClient(
  'https://kechblfqfvcvodwvxgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2hibGZxZnZjdm9kd3Z4Z2l2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk2MDg3NiwiZXhwIjoyMDY4NTM2ODc2fQ.c2gQU1gOowMhW-IAQfOP3E8vb5X3YwO-ACcPGkaw8mU'
);

async function testRLS() {
  console.log('🔍 Testing Row Level Security (RLS) policies...\n');
  
  console.log('1️⃣ ANON CLIENT (Regular users):');
  const { data: anonOrders, error: anonError } = await supabase
    .from('orders')
    .select('id, order_number, user_id, created_at');
    
  console.log('- Error:', anonError);
  console.log('- Count:', anonOrders?.length || 0);
  if (anonOrders && anonOrders.length > 0) {
    console.log('- Sample:', anonOrders[0]);
  }
  
  console.log('\n2️⃣ ADMIN CLIENT (Service role):');
  const { data: adminOrders, error: adminError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, user_id, created_at');
    
  console.log('- Error:', adminError);
  console.log('- Count:', adminOrders?.length || 0);
  if (adminOrders && adminOrders.length > 0) {
    console.log('- Sample:', adminOrders[0]);
    
    // Test admin client with full email API query
    console.log('\n3️⃣ Testing full email API query with ADMIN:');
    const { data: fullOrder, error: fullError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          quantity,
          unit_price,
          merchandise(title, price, category, image_url)
        )
      `)
      .eq('id', adminOrders[0].id)
      .single();
      
    console.log('- Error:', fullError);
    console.log('- Order found:', fullOrder ? 'Yes' : 'No');
    if (fullOrder) {
      console.log('- Details:', {
        id: fullOrder.id,
        order_number: fullOrder.order_number,
        user_id: fullOrder.user_id,
        items_count: fullOrder.order_items?.length || 0
      });
    }
  }
}

testRLS().catch(console.error);
