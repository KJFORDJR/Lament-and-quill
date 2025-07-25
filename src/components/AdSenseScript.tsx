'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function AdSenseScript() {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if ads are enabled in system configuration
    const checkAdsConfig = async () => {
      try {
        // First check environment variable as fallback
        const envAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
        
        const response = await fetch('/api/system-config', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const config = await response.json();
          // Check if ads_enabled exists in config, fall back to env var, then default to false
          setAdsEnabled(
            config.ads_enabled !== undefined 
              ? config.ads_enabled 
              : envAdsEnabled
          );
        } else {
          // If API fails, fall back to environment variable
          setAdsEnabled(envAdsEnabled);
        }
      } catch (error) {
        console.error('Error checking ads configuration:', error);
        // Fall back to environment variable, then default to disabled
        const envAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
        setAdsEnabled(envAdsEnabled);
      } finally {
        setLoading(false);
      }
    };

    checkAdsConfig();
  }, []);

  // Don't render anything while loading or if ads are disabled
  if (loading || !adsEnabled) {
    return null;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9483812306598147"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export default AdSenseScript;
