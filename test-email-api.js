const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEmailAPI() {
  console.log('🔍 Testing email API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/send-order-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderId: '3ea59a1b-bc94-4b00-b9a7-ffd7bf0c1966' 
      }),
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    if (response.ok) {
      try {
        const json = JSON.parse(responseText);
        console.log('✅ Parsed JSON:', json);
      } catch (parseError) {
        console.log('❌ JSON parse error but response was OK:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Request error:', error);
  }
}

testEmailAPI();
