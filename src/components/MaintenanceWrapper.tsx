'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SystemConfig {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  forum_enabled: boolean;
  marketplace_enabled: boolean;
}

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch system configuration
    const fetchConfig = async () => {
      try {
        console.log('MaintenanceWrapper: Fetching system config...');
        const timestamp = Date.now();
        const response = await fetch(`/api/system-config?t=${timestamp}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const configData = await response.json();
          console.log('MaintenanceWrapper: Fetched system config:', configData);
          console.log('MaintenanceWrapper: Marketplace enabled:', configData.marketplace_enabled);
          setConfig(configData);
        } else {
          console.error('MaintenanceWrapper: Failed to fetch config, status:', response.status);
        }
      } catch (error) {
        console.error('MaintenanceWrapper: Failed to fetch system config:', error);
        // Assume normal operation if we can't fetch config
        setConfig({
          maintenance_mode: false,
          registration_enabled: true,
          forum_enabled: true,
          marketplace_enabled: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
    
    // Set up an interval to periodically refetch config (every 10 seconds for more responsive updates)
    const interval = setInterval(fetchConfig, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading || !config) return;

    // Check if user is admin
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const response = await fetch('/api/profile?userId=' + user.id);
          if (response.ok) {
            const profile = await response.json();
            console.log('User profile:', profile);
            console.log('Config maintenance_mode:', config.maintenance_mode);
            console.log('Current pathname:', pathname);
            
            // If user is admin, allow access to everything
            if (profile.user_role === 'admin') {
              console.log('User is admin, allowing access');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }

      console.log('User is not admin or not logged in, applying restrictions');
      console.log('Maintenance mode:', config.maintenance_mode);
      console.log('Marketplace enabled:', config.marketplace_enabled);
      console.log('Current pathname:', pathname);

      // Apply maintenance mode restrictions for non-admin users
      if (config.maintenance_mode && pathname !== '/maintenance' && !pathname.startsWith('/admin')) {
        console.log('Redirecting to maintenance page from:', pathname);
        router.push('/maintenance');
        return;
      }

      // Apply other feature restrictions
      if (!config.registration_enabled && pathname === '/register') {
        router.push('/registration-disabled');
        return;
      }

      if (!config.forum_enabled && pathname.startsWith('/forum')) {
        router.push('/forum-maintenance');
        return;
      }

      if (!config.marketplace_enabled && (pathname.startsWith('/merchandise') || pathname.startsWith('/checkout') || pathname.startsWith('/cart') || pathname.startsWith('/orders'))) {
        console.log('MaintenanceWrapper: Marketplace is disabled, redirecting to maintenance page');
        console.log('MaintenanceWrapper: Current marketplace_enabled value:', config.marketplace_enabled);
        router.push('/marketplace-maintenance');
        return;
      }

      // If we're on marketplace maintenance page but marketplace is enabled, redirect away
      if (config.marketplace_enabled && pathname === '/marketplace-maintenance') {
        console.log('MaintenanceWrapper: Marketplace is enabled, redirecting away from maintenance page');
        router.push('/merchandise');
        return;
      }
    };

    checkAdminStatus();
  }, [config, pathname, router, user, loading]);

  if (loading) {
    // Show a loading state while checking configuration
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">
          <div className="animate-spin w-8 h-8 border-2 border-gothic-silver border-t-transparent rounded-full mx-auto mb-4"></div>
          Initializing...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
