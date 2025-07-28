'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkUserBanStatus, getBanMessage, type BanStatus } from '@/utils/banUtils';

interface UseBanStatusResult {
  banStatus: BanStatus;
  isLoading: boolean;
  banMessage: string;
  canAccess: (feature: 'forum' | 'submissions' | 'tipping' | 'marketplace') => boolean;
}

export function useBanStatus(): UseBanStatusResult {
  const { user } = useAuth();
  const [banStatus, setBanStatus] = useState<BanStatus>({ isBanned: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBanStatus({ isBanned: false });
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const status = await checkUserBanStatus(user.id);
        setBanStatus(status);
      } catch (error) {
        console.error('Error checking ban status:', error);
        setBanStatus({ isBanned: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  const banMessage = getBanMessage(banStatus);

  const canAccess = (feature: 'forum' | 'submissions' | 'tipping' | 'marketplace') => {
    if (!banStatus.isBanned) return true;
    
    // For now, all banned users are restricted from all features
    // You can implement more granular restrictions here
    return false;
  };

  return {
    banStatus,
    isLoading,
    banMessage,
    canAccess
  };
}
