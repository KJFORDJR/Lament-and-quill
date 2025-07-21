'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Settings, AlertTriangle } from 'lucide-react';

export default function MarketplaceMaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gothic-black via-gothic-dark-gray to-gothic-black flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-gothic-dark-gray/30 border border-gothic-red/30 rounded-lg backdrop-blur-sm p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.3 }}
            className="w-20 h-20 bg-gothic-crimson/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingBag className="w-10 h-10 text-gothic-crimson" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl font-gothic font-bold text-gothic-silver glow-text mb-4"
          >
            Marketplace Under Maintenance
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4 mb-8"
          >
            <p className="text-gothic-steel leading-relaxed">
              Black Ledger Goods is temporarily closed while we upgrade our 
              inventory systems and expand our catalog of dark artifacts.
            </p>
            
            <div className="bg-gothic-dark-gray/20 border border-gothic-crimson/20 rounded p-4">
              <div className="flex items-center justify-center text-gothic-steel text-sm mb-2">
                <Settings className="w-4 h-4 mr-2 text-gothic-crimson animate-spin" style={{ animationDuration: '2s' }} />
                <span className="font-medium">Inventory System Update</span>
              </div>
              <p className="text-gothic-steel/80 text-sm">
                We're adding new merchandise categories and improving the 
                shopping experience for citizens of both cities.
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-3"
          >
            <Link href="/dossier" className="block">
              <button className="w-full cyber-button flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Browse City Archives
              </button>
            </Link>
            
            <Link href="/" className="block">
              <button className="w-full cyber-button-secondary flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Return to Nexus
              </button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 pt-6 border-t border-gothic-crimson/20"
          >
            <p className="text-xs text-gothic-steel/70">
              The marketplace will reopen with enhanced features
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
