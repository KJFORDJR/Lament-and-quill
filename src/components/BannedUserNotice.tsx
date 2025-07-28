'use client';

import { motion } from 'framer-motion';
import { Ban, Clock, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import type { BanStatus } from '@/utils/banUtils';

interface BannedUserNoticeProps {
  banStatus: BanStatus;
  featureName?: string;
}

export function BannedUserNotice({ banStatus, featureName = 'this feature' }: BannedUserNoticeProps) {
  if (!banStatus.isBanned) return null;

  const getBanIcon = () => {
    switch (banStatus.banType) {
      case 'temporary':
        return <Clock size={48} className="text-red-500" />;
      case 'shadowban':
        return <AlertTriangle size={48} className="text-red-500" />;
      default:
        return <Ban size={48} className="text-red-500" />;
    }
  };

  const getBanTitle = () => {
    switch (banStatus.banType) {
      case 'temporary':
        return 'Temporary Restriction';
      case 'shadowban':
        return 'Access Limitation';
      default:
        return 'Access Denied';
    }
  };

  const getBanDescription = () => {
    switch (banStatus.banType) {
      case 'temporary':
        return `Your access to ${featureName} has been temporarily restricted. This limitation will be lifted automatically.`;
      case 'shadowban':
        return `Your interaction with ${featureName} is currently limited. Some features may not respond as expected.`;
      default:
        return `You no longer have access to ${featureName}. This restriction is indefinite.`;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gothic-black text-gothic-silver flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          {getBanIcon()}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold text-red-500 mb-4"
        >
          {getBanTitle()}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gothic-steel mb-6 leading-relaxed"
        >
          {getBanDescription()}
        </motion.p>

        {/* Expiry Information for Temporary Bans */}
        {banStatus.banType === 'temporary' && banStatus.expiresAt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gothic-charcoal/50 p-4 rounded-lg border border-gothic-dark-gray/30 mb-6"
          >
            <div className="flex items-center justify-center space-x-2 text-gothic-silver">
              <Clock size={16} />
              <span className="text-sm">
                <strong>Restriction expires:</strong> {formatExpiryDate(banStatus.expiresAt)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Reason */}
        {banStatus.reason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-6"
          >
            <h3 className="text-sm font-medium text-red-400 mb-2">Reason for Restriction:</h3>
            <p className="text-xs text-gothic-steel">{banStatus.reason}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-3"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-gothic-charcoal hover:bg-gothic-dark-gray text-gothic-silver py-3 px-6 rounded-md transition-colors border border-gothic-dark-gray/50"
          >
            <Home size={16} className="mr-2" />
            Return to Homepage
          </Link>

          {banStatus.banType === 'temporary' && (
            <p className="text-xs text-gothic-steel">
              You may continue using other features of the platform during this restriction period.
            </p>
          )}
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-gothic-dark-gray/30"
        >
          <p className="text-xs text-gothic-steel">
            If you believe this restriction was applied in error, please contact the administrators 
            through the official channels.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
