'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Crown, Cpu, Database, Users, Settings, ShoppingCart, Package, RefreshCw, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SystemStatus {
  activeUsers: number;
  totalUsers: number;
  recentActiveUsers: number;
  neuralConnections: number;
  uptimePercentage: number;
  metrics: {
    forumThreads: number;
    forumReplies: number;
    orders: number;
  };
  lastUpdated: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSystemStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/admin/system-status', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system status');
      }

      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
      // Fallback to placeholder data if fetch fails
      setSystemStatus({
        activeUsers: 0,
        totalUsers: 0,
        recentActiveUsers: 0,
        neuralConnections: 0,
        uptimePercentage: 0,
        metrics: { forumThreads: 0, forumReplies: 0, orders: 0 },
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSystemStatus();
    }
  }, [user, fetchSystemStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemStatus();
  };

  const adminSections = [
    {
      title: 'Crimson City Administration',
      description: 'Manage the blood-soaked chronicles and confessions of the Crimson Quarter',
      href: '/admin/crimson',
      theme: 'crimson',
      icon: Crown,
      features: ['Crimson Ledger Management', 'Blood Market Analytics', 'User Permissions', 'Chronicle Administration']
    },
    {
      title: 'Silver Heights Command',
      description: 'Neural network administration for the digital consciousness collective',
      href: '/admin/silver',
      theme: 'silver', 
      icon: Cpu,
      features: ['Lament Fragment Archives', 'Neural Report Processing', 'Convergence Protocols', 'Data Stream Monitoring']
    },
    {
      title: 'Black Ledger Goods',
      description: 'Comprehensive merchandise management for the gothic marketplace',
      href: '/admin/merchandise',
      theme: 'dark',
      icon: ShoppingCart,
      features: ['Product Management', 'Custom Badge Creation', 'Inventory Tracking', 'Price & Image Control']
    },
    {
      title: 'Order Management System',
      description: 'Complete order fulfillment and transaction oversight for marketplace operations',
      href: '/admin/orders',
      theme: 'orders',
      icon: Package,
      features: ['Order Processing', 'Payment Tracking', 'Customer Information', 'Fulfillment Status', 'Revenue Analytics']
    }
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield size={64} className="mx-auto text-gothic-silver mb-6" />
          <h1 className="text-5xl font-gothic font-bold text-gothic-silver glow-text mb-4">
            Administrative Interface
          </h1>
          <p className="text-gothic-steel text-xl max-w-3xl mx-auto">
            Central command center for managing both Crimson City&apos;s blood-soaked chronicles 
            and Silver Heights&apos; digital consciousness network.
          </p>
          <div className="mt-6 px-6 py-3 bg-gothic-crimson/10 border border-gothic-crimson/30 rounded-lg inline-block">
            <p className="text-gothic-crimson text-sm">
              <Shield size={16} className="inline mr-2" />
              Administrator privileges required for access
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 text-center"
        >
          <h3 className="text-lg font-gothic text-gothic-silver mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin/users" className="cyber-button px-4 py-2 text-sm">
              <Users size={16} className="mr-2" />
              User Management
            </Link>
            <Link href="/admin/settings" className="cyber-button px-4 py-2 text-sm">
              <Settings size={16} className="mr-2" />
              System Settings
            </Link>
            <Link href="/admin/analytics" className="cyber-button px-4 py-2 text-sm">
              <Database size={16} className="mr-2" />
              Analytics Dashboard
            </Link>
            <Link href="/admin/polls" className="cyber-button px-4 py-2 text-sm">
              <BarChart3 size={16} className="mr-2" />
              Poll Management
            </Link>
          </div>
        </motion.div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`${
                  section.theme === 'crimson' ? 'crimson-theme' : 
                  section.theme === 'silver' ? 'silver-theme' : 
                  section.theme === 'orders' ? 'gothic-container border-2 border-green-500/30' :
                  'gothic-container'
                } p-8 rounded-lg tech-border hover:border-opacity-70 transition-all group`}
              >
                <div className="mb-6">
                  <Icon size={48} className={`${
                    section.theme === 'crimson' ? 'text-gothic-crimson' : 
                    section.theme === 'silver' ? 'text-gothic-silver' : 
                    section.theme === 'orders' ? 'text-green-400' :
                    'text-gothic-steel'
                  } mb-4`} />
                  <h2 className={`text-2xl font-gothic font-bold ${
                    section.theme === 'crimson' ? 'text-gothic-crimson' : 
                    section.theme === 'silver' ? 'text-gothic-silver' : 
                    section.theme === 'orders' ? 'text-green-400' :
                    'text-gothic-steel'
                  } mb-2`}>
                    {section.title}
                  </h2>
                  <p className="text-gothic-steel leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <h3 className={`text-lg font-medium ${
                    section.theme === 'crimson' ? 'text-gothic-crimson' : 
                    section.theme === 'silver' ? 'text-gothic-silver' : 
                    section.theme === 'orders' ? 'text-green-400' :
                    'text-gothic-steel'
                  } mb-4`}>
                    Core Functions:
                  </h3>
                  <ul className="space-y-2">
                    {section.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gothic-steel">
                        <div className={`w-2 h-2 ${
                          section.theme === 'crimson' ? 'bg-gothic-crimson' : 
                          section.theme === 'silver' ? 'bg-gothic-silver' : 
                          section.theme === 'orders' ? 'bg-green-400' :
                          'bg-gothic-steel'
                        } rounded-full mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access Button */}
                <Link href={section.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 px-6 ${
                      section.theme === 'crimson' 
                        ? 'bg-gothic-crimson hover:bg-gothic-crimson/80' 
                        : section.theme === 'silver'
                        ? 'bg-gothic-silver hover:bg-gothic-silver/80'
                        : section.theme === 'orders'
                        ? 'bg-green-500 hover:bg-green-500/80'
                        : 'bg-gothic-steel hover:bg-gothic-steel/80'
                    } ${
                      section.theme === 'crimson' 
                        ? 'text-white' 
                        : section.theme === 'silver'
                        ? 'text-gothic-black'
                        : section.theme === 'orders'
                        ? 'text-white'
                        : 'text-white'
                    } rounded-md font-medium text-center transition-colors cursor-pointer`}
                  >
                    Access {
                      section.theme === 'crimson' ? 'Crimson' : 
                      section.theme === 'silver' ? 'Silver' : 
                      section.theme === 'orders' ? 'Order' :
                      'Merchandise'
                    } Administration
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 gothic-container p-8 rounded-lg tech-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-gothic font-bold text-gothic-silver flex items-center">
              <Database size={24} className="mr-3" />
              System Status
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="cyber-button-secondary flex items-center space-x-2 text-sm"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  systemStatus && systemStatus.uptimePercentage > 95 
                    ? 'bg-green-400' 
                    : systemStatus && systemStatus.uptimePercentage > 85
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}></div>
                <span className={`text-sm ${
                  systemStatus && systemStatus.uptimePercentage > 95 
                    ? 'text-green-400' 
                    : systemStatus && systemStatus.uptimePercentage > 85
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {systemStatus && systemStatus.uptimePercentage > 95 
                    ? 'All Systems Operational'
                    : systemStatus && systemStatus.uptimePercentage > 85
                    ? 'Systems Degraded'
                    : 'System Issues'
                  }
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-gothic-silver border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gothic-steel">Loading system status...</p>
            </div>
          ) : systemStatus ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gothic-crimson mb-2">
                    {systemStatus.activeUsers.toLocaleString()}
                  </div>
                  <div className="text-gothic-steel text-sm">Active Users (30d)</div>
                  <div className="text-xs text-gothic-steel/70 mt-1">
                    {systemStatus.recentActiveUsers} in last 24h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gothic-silver mb-2">
                    {systemStatus.neuralConnections.toLocaleString()}
                  </div>
                  <div className="text-gothic-steel text-sm">Neural Connections</div>
                  <div className="text-xs text-gothic-steel/70 mt-1">
                    Threads: {systemStatus.metrics.forumThreads} • 
                    Replies: {systemStatus.metrics.forumReplies} • 
                    Orders: {systemStatus.metrics.orders}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {systemStatus.uptimePercentage}%
                  </div>
                  <div className="text-gothic-steel text-sm">Network Uptime</div>
                  <div className="text-xs text-gothic-steel/70 mt-1">
                    Total users: {systemStatus.totalUsers}
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-gothic-steel/50">
                Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gothic-steel">Failed to load system status</p>
              <button
                onClick={handleRefresh}
                className="cyber-button mt-4 text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
