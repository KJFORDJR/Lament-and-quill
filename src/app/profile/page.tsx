'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Package, 
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/phoneUtils';

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  city_affiliation: string;
  user_role: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    merchandise: Array<{
      title: string;
      category: string;
    }>;
  }>;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState<{
    is_subscribed: boolean;
    preferences: {
      new_posts: boolean;
      newsletters: boolean;
      announcements: boolean;
    };
  } | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    display_name: '',
    email: '',
    phone_number: '',
    bio: '',
    city_affiliation: 'neutral',
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States'
    }
  });

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchProfile();
    fetchUserOrders();
    fetchNewsletterSubscription();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Get email from Supabase auth
      const profileData = {
        ...data,
        email: user.email || ''
      };

      setProfile(profileData);
      
      // Initialize edit form
      setEditForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        username: profileData.username || '',
        display_name: profileData.display_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        bio: profileData.bio || '',
        city_affiliation: profileData.city_affiliation || 'neutral',
        shipping_address: profileData.shipping_address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'United States'
        }
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          created_at,
          order_items!inner (
            quantity,
            merchandise!inner (
              title,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data as Order[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchNewsletterSubscription = async () => {
    if (!user) return;

    try {
      // Use API endpoint instead of direct Supabase client to avoid RLS issues
      const response = await fetch(`/api/newsletter/subscription?user_id=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        const subscription = data.subscription;
        
        if (subscription) {
          setNewsletterSubscription({
            is_subscribed: subscription.is_subscribed,
            preferences: subscription.preferences || {
              new_posts: true,
              newsletters: true,
              announcements: true
            }
          });
        } else {
          // No subscription found, set default state
          setNewsletterSubscription({
            is_subscribed: false,
            preferences: {
              new_posts: true,
              newsletters: true,
              announcements: true
            }
          });
        }
      } else {
        console.error('Failed to fetch newsletter subscription:', await response.text());
        // Set default state on error
        setNewsletterSubscription({
          is_subscribed: false,
          preferences: {
            new_posts: true,
            newsletters: true,
            announcements: true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching newsletter subscription:', error);
      // Set default state on error
      setNewsletterSubscription({
        is_subscribed: false,
        preferences: {
          new_posts: true,
          newsletters: true,
          announcements: true
        }
      });
    }
  };

  const handleNewsletterUpdate = async (isActive: boolean, preferences?: any) => {
    if (!user) return;

    try {
      if (isActive) {
        // Subscribe/Update preferences
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
            preferences: preferences || newsletterSubscription?.preferences
          }),
        });

        if (response.ok) {
          setNewsletterSubscription({
            is_subscribed: true,
            preferences: preferences || newsletterSubscription?.preferences || {
              new_posts: true,
              newsletters: true,
              announcements: true
            }
          });
        } else {
          const error = await response.json();
          console.error('Newsletter subscription error:', error);
        }
      } else {
        // Unsubscribe
        const response = await fetch(`/api/newsletter/subscribe?user_id=${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNewsletterSubscription({
            is_subscribed: false,
            preferences: newsletterSubscription?.preferences || {
              new_posts: true,
              newsletters: true,
              announcements: true
            }
          });
        } else {
          const error = await response.json();
          console.error('Newsletter unsubscribe error:', error);
        }
      }
    } catch (error) {
      console.error('Error updating newsletter subscription:', error);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          username: editForm.username,
          display_name: editForm.display_name,
          phone_number: unformatPhoneNumber(editForm.phone_number),
          bio: editForm.bio,
          city_affiliation: editForm.city_affiliation,
          shipping_address: editForm.shipping_address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email in Supabase auth if changed
      if (editForm.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editForm.email
        });

        if (emailError) {
          console.error('Email update error:', emailError);
          alert('Profile updated, but email change requires verification. Check your inbox.');
        }
      }

      // Refresh profile data
      await fetchProfile();
      setEditing(false);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid' && status === 'delivered') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">Delivered</span>;
    } else if (paymentStatus === 'paid' && status === 'shipped') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-600 text-white">Shipped</span>;
    } else if (paymentStatus === 'paid') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-600 text-white">Processing</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-600 text-white">Payment Pending</span>;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Profile not found</div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-gothic font-bold text-gothic-silver mb-2">
                User Profile
              </h1>
              <p className="text-gothic-steel">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {profile.user_role === 'admin' && (
                <Link href="/admin">
                  <div className="cyber-button-secondary flex items-center space-x-2">
                    <Shield size={16} />
                    <span>Admin Panel</span>
                  </div>
                </Link>
              )}
              <button
                onClick={() => setShowOrders(!showOrders)}
                className="cyber-button flex items-center space-x-2"
              >
                <Package size={16} />
                <span>{showOrders ? 'Hide' : 'Show'} Orders</span>
                {showOrders ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="gothic-container p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">
                Profile Information
              </h2>
              <button
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="cyber-button-secondary flex items-center space-x-2"
              >
                {editing ? <X size={16} /> : <Edit size={16} />}
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.first_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.last_name || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="text-gothic-steel">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Display Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="Enter display name"
                  />
                ) : (
                  <p className="text-gothic-steel">{profile.display_name || profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="text-gothic-steel">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setEditForm({ ...editForm, phone_number: formatted });
                    }}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="(555) 123-4567"
                    maxLength={14}
                  />
                ) : (
                  <p className="text-gothic-steel">
                    {profile.phone_number ? formatPhoneNumber(profile.phone_number) : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  City Affiliation
                </label>
                {editing ? (
                  <select
                    value={editForm.city_affiliation}
                    onChange={(e) => setEditForm({ ...editForm, city_affiliation: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="crimson">Crimson City</option>
                    <option value="silver">Silver Heights</option>
                  </select>
                ) : (
                  <p className="text-gothic-steel capitalize">
                    {profile.city_affiliation === 'crimson' ? 'Crimson City' :
                     profile.city_affiliation === 'silver' ? 'Silver Heights' : 'Neutral'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gothic-steel">{profile.bio || 'No bio set'}</p>
                )}
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cyber-button w-full flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="gothic-container p-6"
          >
            <div className="flex items-center mb-6">
              <MapPin className="text-gothic-silver mr-3" size={24} />
              <h2 className="text-xl font-gothic font-bold text-gothic-silver">
                Shipping Address
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gothic-silver mb-2">
                  Street Address
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.shipping_address.street}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      shipping_address: { ...editForm.shipping_address, street: e.target.value }
                    })}
                    className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    placeholder="Enter street address"
                  />
                ) : (
                  <p className="text-gothic-steel">{profile.shipping_address?.street || 'Not set'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    City
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.shipping_address.city}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        shipping_address: { ...editForm.shipping_address, city: e.target.value }
                      })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.shipping_address?.city || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    State
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.shipping_address.state}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        shipping_address: { ...editForm.shipping_address, state: e.target.value }
                      })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter state"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.shipping_address?.state || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Postal Code
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.shipping_address.postal_code}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        shipping_address: { ...editForm.shipping_address, postal_code: e.target.value }
                      })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter postal code"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.shipping_address?.postal_code || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Country
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.shipping_address.country}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        shipping_address: { ...editForm.shipping_address, country: e.target.value }
                      })}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                      placeholder="Enter country"
                    />
                  ) : (
                    <p className="text-gothic-steel">{profile.shipping_address?.country || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders Section */}
        {showOrders && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 gothic-container p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Package className="text-gothic-silver mr-3" size={24} />
                <h2 className="text-xl font-gothic font-bold text-gothic-silver">
                  Your Orders ({orders.length})
                </h2>
              </div>
              <Link href="/orders">
                <div className="cyber-button-secondary">View All Orders</div>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="text-gothic-steel mx-auto mb-4" />
                <p className="text-gothic-steel mb-4">No orders found</p>
                <Link href="/merchandise">
                  <div className="cyber-button inline-block">Browse Products</div>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border border-gothic-dark-gray rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gothic-silver">
                          Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-gothic-steel">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gothic-silver">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        {getStatusBadge(order.status, order.payment_status)}
                      </div>
                    </div>
                    <div className="text-sm text-gothic-steel">
                      {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                      {order.order_items.length > 0 && order.order_items[0].merchandise.length > 0 && (
                        <span> • {order.order_items[0].merchandise[0].title}
                          {order.order_items.length > 1 && ` and ${order.order_items.length - 1} more`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/orders">
                      <div className="cyber-button-secondary">View All {orders.length} Orders</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Newsletter Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 gothic-container p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Mail className="text-gothic-silver mr-3" size={24} />
              <div>
                <h2 className="text-xl font-gothic font-bold text-gothic-silver">
                  Newsletter Preferences
                </h2>
                <p className="text-sm text-gothic-steel">
                  Stay informed about new chronicles and announcements
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Newsletter Toggle */}
            <div className="flex items-center justify-between p-4 bg-gothic-charcoal/30 rounded-lg border border-gothic-dark-gray">
              <div>
                <h3 className="text-gothic-silver font-medium">Newsletter Subscription</h3>
                <p className="text-sm text-gothic-steel">
                  Receive updates from both Silver Heights and Crimson Vale
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterSubscription?.is_subscribed || false}
                  onChange={(e) => handleNewsletterUpdate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gothic-dark-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gothic-crimson/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gothic-crimson"></div>
              </label>
            </div>

            {/* Preference Details (only show if subscribed) */}
            {newsletterSubscription?.is_subscribed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pl-4 border-l-2 border-gothic-crimson/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gothic-silver text-sm">New Posts & Updates</p>
                    <p className="text-xs text-gothic-steel">Be notified when new content is published</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletterSubscription.preferences.new_posts}
                    onChange={(e) => {
                      const newPrefs = {
                        ...newsletterSubscription.preferences,
                        new_posts: e.target.checked
                      };
                      handleNewsletterUpdate(true, newPrefs);
                    }}
                    className="w-4 h-4 text-gothic-crimson bg-gothic-charcoal border-gothic-dark-gray rounded focus:ring-gothic-crimson focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gothic-silver text-sm">Official Newsletters</p>
                    <p className="text-xs text-gothic-steel">Monthly newsletters from the chroniclers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletterSubscription.preferences.newsletters}
                    onChange={(e) => {
                      const newPrefs = {
                        ...newsletterSubscription.preferences,
                        newsletters: e.target.checked
                      };
                      handleNewsletterUpdate(true, newPrefs);
                    }}
                    className="w-4 h-4 text-gothic-crimson bg-gothic-charcoal border-gothic-dark-gray rounded focus:ring-gothic-crimson focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gothic-silver text-sm">Important Announcements</p>
                    <p className="text-xs text-gothic-steel">Site updates and important news</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletterSubscription.preferences.announcements}
                    onChange={(e) => {
                      const newPrefs = {
                        ...newsletterSubscription.preferences,
                        announcements: e.target.checked
                      };
                      handleNewsletterUpdate(true, newPrefs);
                    }}
                    className="w-4 h-4 text-gothic-crimson bg-gothic-charcoal border-gothic-dark-gray rounded focus:ring-gothic-crimson focus:ring-2"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 gothic-container p-6"
        >
          <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gothic-steel">Member Since</p>
              <p className="text-gothic-silver">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gothic-steel">Account Type</p>
              <p className="text-gothic-silver capitalize">{profile.user_role}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
