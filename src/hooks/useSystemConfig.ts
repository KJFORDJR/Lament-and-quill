import { useState, useEffect } from 'react';

interface SystemConfig {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  forum_enabled: boolean;
  marketplace_enabled: boolean;
  email_notifications: boolean;
  ads_enabled: boolean;
  site_title: string;
  site_description: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/system-config');
        if (!response.ok) {
          throw new Error('Failed to fetch system configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching system config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error, refetch: () => setLoading(true) };
}
