import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic orders query
    console.log('Testing orders database connection...');
    
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    console.log('Orders query result:');
    console.log('- Error:', ordersError);
    console.log('- Count:', count);
    console.log('- Data length:', orders?.length || 0);
    console.log('- Sample data:', orders?.[0]);

    // Test profiles query (correct columns)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, user_role')
      .limit(5);

    console.log('Profiles query result:');
    console.log('- Error:', profilesError);
    console.log('- Data length:', profiles?.length || 0);

    // Test order_items query
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5);

    console.log('Order items query result:');
    console.log('- Error:', itemsError);
    console.log('- Data length:', orderItems?.length || 0);

    return NextResponse.json({
      success: true,
      orders: {
        count: count,
        error: ordersError,
        sample: orders?.[0] || null
      },
      profiles: {
        count: profiles?.length || 0,
        error: profilesError
      },
      orderItems: {
        count: orderItems?.length || 0,
        error: itemsError
      }
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
