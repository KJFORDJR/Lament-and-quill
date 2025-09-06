'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  Mail,
  Calendar,
  MapPin,
  Phone,
  ChevronDown,
  Ban,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { BanUserModal } from '@/components/BanUserModal';

interface User {
  id: string;
  username: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  city_affiliation: string;
  user_role: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  shipping_address?: any;
  is_banned?: boolean;
  banned_at?: string;
  ban_reason?: string;
  ban_expires_at?: string;
  ban_type?: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: sortBy === 'oldest' });

      if (error) throw error;

      console.log('Fetched users count:', data?.length || 0); // Debug log - count only
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userRole: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, user_role: newRole } : u));
      setDropdownOpen(null); // Close dropdown after action
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const banUser = async (user: User) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const handleBanConfirm = async (banData: any) => {
    if (!selectedUser || !user) return;

    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          bannedBy: user.id,
          ...banData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      // Refresh users list
      await fetchUsers();
      alert(`User ${selectedUser.username} has been banned successfully`);
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setSelectedUser(null);
    }
  };

  const unbanUser = async (userId: string) => {
    if (!user) return;
    
    if (confirm('Are you sure you want to unban this user?')) {
      try {
        const response = await fetch('/api/admin/users/ban', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            unbannedBy: user.id,
            reason: 'Manual unban by admin'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to unban user');
        }

        // Refresh users list
        await fetchUsers();
        alert('User has been unbanned successfully');
      } catch (error) {
        console.error('Error unbanning user:', error);
        alert('Failed to unban user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.user_role === roleFilter;
    const matchesCity = cityFilter === 'all' || user.city_affiliation === cityFilter;

    return matchesSearch && matchesRole && matchesCity;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-gothic-crimson';
      case 'moderator': return 'text-yellow-400';
      case 'banned': return 'text-red-500';
      default: return 'text-gothic-silver';
    }
  };

  const getCityColor = (city: string) => {
    switch (city) {
      case 'crimson': return 'text-gothic-crimson';
      case 'silver': return 'text-gothic-silver';
      default: return 'text-gothic-steel';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
                  User Management
                </h1>
                <p className="text-gothic-steel">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gothic-steel">
                <Users size={16} />
                <span>{filteredUsers.length} of {users.length} users</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="all">All Cities</option>
              <option value="neutral">Neutral</option>
              <option value="crimson">Crimson City</option>
              <option value="silver">Silver Heights</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gothic-container p-6 rounded-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gothic-dark-gray">
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">Contact</th>
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">City</th>
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gothic-silver font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData, index) => (
                  <motion.tr
                    key={userData.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gothic-dark-gray/50 hover:bg-gothic-charcoal/20"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-gothic-silver">
                            {userData.display_name || userData.username}
                          </div>
                          {userData.is_banned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              <Ban size={10} className="mr-1" />
                              {userData.ban_type === 'temporary' ? 'Temp Ban' : 
                               userData.ban_type === 'shadowban' ? 'Shadow Ban' : 'Banned'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gothic-steel">@{userData.username}</div>
                        {(userData.first_name || userData.last_name) && (
                          <div className="text-xs text-gothic-steel/70">
                            {userData.first_name} {userData.last_name}
                          </div>
                        )}
                        {userData.is_banned && userData.ban_expires_at && (
                          <div className="text-xs text-red-400 flex items-center mt-1">
                            <Clock size={10} className="mr-1" />
                            Expires: {new Date(userData.ban_expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gothic-steel">
                          <Mail size={12} className="mr-2" />
                          {userData.email || 'N/A'}
                        </div>
                        {userData.phone_number && (
                          <div className="flex items-center text-sm text-gothic-steel">
                            <Phone size={12} className="mr-2" />
                            {formatPhoneNumber(userData.phone_number)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={userData.user_role}
                        onChange={(e) => updateUserRole(userData.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-md border border-gothic-dark-gray bg-gothic-charcoal/50 ${getRoleColor(userData.user_role)}`}
                        disabled={userData.user_role === 'banned'}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        {userData.user_role === 'banned' && <option value="banned">Banned</option>}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCityColor(userData.city_affiliation)}`}>
                        {userData.city_affiliation === 'crimson' ? 'Crimson City' :
                         userData.city_affiliation === 'silver' ? 'Silver Heights' : 'Neutral'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gothic-steel">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === userData.id ? null : userData.id)}
                          className="p-2 text-gothic-steel hover:text-gothic-silver transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {dropdownOpen === userData.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gothic-charcoal border border-gothic-dark-gray rounded-md shadow-lg z-10">
                            <div className="py-1">
                              {userData.user_role !== 'banned' && !userData.is_banned ? (
                                <button
                                  onClick={() => banUser(userData)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gothic-dark-gray transition-colors"
                                >
                                  <Ban size={16} className="mr-2" />
                                  Ban User
                                </button>
                              ) : (
                                <button
                                  onClick={() => unbanUser(userData.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-400 hover:bg-gothic-dark-gray transition-colors"
                                >
                                  <UserCheck size={16} className="mr-2" />
                                  Unban User
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(userData.id);
                                  alert('User ID copied to clipboard');
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gothic-steel hover:bg-gothic-dark-gray transition-colors"
                              >
                                <Shield size={16} className="mr-2" />
                                Copy User ID
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel">No users found matching your criteria</p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div className="gothic-container p-4 text-center">
            <div className="text-2xl font-bold text-gothic-silver mb-2">
              {users.filter(u => u.user_role === 'admin').length}
            </div>
            <div className="text-sm text-gothic-crimson">Administrators</div>
          </div>
          <div className="gothic-container p-4 text-center">
            <div className="text-2xl font-bold text-gothic-silver mb-2">
              {users.filter(u => u.user_role === 'moderator').length}
            </div>
            <div className="text-sm text-yellow-400">Moderators</div>
          </div>
          <div className="gothic-container p-4 text-center border border-red-500/30">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {users.filter(u => u.is_banned).length}
            </div>
            <div className="text-sm text-red-400 flex items-center justify-center">
              <Ban size={14} className="mr-1" />
              Banned Users
            </div>
          </div>
          <div className="gothic-container p-4 text-center">
            <div className="text-2xl font-bold text-gothic-silver mb-2">
              {users.filter(u => u.city_affiliation === 'crimson').length}
            </div>
            <div className="text-sm text-gothic-crimson">Crimson City</div>
          </div>
          <div className="gothic-container p-4 text-center">
            <div className="text-2xl font-bold text-gothic-silver mb-2">
              {users.filter(u => u.city_affiliation === 'silver').length}
            </div>
            <div className="text-sm text-gothic-silver">Silver Heights</div>
          </div>
        </motion.div>
      </div>

      {/* Ban User Modal */}
      {selectedUser && (
        <BanUserModal
          isOpen={banModalOpen}
          onClose={() => {
            setBanModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleBanConfirm}
          user={{
            id: selectedUser.id,
            username: selectedUser.username,
            email: selectedUser.email || 'N/A'
          }}
        />
      )}
    </div>
  );
}
