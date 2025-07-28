'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Clock, Ban, Shield } from 'lucide-react';

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (banData: BanData) => void;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface BanData {
  banType: 'temporary' | 'permanent' | 'shadowban';
  reason: string;
  durationDays?: number;
  restrictions: string[];
}

export function BanUserModal({ isOpen, onClose, onConfirm, user }: BanUserModalProps) {
  const [banType, setBanType] = useState<'temporary' | 'permanent' | 'shadowban'>('temporary');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [restrictions, setRestrictions] = useState<string[]>(['forum', 'submissions', 'tipping']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Please provide a reason for the ban');
      return;
    }

    const banData: BanData = {
      banType,
      reason: reason.trim(),
      restrictions
    };

    if (banType === 'temporary') {
      banData.durationDays = durationDays;
    }

    onConfirm(banData);
    onClose();
  };

  const toggleRestriction = (restriction: string) => {
    setRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-gothic-black border border-red-500 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-500" size={24} />
            <h3 className="text-xl font-bold text-red-500">Ban User</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gothic-steel hover:text-gothic-silver transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gothic-charcoal/50 p-4 rounded-lg mb-6 border border-gothic-dark-gray/30">
          <h4 className="text-gothic-silver font-medium mb-2">Target User</h4>
          <div className="text-gothic-steel text-sm space-y-1">
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>ID:</strong> {user.id}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ban Type Selection */}
          <div>
            <label className="block text-gothic-silver font-medium mb-3">Ban Type</label>
            <div className="space-y-3">
              <label className="flex items-center text-gothic-silver cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="banType"
                  value="temporary"
                  checked={banType === 'temporary'}
                  onChange={(e) => setBanType(e.target.value as 'temporary')}
                  className="mr-3 text-red-500"
                />
                <Clock className="mr-2" size={16} />
                <span>Temporary Ban (specify duration)</span>
              </label>
              
              <label className="flex items-center text-gothic-silver cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="banType"
                  value="permanent"
                  checked={banType === 'permanent'}
                  onChange={(e) => setBanType(e.target.value as 'permanent')}
                  className="mr-3 text-red-500"
                />
                <Ban className="mr-2" size={16} />
                <span>Permanent Ban (indefinite)</span>
              </label>
              
              <label className="flex items-center text-gothic-silver cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="banType"
                  value="shadowban"
                  checked={banType === 'shadowban'}
                  onChange={(e) => setBanType(e.target.value as 'shadowban')}
                  className="mr-3 text-red-500"
                />
                <Shield className="mr-2" size={16} />
                <span>Shadow Ban (hidden restrictions)</span>
              </label>
            </div>
          </div>

          {/* Duration for Temporary Bans */}
          {banType === 'temporary' && (
            <div>
              <label className="block text-gothic-silver font-medium mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full bg-gothic-charcoal border border-gothic-dark-gray text-gothic-silver p-3 rounded-md focus:outline-none focus:border-red-500"
                placeholder="Number of days"
              />
            </div>
          )}

          {/* Restrictions */}
          <div>
            <label className="block text-gothic-silver font-medium mb-3">Restrictions</label>
            <div className="space-y-2">
              {[
                { id: 'forum', label: 'Forum Access' },
                { id: 'submissions', label: 'Content Submission' },
                { id: 'tipping', label: 'Tipping System' },
                { id: 'marketplace', label: 'Marketplace Access' }
              ].map(restriction => (
                <label 
                  key={restriction.id}
                  className="flex items-center text-gothic-silver cursor-pointer hover:text-white transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={restrictions.includes(restriction.id)}
                    onChange={() => toggleRestriction(restriction.id)}
                    className="mr-3 text-red-500"
                  />
                  <span>{restriction.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gothic-silver font-medium mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Provide a detailed reason for this ban (required for audit trail)..."
              className="w-full bg-gothic-charcoal border border-gothic-dark-gray text-gothic-silver p-3 rounded-md focus:outline-none focus:border-red-500 resize-vertical"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gothic-steel mt-1">
              {reason.length}/500 characters
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-sm text-gothic-silver">
                <strong className="text-red-500">Warning:</strong> This action will immediately prevent 
                the user from accessing restricted features. {banType === 'permanent' 
                  ? 'Permanent bans cannot be automatically lifted.' 
                  : banType === 'temporary' 
                    ? `This ban will automatically expire after ${durationDays} day${durationDays !== 1 ? 's' : ''}.`
                    : 'Shadow bans hide restrictions from the user.'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gothic-dark-gray hover:bg-gothic-charcoal text-gothic-silver py-3 px-4 rounded-md transition-colors border border-gothic-dark-gray/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors font-medium"
            >
              Ban User
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
