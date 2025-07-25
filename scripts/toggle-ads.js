// Simple script to toggle ads on/off via environment variable
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

function toggleAds() {
  try {
    // Read current .env.local file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check current ads status
    const adsEnabledMatch = envContent.match(/NEXT_PUBLIC_ADS_ENABLED=(.+)/);
    const currentStatus = adsEnabledMatch ? adsEnabledMatch[1].trim() === 'true' : false;
    const newStatus = !currentStatus;

    console.log(`Current ads status: ${currentStatus ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Changing to: ${newStatus ? 'ENABLED' : 'DISABLED'}`);

    // Update or add the NEXT_PUBLIC_ADS_ENABLED line
    if (adsEnabledMatch) {
      // Replace existing line
      envContent = envContent.replace(
        /NEXT_PUBLIC_ADS_ENABLED=.+/,
        `NEXT_PUBLIC_ADS_ENABLED=${newStatus}`
      );
    } else {
      // Add new line
      envContent += envContent.endsWith('\n') ? '' : '\n';
      envContent += `NEXT_PUBLIC_ADS_ENABLED=${newStatus}\n`;
    }

    // Write back to file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Ads ${newStatus ? 'ENABLED' : 'DISABLED'} successfully!`);
    console.log('📝 Please restart your development server for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error toggling ads:', error);
  }
}

// Run the toggle
toggleAds();
