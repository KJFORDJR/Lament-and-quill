'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, Users, BarChart3, 
  Settings, MessageCircle, FileText, Shield, BookOpen, Database, X, User, Calendar, Clock, Megaphone 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';

interface CrimsonEntry {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface CrimsonSubmission {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: string;
  created_at: string;
  tips: any[];
  tipTotal?: number;
  profiles: { username: string };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    city_affiliation: string;
    user_role: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  user_role: string;
  city_affiliation: string;
  created_at: string;
}

interface DossierEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: 'character' | 'location' | 'event';
  city: 'crimson' | 'silver';
  classification: 'public' | 'confidential' | 'secret' | 'top-secret';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminCrimson() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [crimsonEntries, setCrimsonEntries] = useState<CrimsonEntry[]>([]);
  const [crimsonSubmissions, setCrimsonSubmissions] = useState<CrimsonSubmission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dossierEntries, setDossierEntries] = useState<DossierEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'tips'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showReadConfessionModal, setShowReadConfessionModal] = useState(false);
  
  // Dossier-specific modal states
  const [showDossierCreateModal, setShowDossierCreateModal] = useState(false);
  const [showDossierEditModal, setShowDossierEditModal] = useState(false);
  const [showDossierReadModal, setShowDossierReadModal] = useState(false);
  const [editingDossier, setEditingDossier] = useState<any>(null);
  const [readingDossier, setReadingDossier] = useState<any>(null);
  
  // Announcements modal states
  const [showAnnouncementCreateModal, setShowAnnouncementCreateModal] = useState(false);
  const [showAnnouncementEditModal, setShowAnnouncementEditModal] = useState(false);
  const [showAnnouncementReadModal, setShowAnnouncementReadModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [readingAnnouncement, setReadingAnnouncement] = useState<any>(null);
  
  const [readingEntry, setReadingEntry] = useState<CrimsonEntry | null>(null);
  const [readingConfession, setReadingConfession] = useState<CrimsonSubmission | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    author_name: 'Admin',
    category: 'Official Records'
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 0
  });
  const [newDossier, setNewDossier] = useState({
    title: '',
    summary: '',
    content: '',
    type: 'character' as 'character' | 'location' | 'event',
    city: 'crimson' as 'crimson' | 'silver',
    classification: 'public' as 'public' | 'confidential' | 'secret' | 'top-secret',
    is_published: true
  });

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Specific function to reload entries
  const reloadEntries = async () => {
    try {
      console.log('Reloading crimson entries via API...');
      
      const response = await fetch('/api/admin/crimson-entries');
      const result = await response.json();

      if (!response.ok) {
        console.error('Entry reload API error:', result);
        throw new Error(result.error || 'Failed to reload entries');
      }
      
      console.log('Entries reloaded via API:', result.data?.length || 0);
      setCrimsonEntries(result.data || []);
    } catch (err: any) {
      console.error('Error reloading entries:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load crimson entries for the ledger section
      if (activeTab === 'ledger') {
        console.log('Loading crimson entries via API...');
        
        const response = await fetch('/api/admin/crimson-entries');
        const result = await response.json();

        if (!response.ok) {
          console.error('Entry loading API error:', result);
          throw new Error(result.error || 'Failed to load entries');
        }
        
        console.log('Entries loaded via API:', result.data?.length || 0);
        setCrimsonEntries(result.data || []);
      }
      
      if (activeTab === 'confessions' || activeTab === 'dashboard') {
        console.log('Loading crimson confessions via API...');
        
        const response = await fetch('/api/admin/crimson-submissions');
        const result = await response.json();

        if (!response.ok) {
          console.error('Confessions loading API error:', result);
          throw new Error(result.error || 'Failed to load confessions');
        }

        console.log('Confessions loaded via API:', result.data?.length || 0);
        setCrimsonSubmissions(result.data || []);
      }
      
      if (activeTab === 'users') {
        console.log('Loading users via API...');
        
        const response = await fetch('/api/admin/users');
        const result = await response.json();

        if (!response.ok) {
          console.error('Users loading API error:', result);
          throw new Error(result.error || 'Failed to load users');
        }
        
        console.log('Users loaded via API:', result.data?.length || 0);
        setUsers(result.data || []);
      }

      if (activeTab === 'dossier') {
        console.log('Loading dossier entries via API...');
        
        const response = await fetch('/api/admin/dossier');
        const result = await response.json();

        if (!response.ok) {
          console.error('Dossier loading API error:', result);
          throw new Error(result.error || 'Failed to load dossier entries');
        }
        
        console.log('Dossier entries loaded via API:', result.data?.length || 0);
        setDossierEntries(result.data || []);
      }

      if (activeTab === 'announcements') {
        console.log('Loading announcements via API...');
        
        const response = await fetch('/api/announcements');
        const result = await response.json();

        if (!response.ok) {
          console.error('Announcements loading API error:', result);
          throw new Error(result.error || 'Failed to load announcements');
        }
        
        console.log('Announcements loaded via API:', result.data?.length || 0);
        setAnnouncements(result.data || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Blood Dashboard', icon: BarChart3 },
    { id: 'ledger', label: 'Crimson Ledger', icon: BookOpen },
    { id: 'confessions', label: 'Blood Confessions', icon: MessageCircle },
    { id: 'announcements', label: 'Nexus Announcements', icon: Megaphone },
    { id: 'dossier', label: 'Classified Archives', icon: Database },
    { id: 'users', label: 'Registry Control', icon: Users },
    { id: 'settings', label: 'System Parameters', icon: Settings }
  ];

  // Calculate real stats from data
  const stats = [
    { 
      label: 'Connected Nodes', 
      value: users.length.toString(), 
      change: `+${Math.floor(users.length * 0.12)}`, 
      color: 'text-red-400' 
    },
    { 
      label: 'Processing Confessions', 
      value: crimsonSubmissions.filter(s => s.status === 'pending').length.toString(), 
      change: '+' + crimsonSubmissions.filter(s => s.status === 'pending').length, 
      color: 'text-yellow-400' 
    },
    { 
      label: 'Ledger Archives', 
      value: crimsonEntries.length.toString(), 
      change: '+' + Math.floor(crimsonEntries.length * 0.05), 
      color: 'text-gothic-crimson' 
    },
    { 
      label: 'Blood Rewards', 
      value: crimsonSubmissions.reduce((total, sub) => total + (sub.tips?.length || 0), 0).toString(), 
      change: '+' + Math.floor(crimsonSubmissions.length * 0.2), 
      color: 'text-red-400' 
    }
  ];

  const recentSubmissions = [
    {
      id: 1,
      type: 'confession',
      title: 'Strange visions in the blood district',
      author: 'Anonymous',
      timestamp: '2 hours ago',
      tips: 15,
      status: 'pending'
    },
    {
      id: 2,
      type: 'confession',
      title: 'Missing persons in Sector 7',
      author: 'ConcernedCitizen',
      timestamp: '4 hours ago',
      tips: 8,
      status: 'approved'
    },
    {
      id: 3,
      type: 'confession',
      title: 'Corruption in the council',
      author: 'Anonymous',
      timestamp: '6 hours ago',
      tips: 23,
      status: 'review'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-8">
          <div className="text-gothic-silver">Loading blood data streams...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <div className="text-red-400">Error: {error}</div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="crimson-theme p-6 rounded-lg tech-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gothic-silver">{stat.value}</p>
              </div>
              <div className={`text-right ${stat.color}`}>
                <p className="text-sm font-medium">{stat.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="crimson-theme p-6 rounded-lg tech-border"
        >
          <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-6">
            Recent Blood Confessions
          </h3>
          <div className="space-y-4">
            {crimsonSubmissions.slice(0, 3).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-4 bg-gothic-charcoal/30 rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium text-gothic-silver">{submission.title}</h4>
                  <p className="text-sm text-gothic-steel">
                    by {submission.profiles?.username || 'Anonymous'} • {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.status === 'approved' 
                      ? 'bg-red-500/20 text-red-400' 
                      : submission.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {submission.status}
                  </span>
                  <span className="text-sm text-gothic-steel">{submission.tips?.length || 0} rewards</span>
                </div>
              </div>
            ))}
            {crimsonSubmissions.length === 0 && !loading && (
              <div className="text-center py-8 text-gothic-steel">
                No confessions found. Add some sample data or wait for user submissions.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="crimson-theme p-6 rounded-lg tech-border"
        >
          <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-6">
            Blood Network Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Data Throughput</span>
              <span className="text-gothic-silver">642.8 TB/sec</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-gothic-crimson h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Blood Synchronization</span>
              <span className="text-red-400">94.7%</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-red-400 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Network Load</span>
              <span className="text-yellow-400">58.9%</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '59%' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const openCreateModal = () => {
    setNewEntry({
      title: '',
      content: '',
      author_name: 'Admin',
      category: 'Official Records'
    });
    setShowCreateModal(true);
  };

  const createNewEntry = async () => {
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in both title and content');
      return;
    }

    console.log('Creating new crimson entry via API:', newEntry);

    try {
      const response = await fetch('/api/admin/crimson-entries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEntry.title,
          content: newEntry.content,
          author_name: newEntry.author_name,
          category: newEntry.category
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Entry creation API error:', result);
        throw new Error(result.error || 'Create operation failed');
      }
      
      console.log('Entry created successfully via API');
      alert('Entry created successfully!');
      setShowCreateModal(false);
      setNewEntry({
        title: '',
        content: '',
        author_name: 'Admin',
        category: 'Official Records'
      });
      await reloadEntries();
    } catch (err: any) {
      console.error('Create error:', err);
      alert(`Error creating entry: ${err.message}`);
    }
  };

  const editEntry = (entry: CrimsonEntry) => {
    setEditingItem(entry);
    setShowEditModal(true);
  };

  const readEntry = (entry: CrimsonEntry) => {
    setReadingEntry(entry);
    setShowReadModal(true);
  };

  const readConfession = (confession: CrimsonSubmission) => {
    setReadingConfession(confession);
    setShowReadConfessionModal(true);
  };

  const closeReadConfessionModal = () => {
    setShowReadConfessionModal(false);
    setReadingConfession(null);
  };

  const saveEntryEdit = async () => {
    if (!editingItem) return;

    console.log('Saving crimson entry via API:', editingItem);

    try {
      const response = await fetch('/api/admin/crimson-entries/create', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem.id,
          title: editingItem.title,
          content: editingItem.content,
          author_name: editingItem.author_name,
          category: editingItem.category,
          is_published: editingItem.is_published
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Entry update API error:', result);
        throw new Error(result.error || 'Update operation failed');
      }

      console.log('Entry updated successfully via API');
      alert('Entry updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
      await reloadEntries();
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Error updating entry: ${err.message}`);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    console.log('Deleting crimson entry with ID:', id);

    try {
      const response = await fetch('/api/admin/delete-crimson-entry', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API entry deletion error:', result);
        throw new Error(result.error || 'Delete operation failed');
      }

      console.log('Entry deletion successful:', result);
      alert(`Entry deleted successfully! (${result.deletedCount} record(s) removed)`);
      
      await reloadEntries();
    } catch (err: any) {
      console.error('Delete entry error:', err);
      alert(`Error deleting entry: ${err.message}`);
    }
  };

  const approveConfession = async (id: string) => {
    console.log('Approving confession with ID via API:', id);
    
    try {
      const response = await fetch('/api/admin/crimson-submissions/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: id,
          status: 'approved'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Approval API error:', result);
        throw new Error(result.error || 'Approval operation failed');
      }

      console.log('Confession approved successfully via API');
      alert('Confession approved successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Approve confession error:', err);
      alert(`Error approving confession: ${err.message || 'Unknown error'}`);
    }
  };

  const rejectConfession = async (id: string) => {
    console.log('Rejecting confession with ID via API:', id);
    
    try {
      const response = await fetch('/api/admin/crimson-submissions/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: id,
          status: 'rejected'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Rejection API error:', result);
        throw new Error(result.error || 'Rejection operation failed');
      }

      console.log('Confession rejected successfully via API');
      alert('Confession rejected successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Reject confession error:', err);
      alert(`Error rejecting confession: ${err.message || 'Unknown error'}`);
    }
  };

  const deleteConfession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this confession?')) return;

    console.log('Attempting to delete confession with ID:', id);

    try {
      const response = await fetch('/api/admin/delete-crimson-submission', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API deletion error:', result);
        throw new Error(result.error || 'Delete operation failed');
      }

      console.log('Deletion successful:', result);
      alert(`Confession deleted successfully! (${result.deletedCount} record(s) removed)`);
      
      await loadData();
    } catch (err: any) {
      console.error('Delete confession error:', err);
      alert(`Error deleting confession: ${err.message || 'Unknown error'}`);
    }
  };

  const banUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          userRole: 'banned'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Ban user API error:', result);
        throw new Error(result.error || 'Ban operation failed');
      }

      loadData();
    } catch (err: any) {
      alert(`Error banning user: ${err.message}`);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          userRole: newRole
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Update user role API error:', result);
        throw new Error(result.error || 'Role update operation failed');
      }

      loadData();
    } catch (err: any) {
      alert(`Error updating user role: ${err.message}`);
    }
  };

  // Dossier CRUD Functions
  const createDossierEntry = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      console.log('Creating dossier with data:', newDossier);
      console.log('Attempting fetch to:', '/api/admin/dossier');
      
      const response = await fetch('/api/admin/dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDossier),
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);

      if (!response.ok) {
        const errorResult = await response.json();
        console.error('Create dossier API error:', errorResult);
        throw new Error(errorResult.error || 'Failed to create dossier entry');
      }

      const result = await response.json();
      console.log('Response data:', result);

      console.log('Dossier entry created successfully:', result);
      setNewDossier({
        title: '',
        summary: '',
        content: '',
        type: 'character',
        city: 'crimson',
        classification: 'public',
        is_published: true
      });
      setShowDossierCreateModal(false);
      loadData();
    } catch (err: any) {
      console.error('Create dossier error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      alert(`Error creating dossier entry: ${errorMessage}`);
    }
  };

  const updateDossierEntry = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/admin/dossier/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Update dossier API error:', result);
        throw new Error(result.error || 'Failed to update dossier entry');
      }

      console.log('Dossier entry updated successfully:', result);
      setEditingItem(null);
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      console.error('Update dossier error:', err);
      alert(`Error updating dossier entry: ${err.message}`);
    }
  };

  const deleteDossierEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dossier entry?')) return;

    try {
      const response = await fetch(`/api/admin/dossier/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Delete dossier API error:', result);
        throw new Error(result.error || 'Failed to delete dossier entry');
      }

      console.log('Dossier entry deleted successfully:', result);
      loadData();
    } catch (err: any) {
      console.error('Delete dossier error:', err);
      alert(`Error deleting dossier entry: ${err.message}`);
    }
  };

  // Announcement functions
  const createAnnouncement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      // Get current user for authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAnnouncement,
          author_id: user.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Create announcement API error:', result);
        throw new Error(result.error || 'Failed to create announcement');
      }

      console.log('Announcement created successfully:', result);
      setNewAnnouncement({ title: '', content: '', priority: 0 });
      setShowAnnouncementCreateModal(false);
      loadData();
    } catch (err: any) {
      console.error('Create announcement error:', err);
      alert(`Error creating announcement: ${err.message}`);
    }
  };

  const updateAnnouncement = async () => {
    if (!editingAnnouncement || !editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      // Get current user for authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingAnnouncement.title,
          content: editingAnnouncement.content,
          priority: editingAnnouncement.priority,
          is_active: editingAnnouncement.is_active,
          author_id: user.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Update announcement API error:', result);
        throw new Error(result.error || 'Failed to update announcement');
      }

      console.log('Announcement updated successfully:', result);
      setEditingAnnouncement(null);
      setShowAnnouncementEditModal(false);
      loadData();
    } catch (err: any) {
      console.error('Update announcement error:', err);
      alert(`Error updating announcement: ${err.message}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      // Get current user for authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/announcements/${id}?author_id=${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Delete announcement API error:', result);
        throw new Error(result.error || 'Failed to delete announcement');
      }

      console.log('Announcement deleted successfully:', result);
      loadData();
    } catch (err: any) {
      console.error('Delete announcement error:', err);
      alert(`Error deleting announcement: ${err.message}`);
    }
  };

  // Sorting function for confessions
  const getSortedConfessions = () => {
    if (!crimsonSubmissions) return [];

    return [...crimsonSubmissions].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'tips') {
        const tipsA = a.tipTotal || 0;
        const tipsB = b.tipTotal || 0;
        return sortOrder === 'desc' ? tipsB - tipsA : tipsA - tipsB;
      }
      return 0;
    });
  };

  const renderLedger = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Crimson Ledger Archive</h2>
        <button
          onClick={() => openCreateModal()}
          className="cyber-button px-4 py-2 bg-gothic-crimson text-white hover:bg-gothic-crimson/80"
        >
          <Plus size={16} className="mr-2" />
          New Entry
        </button>
      </div>

      <div className="grid gap-6">
        {crimsonEntries.map((entry) => (
          <div key={entry.id} className="crimson-theme p-6 rounded-lg tech-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-gothic text-gothic-silver">{entry.title}</h3>
                <p className="text-sm text-gothic-steel">By {entry.author_name} • {new Date(entry.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  entry.is_published ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {entry.is_published ? 'published' : 'draft'}
                </span>
              </div>
            </div>
            <p className="text-gothic-steel mb-4">{entry.content}</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => readEntry(entry)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Eye size={14} className="inline mr-1" />
                Read Full Entry
              </button>
              <button 
                onClick={() => editEntry(entry)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Edit3 size={14} className="inline mr-1" />
                Edit
              </button>
              <button 
                onClick={() => deleteEntry(entry.id)}
                className="text-gothic-steel hover:text-red-400 text-sm"
              >
                <Trash2 size={14} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {crimsonEntries.length === 0 && !loading && (
          <div className="crimson-theme p-8 rounded-lg tech-border text-center">
            <BookOpen size={48} className="mx-auto text-gothic-crimson mb-4" />
            <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Entries Found</h3>
            <p className="text-gothic-steel mb-4">Create your first Crimson Ledger entry to begin archiving official records.</p>
            <button
              onClick={() => openCreateModal()}
              className="cyber-button px-4 py-2 bg-gothic-crimson text-white"
            >
              Create First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfessions = () => {
    const sortedConfessions = getSortedConfessions();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Blood Confession Processing</h2>
          
          {/* Sorting Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gothic-steel text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'tips')}
                className="bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-2 py-1 text-sm"
              >
                <option value="date">Date</option>
                <option value="tips">Tips</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gothic-steel text-sm">Order:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-2 py-1 text-sm"
              >
                <option value="desc">{sortBy === 'date' ? 'Newest First' : 'Highest Tips'}</option>
                <option value="asc">{sortBy === 'date' ? 'Oldest First' : 'Lowest Tips'}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6">
          {sortedConfessions.map((confession) => (
            <div key={confession.id} className="crimson-theme p-6 rounded-lg tech-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-gothic text-gothic-silver">{confession.title}</h3>
                  <p className="text-sm text-gothic-steel">
                    by {confession.profiles?.username || 'Anonymous'} • {new Date(confession.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    confession.status === 'approved' 
                      ? 'bg-red-500/20 text-red-400' 
                      : confession.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {confession.status}
                  </span>
                  <span className="text-sm text-gothic-steel">
                    ${confession.tipTotal?.toFixed(2) || '0.00'} ({confession.tips?.length || 0} tips)
                  </span>
                </div>
              </div>
              <p className="text-gothic-steel mb-4">
                {confession.content.length > 200 
                  ? `${confession.content.substring(0, 200)}...` 
                  : confession.content}
              </p>
              <div className="flex space-x-2">
                {confession.content.length > 200 && (
                  <button 
                    onClick={() => readConfession(confession)}
                    className="text-gothic-crimson hover:text-red-300 text-sm"
                  >
                    <Eye size={14} className="inline mr-1" />
                    Read Full Confession
                  </button>
                )}
                {confession.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => approveConfession(confession.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <Eye size={14} className="inline mr-1" />
                      Approve
                    </button>
                    <button 
                      onClick={() => rejectConfession(confession.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => deleteConfession(confession.id)}
                  className="text-gothic-steel hover:text-red-400 text-sm"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {sortedConfessions.length === 0 && !loading && (
            <div className="crimson-theme p-8 rounded-lg tech-border text-center">
              <MessageCircle size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Blood Confessions</h3>
              <p className="text-gothic-steel">No user confessions found. Encourage citizens to share their blood secrets!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Registry Control</h2>
      
      <div className="crimson-theme p-6 rounded-lg tech-border">
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gothic-charcoal/30 rounded">
              <div>
                <h3 className="text-gothic-silver font-medium">{user.username}</h3>
                <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                  <span>Role: {user.user_role}</span>
                  <span>City: {user.city_affiliation || 'neutral'}</span>
                  <span>Connected: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  user.user_role === 'admin' 
                    ? 'bg-red-500/20 text-red-400' 
                    : user.user_role === 'moderator'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : user.user_role === 'banned'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.user_role}
                </span>
                <select
                  value={user.user_role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-2 py-1 text-xs"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="banned">Banned</option>
                </select>
                <button 
                  onClick={() => banUser(user.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                  title="Ban User"
                >
                  Ban
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Registered Users</h3>
              <p className="text-gothic-steel">No users found in the blood registry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Nexus Announcements</h2>
        <button
          onClick={() => setShowAnnouncementCreateModal(true)}
          className="flex items-center space-x-2 bg-gothic-crimson hover:bg-red-700 px-4 py-2 rounded transition-colors"
        >
          <Plus size={20} />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="crimson-theme p-6 rounded-lg tech-border">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gothic-silver">Loading announcements...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            <p>Error loading announcements: {error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-gothic-charcoal/30 p-4 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-gothic-silver font-medium">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      announcement.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      announcement.priority >= 3 ? 'bg-red-500/20 text-red-400' 
                      : announcement.priority >= 1 ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      Priority: {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gothic-steel text-sm mb-3 line-clamp-3">{announcement.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gothic-steel">
                    <span>By: {announcement.profiles.username}</span>
                    <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(announcement.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setReadingAnnouncement(announcement);
                      setShowAnnouncementReadModal(true);
                    }}
                    className="text-gothic-steel hover:text-blue-400 text-sm"
                  >
                    <Eye size={14} className="inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setShowAnnouncementEditModal(true);
                    }}
                    className="text-gothic-steel hover:text-yellow-400 text-sm"
                  >
                    <Edit3 size={14} className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="text-gothic-steel hover:text-red-400 text-sm"
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && !loading && (
            <div className="crimson-theme p-8 rounded-lg tech-border text-center">
              <Megaphone size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Announcements</h3>
              <p className="text-gothic-steel">No announcements found. Create one to notify all users!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDossier = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Classified Archives</h2>
        <button
          onClick={() => setShowDossierCreateModal(true)}
          className="flex items-center space-x-2 bg-gothic-crimson hover:bg-red-700 px-4 py-2 rounded transition-colors"
        >
          <Plus size={20} />
          <span>New Dossier Entry</span>
        </button>
      </div>

      <div className="crimson-theme p-6 rounded-lg tech-border">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gothic-silver">Loading classified archives...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error loading dossier entries: {error}</p>
          </div>
        )}

        <div className="space-y-4">
          {dossierEntries.map((entry) => (
            <div key={entry.id} className="bg-gothic-charcoal/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gothic-silver">{entry.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      entry.classification === 'top-secret' ? 'bg-red-900/80 text-red-100' :
                      entry.classification === 'secret' ? 'bg-orange-900/80 text-orange-100' :
                      entry.classification === 'confidential' ? 'bg-yellow-900/80 text-yellow-100' :
                      'bg-green-900/80 text-green-100'
                    }`}>
                      {entry.classification}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.city === 'crimson' ? 'bg-gothic-crimson/20 text-gothic-crimson' :
                      'bg-gothic-silver/20 text-gothic-silver'
                    }`}>
                      {entry.city === 'crimson' ? 'Crimson City' : 'Silver Heights'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.type === 'character' ? 'bg-blue-900/80 text-blue-100' :
                      entry.type === 'location' ? 'bg-purple-900/80 text-purple-100' :
                      'bg-gray-900/80 text-gray-100'
                    }`}>
                      {entry.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.is_published ? 'bg-green-900/80 text-green-100' : 'bg-gray-900/80 text-gray-100'
                    }`}>
                      {entry.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setReadingDossier(entry);
                      setShowDossierReadModal(true);
                    }}
                    className="p-2 text-gothic-steel hover:text-gothic-silver transition-colors"
                    title="Read Entry"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingDossier(entry);
                      setShowDossierEditModal(true);
                    }}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Edit Entry"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteDossierEntry(entry.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gothic-steel text-sm mb-2 line-clamp-2">{entry.summary}</p>
              <div className="flex justify-between items-center text-xs text-gothic-steel">
                <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(entry.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          
          {dossierEntries.length === 0 && !loading && (
            <div className="text-center py-8">
              <Database size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Archived Entries</h3>
              <p className="text-gothic-steel">No classified dossier entries found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="crimson-theme p-8 rounded-lg tech-border mb-8">
            <Shield size={48} className="mx-auto text-gothic-crimson mb-4" />
            <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text mb-4">
              Crimson Depths Command Center
            </h1>
            <p className="text-gothic-steel text-lg">
              Blood network administration interface for Crimson City consciousness management.
            </p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gothic-crimson text-white'
                    : 'bg-gothic-charcoal/50 text-gothic-silver hover:bg-gothic-crimson/20'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'ledger' && renderLedger()}
          {activeTab === 'confessions' && renderConfessions()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'dossier' && renderDossier()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'settings' && (
            <div className="crimson-theme p-8 rounded-lg tech-border text-center">
              <Settings size={48} className="mx-auto text-gothic-crimson mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">System Parameters</h3>
              <p className="text-gothic-steel">Configure blood network settings and synchronization protocols.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gothic-charcoal/30 p-4 rounded">
                  <h4 className="text-gothic-silver font-medium mb-2">Blood Sync Rate</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gothic-charcoal rounded-full h-2">
                      <div className="bg-gothic-crimson h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <span className="text-sm text-gothic-steel">82%</span>
                  </div>
                </div>
                <div className="bg-gothic-charcoal/30 p-4 rounded">
                  <h4 className="text-gothic-silver font-medium mb-2">Data Integrity</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gothic-charcoal rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-sm text-red-400">94%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!editingItem}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        title={editingItem?.summary ? 'Edit Dossier Entry' : 'Edit Entry'}
        theme="crimson"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gothic-steel text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
              />
            </div>

            {editingItem?.summary !== undefined && (
              <>
                <div>
                  <label className="block text-gothic-steel text-sm font-medium mb-1">Summary</label>
                  <textarea
                    value={editingItem.summary || ''}
                    onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                    rows={3}
                    className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">Type</label>
                    <select
                      value={editingItem.type || ''}
                      onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    >
                      <option value="character">Character</option>
                      <option value="location">Location</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">City</label>
                    <select
                      value={editingItem.city || ''}
                      onChange={(e) => setEditingItem({...editingItem, city: e.target.value})}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    >
                      <option value="crimson">Crimson City</option>
                      <option value="silver">Silver Heights</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">Classification</label>
                    <select
                      value={editingItem.classification || ''}
                      onChange={(e) => setEditingItem({...editingItem, classification: e.target.value})}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    >
                      <option value="public">Public</option>
                      <option value="confidential">Confidential</option>
                      <option value="secret">Secret</option>
                      <option value="top-secret">Top Secret</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-gothic-steel text-sm font-medium mb-1">Content</label>
              <textarea
                value={editingItem?.content || ''}
                onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                rows={8}
                className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
              />
            </div>

            {editingItem?.summary === undefined && (
              <>
                <div>
                  <label className="block text-gothic-steel text-sm font-medium mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingItem?.author_name || ''}
                    onChange={(e) => setEditingItem({...editingItem, author_name: e.target.value})}
                    className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-gothic-steel text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={editingItem?.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-gothic-steel text-sm font-medium mb-1">Status</label>
              <select
                value={editingItem?.is_published ? 'published' : 'draft'}
                onChange={(e) => setEditingItem({...editingItem, is_published: e.target.value === 'published'})}
                className="bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={() => {setShowEditModal(false); setEditingItem(null);}}
                className="px-4 py-2 text-gothic-steel hover:text-gothic-silver"
              >
                Cancel
              </button>
              <button
                onClick={editingItem?.summary !== undefined ? updateDossierEntry : saveEntryEdit}
                className="px-4 py-2 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] backdrop-blur-sm" style={{zIndex: 99999}}>
          <div className="bg-gothic-charcoal border-2 border-gothic-crimson rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{backgroundColor: '#2a2a2a'}}>
            <h3 className="text-xl font-gothic text-gothic-silver mb-4">
              {activeTab === 'dossier' ? 'Create New Dossier Entry' : 'Create New Crimson Entry'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gothic-steel mb-2">Title</label>
                <input
                  type="text"
                  value={activeTab === 'dossier' ? newDossier.title : newEntry.title}
                  onChange={(e) => activeTab === 'dossier' 
                    ? setNewDossier({...newDossier, title: e.target.value})
                    : setNewEntry({...newEntry, title: e.target.value})
                  }
                  className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                  style={{backgroundColor: '#1a1a1a'}}
                  placeholder="Enter entry title..."
                />
              </div>

              {activeTab === 'dossier' && (
                <>
                  <div>
                    <label className="block text-gothic-steel mb-2">Summary</label>
                    <textarea
                      value={newDossier.summary}
                      onChange={(e) => setNewDossier({...newDossier, summary: e.target.value})}
                      className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50 h-24 resize-none"
                      style={{backgroundColor: '#1a1a1a'}}
                      placeholder="Enter entry summary..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gothic-steel mb-2">Type</label>
                      <select
                        value={newDossier.type}
                        onChange={(e) => setNewDossier({...newDossier, type: e.target.value as any})}
                        className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                        style={{backgroundColor: '#1a1a1a'}}
                      >
                        <option value="character">Character</option>
                        <option value="location">Location</option>
                        <option value="event">Event</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gothic-steel mb-2">City</label>
                      <select
                        value={newDossier.city}
                        onChange={(e) => setNewDossier({...newDossier, city: e.target.value as any})}
                        className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                        style={{backgroundColor: '#1a1a1a'}}
                      >
                        <option value="crimson">Crimson City</option>
                        <option value="silver">Silver Heights</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gothic-steel mb-2">Classification</label>
                      <select
                        value={newDossier.classification}
                        onChange={(e) => setNewDossier({...newDossier, classification: e.target.value as any})}
                        className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                        style={{backgroundColor: '#1a1a1a'}}
                      >
                        <option value="public">Public</option>
                        <option value="confidential">Confidential</option>
                        <option value="secret">Secret</option>
                        <option value="top-secret">Top Secret</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-gothic-steel mb-2">Content</label>
                <textarea
                  value={activeTab === 'dossier' ? newDossier.content : newEntry.content}
                  onChange={(e) => activeTab === 'dossier' 
                    ? setNewDossier({...newDossier, content: e.target.value})
                    : setNewEntry({...newEntry, content: e.target.value})
                  }
                  className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50 h-32 resize-none"
                  style={{backgroundColor: '#1a1a1a'}}
                  placeholder={activeTab === 'dossier' ? "Enter detailed dossier content..." : "Enter entry content..."}
                />
              </div>

              {activeTab !== 'dossier' && (
                <>
                  <div>
                    <label className="block text-gothic-steel mb-2">Author</label>
                    <input
                      type="text"
                      value={newEntry.author_name}
                      onChange={(e) => setNewEntry({...newEntry, author_name: e.target.value})}
                      className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                      style={{backgroundColor: '#1a1a1a'}}
                      placeholder="Author name..."
                    />
                  </div>
                  <div>
                    <label className="block text-gothic-steel mb-2">Category</label>
                    <select
                      value={newEntry.category}
                      onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                      className="w-full p-3 border border-gothic-crimson/30 rounded text-gothic-silver focus:border-gothic-crimson/50"
                      style={{backgroundColor: '#1a1a1a'}}
                    >
                      <option value="Official Records">Official Records</option>
                      <option value="Blood Transmissions">Blood Transmissions</option>
                      <option value="Data Fragments">Data Fragments</option>
                      <option value="Archive Entries">Archive Entries</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false); 
                  setNewEntry({title: '', content: '', author_name: 'Admin', category: 'Official Records'});
                  setNewDossier({title: '', summary: '', content: '', type: 'character', city: 'crimson', classification: 'public', is_published: true});
                }}
                className="px-4 py-2 text-gothic-steel rounded hover:opacity-80"
                style={{backgroundColor: '#1a1a1a', border: '1px solid #8B0000'}}
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'dossier' ? createDossierEntry : createNewEntry}
                className="px-4 py-2 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80"
              >
                {activeTab === 'dossier' ? 'Create Dossier Entry' : 'Create Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Entry Modal */}
      {showReadModal && readingEntry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] backdrop-blur-sm" style={{zIndex: 99999}}>
          <div className="bg-gothic-charcoal border-2 border-gothic-crimson rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" style={{backgroundColor: '#2a2a2a'}}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-2">{readingEntry.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                  <span>By {readingEntry.author_name}</span>
                  <span>•</span>
                  <span>{new Date(readingEntry.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="px-2 py-1 rounded text-xs bg-gothic-steel/20">
                    {readingEntry.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    readingEntry.is_published ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {readingEntry.is_published ? 'published' : 'draft'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {setShowReadModal(false); setReadingEntry(null);}}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold ml-4"
                title="Close"
              >
                ×
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap text-base">
                {readingEntry.content}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gothic-steel/30">
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    setShowReadModal(false);
                    setReadingEntry(null);
                    editEntry(readingEntry);
                  }}
                  className="text-gothic-silver hover:text-red-400 text-sm flex items-center space-x-1"
                >
                  <Edit3 size={14} />
                  <span>Edit Entry</span>
                </button>
              </div>
              <button
                onClick={() => {setShowReadModal(false); setReadingEntry(null);}}
                className="px-4 py-2 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Full Confession Modal */}
      {showReadConfessionModal && readingConfession && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
          onClick={closeReadConfessionModal}
          style={{zIndex: 99999}}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/95 border border-gothic-crimson/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(42, 42, 42, 0.95) 100%)'
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gothic-crimson/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-2">
                    {readingConfession.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gothic-crimson" />
                      <span className="text-gothic-crimson font-medium">
                        {readingConfession.profiles?.username || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(readingConfession.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{new Date(readingConfession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`px-2 py-1 font-tech font-bold rounded text-xs ${
                      readingConfession.status === 'approved' 
                        ? 'bg-red-500/20 text-red-400' 
                        : readingConfession.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {readingConfession.status.charAt(0).toUpperCase() + readingConfession.status.slice(1)}
                    </span>
                    <span className="text-sm text-gothic-steel">
                      Tips: ${readingConfession.tipTotal?.toFixed(2) || '0.00'} ({readingConfession.tips?.length || 0})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={closeReadConfessionModal}
                    className="p-2 hover:bg-gothic-crimson/10 rounded-lg transition-colors text-gothic-silver hover:text-gothic-crimson"
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="border-l-4 border-gothic-crimson/50 pl-6" style={{backgroundColor: 'rgba(42, 42, 42, 0.3)'}}>
                <p className="text-gothic-silver italic text-lg leading-relaxed font-noir whitespace-pre-wrap">
                  &ldquo;{readingConfession.content}&rdquo;
                </p>
              </div>
              
              {/* Admin Actions */}
              <div className="mt-6 pt-4 border-t border-gothic-crimson/20">
                <div className="flex space-x-4">
                  {readingConfession.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => {
                          approveConfession(readingConfession.id);
                          closeReadConfessionModal();
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Approve Confession
                      </button>
                      <button 
                        onClick={() => {
                          rejectConfession(readingConfession.id);
                          closeReadConfessionModal();
                        }}
                        className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-400/30 rounded hover:bg-gray-500/30 transition-colors"
                      >
                        Reject Confession
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      deleteConfession(readingConfession.id);
                      closeReadConfessionModal();
                    }}
                    className="px-4 py-2 bg-gothic-charcoal text-gothic-steel border border-gothic-steel rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    Delete Confession
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dossier Create Modal */}
      {showDossierCreateModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDossierCreateModal(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Create New Dossier Entry</h2>
              <button
                onClick={() => setShowDossierCreateModal(false)}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form className="space-y-4" onSubmit={createDossierEntry}>
                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newDossier.title}
                    onChange={(e) => setNewDossier({ ...newDossier, title: e.target.value })}
                    className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                    placeholder="Enter dossier title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Summary *
                  </label>
                  <input
                    type="text"
                    value={newDossier.summary}
                    onChange={(e) => setNewDossier({ ...newDossier, summary: e.target.value })}
                    className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                    placeholder="Brief summary..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gothic-silver mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newDossier.content}
                    onChange={(e) => setNewDossier({ ...newDossier, content: e.target.value })}
                    className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none h-32 resize-none"
                    placeholder="Detailed content..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      Type *
                    </label>
                    <select
                      value={newDossier.type}
                      onChange={(e) => setNewDossier({ ...newDossier, type: e.target.value as any })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                      required
                    >
                      <option value="character">Character</option>
                      <option value="location">Location</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      City *
                    </label>
                    <select
                      value={newDossier.city}
                      onChange={(e) => setNewDossier({ ...newDossier, city: e.target.value as any })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                      required
                    >
                      <option value="crimson">Crimson City</option>
                      <option value="silver">Silver Heights</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      Classification *
                    </label>
                    <select
                      value={newDossier.classification}
                      onChange={(e) => setNewDossier({ ...newDossier, classification: e.target.value as any })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                      required
                    >
                      <option value="public">Public</option>
                      <option value="confidential">Confidential</option>
                      <option value="secret">Secret</option>
                      <option value="top-secret">Top Secret</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="publish-dossier"
                    checked={newDossier.is_published}
                    onChange={(e) => setNewDossier({ ...newDossier, is_published: e.target.checked })}
                    className="w-4 h-4 text-gothic-crimson bg-gothic-charcoal/50 border-gothic-steel/50 rounded focus:ring-gothic-crimson focus:ring-2"
                  />
                  <label htmlFor="publish-dossier" className="text-sm font-medium text-gothic-silver">
                    Publish immediately (make visible to users)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDossierCreateModal(false)}
                    className="px-6 py-3 bg-gothic-charcoal text-gothic-steel border border-gothic-steel rounded hover:bg-gothic-steel/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80 transition-colors"
                  >
                    Create Dossier Entry
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Dossier Edit Modal */}
      {showDossierEditModal && editingDossier && (
        <div className="modal-overlay" onClick={() => setShowDossierEditModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Edit Dossier Entry</h2>
                <button
                  onClick={() => setShowDossierEditModal(false)}
                  className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form className="space-y-4" onSubmit={updateDossierEntry}>
                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editingDossier.title}
                      onChange={(e) => setEditingDossier({ ...editingDossier, title: e.target.value })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                      placeholder="Enter dossier title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      Summary *
                    </label>
                    <input
                      type="text"
                      value={editingDossier.summary || ''}
                      onChange={(e) => setEditingDossier({ ...editingDossier, summary: e.target.value })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                      placeholder="Brief summary..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gothic-silver mb-2">
                      Content *
                    </label>
                    <textarea
                      value={editingDossier.content}
                      onChange={(e) => setEditingDossier({ ...editingDossier, content: e.target.value })}
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none h-32 resize-none"
                      placeholder="Detailed content..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gothic-silver mb-2">
                        Type *
                      </label>
                      <select
                        value={editingDossier.type}
                        onChange={(e) => setEditingDossier({ ...editingDossier, type: e.target.value })}
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                        required
                      >
                        <option value="character">Character</option>
                        <option value="location">Location</option>
                        <option value="event">Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gothic-silver mb-2">
                        City *
                      </label>
                      <select
                        value={editingDossier.city}
                        onChange={(e) => setEditingDossier({ ...editingDossier, city: e.target.value })}
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                        required
                      >
                        <option value="crimson">Crimson City</option>
                        <option value="silver">Silver Heights</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gothic-silver mb-2">
                        Classification *
                      </label>
                      <select
                        value={editingDossier.classification}
                        onChange={(e) => setEditingDossier({ ...editingDossier, classification: e.target.value })}
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-crimson focus:outline-none"
                        required
                      >
                        <option value="public">Public</option>
                        <option value="confidential">Confidential</option>
                        <option value="secret">Secret</option>
                        <option value="top-secret">Top Secret</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowDossierEditModal(false)}
                      className="px-6 py-3 bg-gothic-charcoal text-gothic-steel border border-gothic-steel rounded hover:bg-gothic-steel/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80 transition-colors"
                    >
                      Update Dossier Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dossier Read Modal */}
      {showDossierReadModal && readingDossier && (
        <div className="modal-overlay" onClick={() => setShowDossierReadModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
                <div className="flex-1">
                  <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-2">{readingDossier.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      readingDossier.classification === 'top-secret' ? 'bg-red-900/80 text-red-100' :
                      readingDossier.classification === 'secret' ? 'bg-orange-900/80 text-orange-100' :
                      readingDossier.classification === 'confidential' ? 'bg-yellow-900/80 text-yellow-100' :
                      'bg-green-900/80 text-green-100'
                    }`}>
                      {readingDossier.classification}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      readingDossier.city === 'crimson' ? 'bg-gothic-crimson/20 text-gothic-crimson' :
                      'bg-gothic-silver/20 text-gothic-silver'
                    }`}>
                      {readingDossier.city === 'crimson' ? 'Crimson City' : 'Silver Heights'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      readingDossier.type === 'character' ? 'bg-blue-900/80 text-blue-100' :
                      readingDossier.type === 'location' ? 'bg-purple-900/80 text-purple-100' :
                      'bg-gray-900/80 text-gray-100'
                    }`}>
                      {readingDossier.type}
                    </span>
                    <span>•</span>
                    <span>{new Date(readingDossier.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDossierReadModal(false)}
                  className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold ml-4"
                  title="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gothic-silver mb-2">Summary</h3>
                  <p className="text-gothic-steel">{readingDossier.summary || readingDossier.subtitle}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gothic-silver mb-2">Details</h3>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap text-base">
                      {readingDossier.content || readingDossier.description}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-6 border-t border-gothic-steel/30">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setShowDossierReadModal(false);
                      setReadingDossier(null);
                      setEditingDossier(readingDossier);
                      setShowDossierEditModal(true);
                    }}
                    className="text-gothic-silver hover:text-blue-400 text-sm flex items-center space-x-1"
                  >
                    <Edit3 size={14} />
                    <span>Edit Dossier</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowDossierReadModal(false)}
                  className="px-4 py-2 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Announcement Create Modal */}
      {showAnnouncementCreateModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnnouncementCreateModal(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Create New Announcement</h2>
              <button
                onClick={() => setShowAnnouncementCreateModal(false)}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={createAnnouncement} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement((prev: any) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Priority (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement((prev: any) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none"
                />
                <p className="text-xs text-gothic-steel mt-1">Higher priority announcements appear first</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gothic-crimson text-white py-2 px-4 rounded hover:bg-gothic-crimson/80 transition-colors"
                >
                  Create Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementCreateModal(false)}
                  className="px-6 py-2 border border-gothic-steel text-gothic-steel rounded hover:bg-gothic-steel/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Announcement Edit Modal */}
      {showAnnouncementEditModal && editingAnnouncement && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnnouncementEditModal(false);
              setEditingAnnouncement(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Edit Announcement</h2>
              <button
                onClick={() => {
                  setShowAnnouncementEditModal(false);
                  setEditingAnnouncement(null);
                }}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Title</label>
                <input
                  type="text"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Content</label>
                <textarea
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-gothic text-gothic-steel mb-1">Priority (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={editingAnnouncement.priority}
                  onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-crimson focus:ring-1 focus:ring-gothic-crimson outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingAnnouncement.is_active}
                  onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                  className="text-gothic-crimson"
                />
                <label htmlFor="is_active" className="text-sm font-gothic text-gothic-steel">Active</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={updateAnnouncement}
                  className="flex-1 bg-gothic-crimson text-white py-2 px-4 rounded hover:bg-gothic-crimson/80 transition-colors"
                >
                  Update Announcement
                </button>
                <button
                  onClick={() => {
                    setShowAnnouncementEditModal(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-6 py-2 border border-gothic-steel text-gothic-steel rounded hover:bg-gothic-steel/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Announcement Read Modal */}
      {showAnnouncementReadModal && readingAnnouncement && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnnouncementReadModal(false);
              setReadingAnnouncement(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gothic-charcoal rounded-lg border border-gothic-crimson shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Announcement Details</h2>
              <button
                onClick={() => {
                  setShowAnnouncementReadModal(false);
                  setReadingAnnouncement(null);
                }}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-2">{readingAnnouncement.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                    <span>By: {readingAnnouncement.profiles.username}</span>
                    <span className={`px-2 py-1 rounded ${
                      readingAnnouncement.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {readingAnnouncement.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      readingAnnouncement.priority >= 3 ? 'bg-red-500/20 text-red-400' 
                      : readingAnnouncement.priority >= 1 ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      Priority: {readingAnnouncement.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-gothic text-gothic-silver mb-2">Content</h4>
                  <div className="bg-gothic-dark-gray/50 p-4 rounded border border-gothic-steel/30">
                    <p className="text-gothic-steel whitespace-pre-wrap leading-relaxed">{readingAnnouncement.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gothic-steel/30">
                  <div className="text-xs text-gothic-steel">
                    <p>Created: {new Date(readingAnnouncement.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(readingAnnouncement.updated_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      setReadingAnnouncement(null);
                      setShowAnnouncementReadModal(false);
                      setEditingAnnouncement(readingAnnouncement);
                      setShowAnnouncementEditModal(true);
                    }}
                    className="text-gothic-silver hover:text-blue-400 text-sm flex items-center space-x-1"
                  >
                    <Edit3 size={14} />
                    <span>Edit Announcement</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowAnnouncementReadModal(false);
                    setReadingAnnouncement(null);
                  }}
                  className="px-4 py-2 bg-gothic-crimson text-white rounded hover:bg-gothic-crimson/80"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
