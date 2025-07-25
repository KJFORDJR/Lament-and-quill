// Simple script to check current ads status
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

function checkAdsStatus() {
  try {
    if (!fs.existsSync(envPath)) {
      console.log('📄 .env.local file not found');
      console.log('🔴 Ads status: DISABLED (default)');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const adsEnabledMatch = envContent.match(/NEXT_PUBLIC_ADS_ENABLED=(.+)/);
    
    if (!adsEnabledMatch) {
      console.log('⚙️  NEXT_PUBLIC_ADS_ENABLED not found in .env.local');
      console.log('🔴 Ads status: DISABLED (default)');
      return;
    }

    const isEnabled = adsEnabledMatch[1].trim() === 'true';
    
    console.log('📊 Current Google AdSense Configuration:');
    console.log('─'.repeat(40));
    console.log(`🎯 Status: ${isEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}`);
    console.log(`📝 Setting: NEXT_PUBLIC_ADS_ENABLED=${adsEnabledMatch[1].trim()}`);
    console.log(`🔗 Client ID: ca-pub-9483812306598147`);
    console.log('─'.repeat(40));
    
    if (isEnabled) {
      console.log('✅ AdSense script will load on all pages');
      console.log('💡 To disable: run `node scripts/toggle-ads.js`');
    } else {
      console.log('❌ AdSense script will NOT load');
      console.log('💡 To enable: run `node scripts/toggle-ads.js`');
    }
    
  } catch (error) {
    console.error('❌ Error checking ads status:', error);
  }
}

// Run the status check
checkAdsStatus();
