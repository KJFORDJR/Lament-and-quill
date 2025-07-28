import { supabase } from '@/lib/supabase';

export interface BanStatus {
  isBanned: boolean;
  banType?: 'temporary' | 'permanent' | 'shadowban';
  reason?: string;
  expiresAt?: string;
  bannedAt?: string;
}

export async function checkUserBanStatus(userId: string): Promise<BanStatus> {
  try {
    // First check if user has expired temporary ban and auto-unban
    await supabase.rpc('check_and_unban_expired_users');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_banned, ban_type, ban_reason, ban_expires_at, banned_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking ban status:', error);
      return { isBanned: false };
    }

    if (profile?.is_banned) {
      return {
        isBanned: true,
        banType: profile.ban_type as 'temporary' | 'permanent' | 'shadowban',
        reason: profile.ban_reason,
        expiresAt: profile.ban_expires_at,
        bannedAt: profile.banned_at
      };
    }

    return { isBanned: false };
  } catch (error) {
    console.error('Error in checkUserBanStatus:', error);
    return { isBanned: false };
  }
}

export function getBanMessage(banStatus: BanStatus): string {
  if (!banStatus.isBanned) return '';

  const messages = {
    permanent: "Your soul has been cast into the void. Access denied indefinitely.",
    temporary: "The shadows have claimed you temporarily. Return when the darkness lifts.",
    shadowban: "Something feels... different. The digital realm seems less responsive."
  };

  let message = messages[banStatus.banType || 'permanent'];

  if (banStatus.banType === 'temporary' && banStatus.expiresAt) {
    const expiryDate = new Date(banStatus.expiresAt);
    message += ` (Until: ${expiryDate.toLocaleDateString()})`;
  }

  if (banStatus.reason) {
    message += `\n\nReason: ${banStatus.reason}`;
  }

  return message;
}

export function canUserAccess(banStatus: BanStatus, feature: 'forum' | 'submissions' | 'tipping' | 'marketplace'): boolean {
  if (!banStatus.isBanned) return true;
  
  // For now, all banned users are restricted from all features
  // You can implement more granular restrictions here based on the ban data
  return false;
}
