const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kechblfqfvcvodwvxgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2hibGZxZnZjdm9kd3Z4Z2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjA4NzYsImV4cCI6MjA2ODUzNjg3Nn0.ZmTPCpRnQ1GpP9AqdI48qIipUXPcec51ZnLNchyKWOo'
);

async function testDB() {
  console.log('🔍 Checking what orders actually exist...');
  
  // Check all orders
  const { data: allOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, created_at, user_id')
    .order('created_at', { ascending: false });
    
  console.log('All orders in database:');
  console.log('- Error:', ordersError);
  console.log('- Count:', allOrders?.length || 0);
  
  if (allOrders && allOrders.length > 0) {
    console.log('- Orders found:');
    allOrders.forEach((order, i) => {
      console.log(`  ${i+1}. ID: ${order.id}`);
      console.log(`     Number: ${order.order_number}`);
      console.log(`     Created: ${order.created_at}`);
      console.log('');
    });
    
    // Test the query that the email API uses
    const testOrderId = allOrders[0].id;
    console.log(`🔍 Testing email API query with order ID: ${testOrderId}`);
    
    const { data: order, error: queryError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          quantity,
          unit_price,
          merchandise(title, price, category, image_url)
        )
      `)
      .eq('id', testOrderId)
      .single();
    
    console.log('Email API query result:');
    console.log('- Error:', queryError);
    console.log('- Order found:', order ? 'Yes' : 'No');
    if (order) {
      console.log('- Order details:', {
        id: order.id,
        order_number: order.order_number,
        items_count: order.order_items?.length || 0
      });
    }
  }
}

testDB().catch(console.error);
