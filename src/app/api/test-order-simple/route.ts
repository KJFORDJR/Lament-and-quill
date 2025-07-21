import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    console.log('Simple test endpoint received orderId:', orderId);
    
    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      orderId: orderId
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed'
    }, { status: 500 });
  }
}
