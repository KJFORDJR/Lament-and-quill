// Simple verification script to test that the email system is working
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyEmailSystem() {
  console.log('🔍 Verifying email system...\n');
  
  try {
    // Test the debug endpoint
    console.log('Testing debug endpoint...');
    const debugResponse = await fetch('http://localhost:3001/api/send-order-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: '3ea59a1b-bc94-4b00-b9a7-ffd7bf0c1966' }),
    });
    
    const debugResult = await debugResponse.json();
    
    if (debugResult.emailsSent && debugResult.emailsSent.customer && debugResult.emailsSent.admin) {
      console.log('✅ EMAIL SYSTEM WORKING!');
      console.log(`✅ Customer email sent to: ${debugResult.emailsSent.customer}`);
      console.log(`✅ Admin email sent to: ${debugResult.emailsSent.admin}`);
      console.log('\n📧 Your email system is configured correctly!');
      console.log('🎯 Real orders will now trigger automatic confirmation emails.');
    } else {
      console.log('❌ Email system issue:', debugResult);
    }
    
  } catch (error) {
    console.error('❌ Error testing email system:', error.message);
    console.log('💡 Make sure your dev server is running on port 3001');
  }
}

verifyEmailSystem();
