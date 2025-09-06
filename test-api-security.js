// Test script to verify the API security fixes
const testEndpoint = async (url, description) => {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Check for sensitive fields
    const sensitiveFields = ['admin_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password'];
    const exposedFields = sensitiveFields.filter(field => data.hasOwnProperty(field));
    
    if (exposedFields.length > 0) {
      console.log('⚠️  SECURITY ISSUE: Exposed sensitive fields:', exposedFields);
    } else {
      console.log('✅ No sensitive fields exposed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Test the public endpoint
testEndpoint('http://localhost:3000/api/system-config', 'Public System Config API');

// Test the admin endpoint (should fail without auth)
testEndpoint('http://localhost:3000/api/admin/system-config', 'Admin System Config API (no auth)');
