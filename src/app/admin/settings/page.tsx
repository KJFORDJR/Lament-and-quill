'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  Database, 
  Shield, 
  Globe, 
  Mail, 
  Bell,
  Lock,
  Key,
  Server,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SystemConfig {
  id?: string;
  site_title: string;
  site_description: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  forum_enabled: boolean;
  marketplace_enabled: boolean;
  email_notifications: boolean;
  max_file_size: number;
  session_timeout: number;
  backup_frequency: string;
  admin_email: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  analytics_enabled: boolean;
  debug_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig>({
    site_title: 'Lament and Quill',
    site_description: 'Two cities. Two Ghosts. One reckoning.',
    maintenance_mode: false,
    registration_enabled: true,
    forum_enabled: true,
    marketplace_enabled: true,
    email_notifications: true,
    max_file_size: 5,
    session_timeout: 30,
    backup_frequency: 'daily',
    admin_email: '',
    analytics_enabled: true,
    debug_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSMTPPassword, setShowSMTPPassword] = useState(false);

  useEffect(() => {
    if (user) {
      loadSystemConfig();
    }
  }, [user]);

  const loadSystemConfig = async () => {
    try {
      // Try to load from a system_config table, or use defaults
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();

      if (data && !error) {
        setConfig(data);
      }
    } catch (error) {
      console.log('No system config found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const saveSystemConfig = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const configData = {
        ...config,
        updated_at: new Date().toISOString()
      };

      // First try to update existing config
      const { data: existingConfig } = await supabase
        .from('system_config')
        .select('id')
        .single();

      if (existingConfig) {
        const { error } = await supabase
          .from('system_config')
          .update(configData)
          .eq('id', existingConfig.id);
        
        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase
          .from('system_config')
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      alert('System settings saved successfully!');
    } catch (error) {
      console.error('Error saving system config:', error);
      alert('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading system settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <button className="cyber-button-secondary flex items-center space-x-2">
                  <ArrowLeft size={16} />
                  <span>Back to Admin</span>
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-gothic font-bold text-gothic-silver">
                  System Settings
                </h1>
                <p className="text-gothic-steel">Configure system-wide settings and preferences</p>
              </div>
            </div>
            <button
              onClick={saveSystemConfig}
              disabled={saving}
              className="cyber-button flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save All'}</span>
            </button>
          </div>
          
          {/* Feature Status Notice */}
          <div className="bg-gothic-green/10 border border-gothic-green/30 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <Settings className="text-gothic-green mr-2" size={20} />
              <h3 className="text-gothic-green font-semibold">Feature Controls Active</h3>
            </div>
            <p className="text-gothic-steel text-sm">
              All feature toggles below are now fully functional and will immediately affect website behavior. 
              Changes are enforced by middleware and will redirect users to appropriate maintenance pages when features are disabled.
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gothic-container p-6 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <Globe className="text-gothic-silver mr-3" size={24} />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">General Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={config.site_title}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={config.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Site Description
                </label>
                <textarea
                  value={config.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={3}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
            </div>
          </motion.div>

          {/* Feature Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gothic-container p-6 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <Settings className="text-gothic-silver mr-3" size={24} />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">Feature Controls</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">Maintenance Mode</div>
                  <div className="text-sm text-gothic-steel">Disable site for maintenance</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.maintenance_mode}
                    onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gothic-crimson"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">User Registration</div>
                  <div className="text-sm text-gothic-steel">Allow new user signups</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.registration_enabled}
                    onChange={(e) => handleInputChange('registration_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">Forum System</div>
                  <div className="text-sm text-gothic-steel">Enable forum functionality</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.forum_enabled}
                    onChange={(e) => handleInputChange('forum_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">Marketplace</div>
                  <div className="text-sm text-gothic-steel">Enable e-commerce features</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.marketplace_enabled}
                    onChange={(e) => handleInputChange('marketplace_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Security & Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="gothic-container p-6 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <Shield className="text-gothic-silver mr-3" size={24} />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">Security & Performance</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={config.max_file_size}
                  onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value))}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={config.session_timeout}
                  onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Backup Frequency
                </label>
                <select
                  value={config.backup_frequency}
                  onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">Debug Mode</div>
                  <div className="text-sm text-gothic-steel">Enable debug logging</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.debug_mode}
                    onChange={(e) => handleInputChange('debug_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Email Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="gothic-container p-6 rounded-lg"
          >
            <div className="flex items-center mb-6">
              <Mail className="text-gothic-silver mr-3" size={24} />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">Email Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center justify-between mb-4">
                <div>
                  <div className="text-gothic-silver font-medium">Email Notifications</div>
                  <div className="text-sm text-gothic-steel">Send system email notifications</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.email_notifications}
                    onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={config.smtp_host || ''}
                  onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  placeholder="mail.example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={config.smtp_port || 587}
                  onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={config.smtp_username || ''}
                  onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                  className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showSMTPPassword ? 'text' : 'password'}
                    value={config.smtp_password || ''}
                    onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 pr-10 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSMTPPassword(!showSMTPPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gothic-steel hover:text-gothic-silver"
                  >
                    {showSMTPPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
