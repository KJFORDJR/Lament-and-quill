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
  ads_enabled: boolean;
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
    ads_enabled: false,
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
  const [smtpTesting, setSMTPTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (user) {
      loadSystemConfig();
    }
  }, [user]);

  const loadSystemConfig = async () => {
    setLoading(true);
    try {
      // Try to load from a system_config table, or use defaults
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();

      console.log('Loading system config - data:', data, 'error:', error);

      if (data && !error) {
        // Ensure ads_enabled is set, default to false if missing
        const configWithAds = {
          ...data,
          ads_enabled: data.ads_enabled !== undefined ? data.ads_enabled : false
        };
        setConfig(configWithAds);
        console.log('Config loaded:', configWithAds);
      } else {
        console.log('No system config found, using defaults');
      }
    } catch (error) {
      console.log('Error loading system config:', error);
      console.log('Using default configuration');
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

      console.log('Saving config data:', configData);

      // First try to get existing config
      const { data: existingConfigs, error: fetchError } = await supabase
        .from('system_config')
        .select('*');

      if (fetchError) {
        console.error('Error fetching existing config:', fetchError);
        throw fetchError;
      }

      console.log('Existing configs found:', existingConfigs);

      if (existingConfigs && existingConfigs.length > 0) {
        // Update the first (and should be only) config record
        const configId = existingConfigs[0].id;
        console.log('Updating config with ID:', configId);
        
        const { error: updateError } = await supabase
          .from('system_config')
          .update(configData)
          .eq('id', configId);
        
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        
        console.log('Config updated successfully');
      } else {
        // Insert new config
        console.log('Inserting new config...');
        const { error: insertError } = await supabase
          .from('system_config')
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        
        console.log('Config inserted successfully');
      }

      // Verify the save worked by fetching the data again
      const { data: verifyConfig, error: verifyError } = await supabase
        .from('system_config')
        .select('marketplace_enabled')
        .single();
      
      if (!verifyError && verifyConfig) {
        console.log('Verification - Marketplace enabled:', verifyConfig.marketplace_enabled);
      }

      alert('System settings saved successfully! Note: Some changes may take up to 30 seconds to take effect site-wide.');
    } catch (error) {
      console.error('Error saving system config:', error);
      alert(`Failed to save system settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testSMTPConnection = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setSMTPTesting(true);
    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: testEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Resend SMTP test successful!\n\nEmail sent to: ${testEmail}\nProvider: ${result.provider}\nMessage ID: ${result.messageId}`);
      } else {
        alert(`❌ SMTP test failed:\n\n${result.error}\n\nProvider: ${result.provider || 'Unknown'}`);
      }
    } catch (error) {
      console.error('SMTP test error:', error);
      alert('❌ SMTP test failed: Network error');
    } finally {
      setSMTPTesting(false);
    }
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gothic-crimson"></div>
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gothic-silver font-medium">Google AdSense</div>
                  <div className="text-sm text-gothic-steel">Enable advertising revenue system</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.ads_enabled}
                    onChange={(e) => handleInputChange('ads_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
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
            
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
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
                  <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {/* Resend SMTP Configuration */}
              <div className="bg-gothic-charcoal/30 border border-gothic-crimson/30 rounded-lg p-6">
                <h3 className="text-lg font-gothic text-gothic-crimson mb-4 flex items-center gap-2">
                  <Mail className="text-gothic-crimson" size={20} />
                  Resend SMTP Configuration
                </h3>
                
                <div className="space-y-4">
                  {/* Current Configuration Display */}
                  <div className="bg-gothic-dark-gray/50 border border-gothic-steel/30 rounded-lg p-4">
                    <h4 className="text-gothic-silver font-bold mb-3">Current Resend Settings:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gothic-steel">SMTP Host:</span>
                        <span className="text-gothic-silver font-mono">smtp.resend.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gothic-steel">SMTP Port:</span>
                        <span className="text-gothic-silver font-mono">587</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gothic-steel">Security:</span>
                        <span className="text-gothic-silver font-mono">STARTTLS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gothic-steel">Provider:</span>
                        <span className="text-gothic-crimson font-mono">Resend</span>
                      </div>
                    </div>
                  </div>

                  {/* Test SMTP Section */}
                  <div className="bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-lg p-4">
                    <h4 className="text-gothic-silver font-medium mb-3 flex items-center gap-2">
                      <Mail size={16} />
                      Test Resend SMTP Configuration
                    </h4>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Enter test email address"
                          className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-crimson"
                        />
                      </div>
                      <button
                        onClick={testSMTPConnection}
                        disabled={smtpTesting || !testEmail}
                        className="cyber-button flex items-center space-x-2 whitespace-nowrap disabled:opacity-50"
                      >
                        <Mail size={16} />
                        <span>{smtpTesting ? 'Testing...' : 'Test Resend'}</span>
                      </button>
                    </div>
                    <p className="text-sm text-gothic-steel mt-2">
                      This will send a branded test email to verify your Resend SMTP configuration.
                    </p>
                  </div>

                  {/* Resend Benefits */}
                  <div className="bg-gothic-dark-gray/20 border border-gothic-silver/20 rounded-lg p-4">
                    <h4 className="text-gothic-silver font-bold mb-3">Resend Advantages:</h4>
                    <ul className="text-gothic-steel text-sm space-y-1">
                      <li>• <span className="text-gothic-crimson">3,000 emails/month</span> free tier</li>
                      <li>• <span className="text-gothic-crimson">99.9% uptime SLA</span> guaranteed</li>
                      <li>• <span className="text-gothic-crimson">Superior deliverability</span> rates</li>
                      <li>• <span className="text-gothic-crimson">Real-time analytics</span> and tracking</li>
                      <li>• <span className="text-gothic-crimson">Custom domains</span> supported</li>
                      <li>• <span className="text-gothic-crimson">Modern API</span> integration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Legacy SMTP Fields (for reference/backup) */}
              <details className="bg-gothic-dark-gray/10 border border-gothic-steel/20 rounded-lg">
                <summary className="cursor-pointer p-4 text-gothic-steel hover:text-gothic-silver">
                  Legacy SMTP Configuration (Backup/Reference)
                </summary>
                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={config.smtp_host || ''}
                      onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="smtp.resend.com"
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
              </details>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
