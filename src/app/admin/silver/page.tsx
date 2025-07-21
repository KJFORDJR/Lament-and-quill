'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, Users, BarChart3, 
  Settings, MessageCircle, FileText, Shield, BookOpen, Database, Megaphone 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';

interface LamentFragment {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface LamentSubmission {
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

interface UserProfile {
  id: string;
  username: string;
  user_role: string;
  city_affiliation: string;
  created_at: string;
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

export default function AdminSilver() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lamentFragments, setLamentFragments] = useState<LamentFragment[]>([]);
  const [lamentSubmissions, setLamentSubmissions] = useState<LamentSubmission[]>([]);
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
  
  const [readingFragment, setReadingFragment] = useState<LamentFragment | null>(null);
  const [newFragment, setNewFragment] = useState({
    title: '',
    content: '',
    author_name: 'Admin',
    category: 'System Messages'
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
    city: 'silver' as 'crimson' | 'silver',
    classification: 'public' as 'public' | 'confidential' | 'secret' | 'top-secret',
    is_published: true
  });

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Specific function to reload fragments
  const reloadFragments = async () => {
    try {
      console.log('Reloading fragments via API...');
      
      const response = await fetch('/api/admin/fragments');
      const result = await response.json();

      if (!response.ok) {
        console.error('Fragment reload API error:', result);
        throw new Error(result.error || 'Failed to reload fragments');
      }
      
      console.log('Fragments reloaded via API:', result.data?.length || 0);
      setLamentFragments(result.data || []);
    } catch (err: any) {
      console.error('Error reloading fragments:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Always load fragments data for the fragments section
      if (activeTab === 'fragments') {
        console.log('Loading fragments via API...');
        
        const response = await fetch('/api/admin/fragments');
        const result = await response.json();

        if (!response.ok) {
          console.error('Fragment loading API error:', result);
          throw new Error(result.error || 'Failed to load fragments');
        }
        
        console.log('Fragments loaded via API:', result.data?.length || 0);
        setLamentFragments(result.data || []);
      }
      
      if (activeTab === 'submissions' || activeTab === 'dashboard') {
        console.log('Loading lament submissions via API...');
        
        const response = await fetch('/api/admin/submissions');
        const result = await response.json();

        if (!response.ok) {
          console.error('Submissions loading API error:', result);
          throw new Error(result.error || 'Failed to load submissions');
        }

        console.log('Submissions loaded via API:', result.data?.length || 0);
        setLamentSubmissions(result.data || []);
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
    { id: 'dashboard', label: 'Neural Dashboard', icon: BarChart3 },
    { id: 'fragments', label: 'Lament Fragments', icon: BookOpen },
    { id: 'submissions', label: 'Neural Reports', icon: MessageCircle },
    { id: 'announcements', label: 'Nexus Announcements', icon: Megaphone },
    { id: 'dossier', label: 'Data Archives', icon: Database },
    { id: 'users', label: 'Consciousness Registry', icon: Users },
    { id: 'settings', label: 'System Parameters', icon: Settings }
  ];

  // Calculate real stats from data
  const stats = [
    { 
      label: 'Connected Nodes', 
      value: users.length.toString(), 
      change: `+${Math.floor(users.length * 0.12)}`, 
      color: 'text-green-400' 
    },
    { 
      label: 'Processing Reports', 
      value: lamentSubmissions.filter(s => s.status === 'pending').length.toString(), 
      change: '+' + lamentSubmissions.filter(s => s.status === 'pending').length, 
      color: 'text-yellow-400' 
    },
    { 
      label: 'Fragment Archives', 
      value: lamentFragments.length.toString(), 
      change: '+' + Math.floor(lamentFragments.length * 0.05), 
      color: 'text-gothic-silver' 
    },
    { 
      label: 'Neural Rewards', 
      value: lamentSubmissions.reduce((total, sub) => total + (sub.tips?.length || 0), 0).toString(), 
      change: '+' + Math.floor(lamentSubmissions.length * 0.2), 
      color: 'text-green-400' 
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-8">
          <div className="text-gothic-silver">Loading neural data streams...</div>
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
            className="silver-theme p-6 rounded-lg tech-border"
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
          className="silver-theme p-6 rounded-lg tech-border"
        >
          <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-6">
            Recent Neural Reports
          </h3>
          <div className="space-y-4">
            {lamentSubmissions.slice(0, 3).map((submission) => (
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
                      ? 'bg-green-500/20 text-green-400' 
                      : submission.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {submission.status}
                  </span>
                  <span className="text-sm text-gothic-steel">{submission.tips?.length || 0} rewards</span>
                </div>
              </div>
            ))}
            {lamentSubmissions.length === 0 && !loading && (
              <div className="text-center py-8 text-gothic-steel">
                No neural reports found. Add some sample data or wait for user submissions.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="silver-theme p-6 rounded-lg tech-border"
        >
          <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-6">
            Neural Network Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Data Throughput</span>
              <span className="text-gothic-silver">847.2 TB/sec</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-gothic-silver h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Synchronization</span>
              <span className="text-green-400">97.3%</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '97%' }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gothic-steel">Neural Load</span>
              <span className="text-yellow-400">65.4%</span>
            </div>
            <div className="w-full bg-gothic-charcoal rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const openCreateModal = () => {
    setNewFragment({
      title: '',
      content: '',
      author_name: 'Admin',
      category: 'System Messages'
    });
    setShowCreateModal(true);
  };

  const createNewFragment = async () => {
    if (!newFragment.title || !newFragment.content) {
      alert('Please fill in both title and content');
      return;
    }

    console.log('Creating new fragment via API:', newFragment);

    try {
      const response = await fetch('/api/admin/fragments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newFragment.title,
          content: newFragment.content,
          author_name: newFragment.author_name,
          category: newFragment.category
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Fragment creation API error:', result);
        throw new Error(result.error || 'Create operation failed');
      }
      
      console.log('Fragment created successfully via API');
      alert('Fragment created successfully!');
      setShowCreateModal(false);
      setNewFragment({
        title: '',
        content: '',
        author_name: 'Admin',
        category: 'System Messages'
      });
      await reloadFragments();
    } catch (err: any) {
      console.error('Create error:', err);
      alert(`Error creating fragment: ${err.message}`);
    }
  };

  const editFragment = (fragment: LamentFragment) => {
    setEditingItem(fragment);
    setShowEditModal(true);
  };

  const readFragment = (fragment: LamentFragment) => {
    setReadingFragment(fragment);
    setShowReadModal(true);
  };

  const saveFragmentEdit = async () => {
    if (!editingItem) return;

    console.log('Saving fragment via API:', editingItem);

    try {
      const response = await fetch('/api/admin/fragments/create', {
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
        console.error('Fragment update API error:', result);
        throw new Error(result.error || 'Update operation failed');
      }

      console.log('Fragment updated successfully via API');
      alert('Fragment updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
      await reloadFragments(); // Use specific reload function
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Error updating fragment: ${err.message}`);
    }
  };

  const deleteFragment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fragment?')) return;

    console.log('Deleting fragment with ID:', id);

    try {
      // Use the admin API endpoint to bypass RLS policies
      const response = await fetch('/api/admin/delete-fragment', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fragmentId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API fragment deletion error:', result);
        throw new Error(result.error || 'Delete operation failed');
      }

      console.log('Fragment deletion successful:', result);
      alert(`Fragment deleted successfully! (${result.deletedCount} record(s) removed)`);
      
      await reloadFragments(); // Use specific reload function
    } catch (err: any) {
      console.error('Delete fragment error:', err);
      alert(`Error deleting fragment: ${err.message}`);
    }
  };

  const approveSubmission = async (id: string) => {
    console.log('Approving submission with ID via API:', id);
    
    try {
      const response = await fetch('/api/admin/submissions/status', {
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

      console.log('Submission approved successfully via API');
      alert('Submission approved successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Approve submission error:', err);
      alert(`Error approving submission: ${err.message || 'Unknown error'}`);
    }
  };

  const rejectSubmission = async (id: string) => {
    console.log('Rejecting submission with ID via API:', id);
    
    try {
      const response = await fetch('/api/admin/submissions/status', {
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

      console.log('Submission rejected successfully via API');
      alert('Submission rejected successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Reject submission error:', err);
      alert(`Error rejecting submission: ${err.message || 'Unknown error'}`);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    console.log('Attempting to delete submission with ID:', id);

    try {
      // Use the admin API endpoint to bypass RLS policies
      const response = await fetch('/api/admin/delete-submission', {
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
      alert(`Submission deleted successfully! (${result.deletedCount} record(s) removed)`);
      
      // Reload data to refresh the UI
      await loadData();
    } catch (err: any) {
      console.error('Delete submission error:', err);
      alert(`Error deleting submission: ${err.message || 'Unknown error'}`);
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
  const createDossierEntry = async () => {
    console.log('=== DOSSIER CREATION DEBUG START ===');
    console.log('Starting dossier creation with data:', newDossier);
    console.log('Current window location:', window.location.href);
    console.log('Navigator online:', navigator.onLine);
    console.log('Current timestamp:', new Date().toISOString());
    
    // Validate data before sending
    console.log('Validating required fields...');
    if (!newDossier.title?.trim()) {
      alert('Title is required');
      return;
    }
    if (!newDossier.summary?.trim()) {
      alert('Summary is required');
      return;
    }
    if (!newDossier.content?.trim()) {
      alert('Content is required');
      return;
    }
    console.log('Validation passed');

    try {
      const requestData = {
        ...newDossier,
        title: newDossier.title.trim(),
        summary: newDossier.summary.trim(),
        content: newDossier.content.trim()
      };
      
      console.log('Request data prepared:', requestData);
      const requestBody = JSON.stringify(requestData);
      console.log('Request body length:', requestBody.length);
      console.log('Request body:', requestBody);
      
      console.log('About to make fetch request...');
      
      let response;
      try {
        response = await fetch('/api/admin/dossier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });
        console.log('Fetch completed successfully');
      } catch (fetchError) {
        console.error('Fetch request failed:', fetchError);
        console.error('Fetch error type:', typeof fetchError);
        console.error('Fetch error message:', (fetchError as any)?.message);
        console.error('Fetch error name:', (fetchError as any)?.name);
        console.error('Fetch error stack:', (fetchError as any)?.stack);
        throw new Error(`Network request failed: ${(fetchError as any)?.message || 'Unknown fetch error'}`);
      }

      console.log('Fetch response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response type:', response.type);
      console.log('Response url:', response.url);
      
      // Check if response has content
      let responseText;
      try {
        responseText = await response.text();
        console.log('Raw response text length:', responseText.length);
        console.log('Raw response text:', responseText);
      } catch (textError) {
        console.error('Error reading response text:', textError);
        throw new Error(`Failed to read response: ${(textError as any)?.message}`);
      }
      
      // Parse JSON manually
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed JSON result:', result);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Failed to parse response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        console.error('Create dossier API error:', result);
        throw new Error(result.error || 'Failed to create dossier entry');
      }

      console.log('Dossier entry created successfully:', result);
      alert('Dossier entry created successfully!');
      
      setNewDossier({
        title: '',
        summary: '',
        content: '',
        type: 'character',
        city: 'silver',
        classification: 'public',
        is_published: true
      });
      setShowDossierCreateModal(false);
      loadData();
      
      console.log('=== DOSSIER CREATION DEBUG END - SUCCESS ===');
    } catch (err: any) {
      console.error('=== DOSSIER CREATION DEBUG END - ERROR ===');
      console.error('Create dossier error:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Error toString:', err?.toString());
      
      // Try to serialize the error object more thoroughly
      try {
        console.error('Error as JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      } catch (jsonErr) {
        console.error('Could not JSON stringify error:', jsonErr);
      }
      
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
      // Get current user to pass author_id for admin verification
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

  // Sorting function for submissions
  const getSortedSubmissions = () => {
    if (!lamentSubmissions) return [];

    return [...lamentSubmissions].sort((a, b) => {
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

  const renderFragments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Lament Fragments Archive</h2>
        <button
          onClick={() => openCreateModal()}
          className="cyber-button px-4 py-2 bg-gothic-silver text-gothic-black hover:bg-gothic-silver/80"
        >
          <Plus size={16} className="mr-2" />
          New Fragment
        </button>
      </div>

      <div className="grid gap-6">
        {lamentFragments.map((fragment) => (
          <div key={fragment.id} className="silver-theme p-6 rounded-lg tech-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-gothic text-gothic-silver">{fragment.title}</h3>
                <p className="text-sm text-gothic-steel">By {fragment.author_name} • {new Date(fragment.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  fragment.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {fragment.is_published ? 'published' : 'draft'}
                </span>
              </div>
            </div>
            <p className="text-gothic-steel mb-4">{fragment.content}</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => readFragment(fragment)}
                className="text-gothic-silver hover:text-green-400 text-sm"
              >
                <Eye size={14} className="inline mr-1" />
                Read Full Entry
              </button>
              <button 
                onClick={() => editFragment(fragment)}
                className="text-gothic-silver hover:text-green-400 text-sm"
              >
                <Edit3 size={14} className="inline mr-1" />
                Edit
              </button>
              <button 
                onClick={() => deleteFragment(fragment.id)}
                className="text-gothic-steel hover:text-red-400 text-sm"
              >
                <Trash2 size={14} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
        {lamentFragments.length === 0 && !loading && (
          <div className="silver-theme p-8 rounded-lg tech-border text-center">
            <BookOpen size={48} className="mx-auto text-gothic-silver mb-4" />
            <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Fragments Found</h3>
            <p className="text-gothic-steel mb-4">Create your first Lament Fragment to begin archiving Silver Heights' neural transmissions.</p>
            <button
              onClick={() => openCreateModal()}
              className="cyber-button px-4 py-2 bg-gothic-silver text-gothic-black"
            >
              Create First Fragment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubmissions = () => {
    const sortedSubmissions = getSortedSubmissions();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Neural Report Processing</h2>
          
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
          {sortedSubmissions.map((submission) => (
            <div key={submission.id} className="silver-theme p-6 rounded-lg tech-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-gothic text-gothic-silver">{submission.title}</h3>
                  <p className="text-sm text-gothic-steel">
                    by {submission.profiles?.username || 'Anonymous'} • {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.status === 'approved' 
                      ? 'bg-green-500/20 text-green-400' 
                      : submission.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {submission.status}
                  </span>
                  <span className="text-sm text-gothic-steel">
                    ${submission.tipTotal?.toFixed(2) || '0.00'} ({submission.tips?.length || 0} tips)
                  </span>
                </div>
              </div>
              <p className="text-gothic-steel mb-4">{submission.content}</p>
              <div className="flex space-x-2">
                {submission.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => approveSubmission(submission.id)}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      <Eye size={14} className="inline mr-1" />
                      Approve
                    </button>
                    <button 
                      onClick={() => rejectSubmission(submission.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => deleteSubmission(submission.id)}
                  className="text-gothic-steel hover:text-red-400 text-sm"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {sortedSubmissions.length === 0 && !loading && (
            <div className="silver-theme p-8 rounded-lg tech-border text-center">
              <MessageCircle size={48} className="mx-auto text-gothic-silver mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Neural Reports</h3>
              <p className="text-gothic-steel">No user submissions found. Encourage citizens to submit their experiences!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Consciousness Registry</h2>
      
      <div className="silver-theme p-6 rounded-lg tech-border">
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
                    : 'bg-green-500/20 text-green-400'
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
              <Users size={48} className="mx-auto text-gothic-silver mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Registered Users</h3>
              <p className="text-gothic-steel">No users found in the consciousness registry.</p>
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
          className="flex items-center space-x-2 bg-gothic-silver hover:bg-gray-300 text-gothic-charcoal px-4 py-2 rounded transition-colors"
        >
          <Plus size={20} />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="silver-theme p-6 rounded-lg tech-border">
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
            <div key={announcement.id} className="bg-gothic-dark-gray/30 p-4 rounded">
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
            <div className="silver-theme p-8 rounded-lg tech-border text-center">
              <Megaphone size={48} className="mx-auto text-gothic-silver mb-4" />
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
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Data Archives</h2>
        <button
          onClick={() => setShowDossierCreateModal(true)}
          className="flex items-center space-x-2 bg-gothic-silver hover:bg-gray-300 text-gothic-charcoal px-4 py-2 rounded transition-colors"
        >
          <Plus size={20} />
          <span>New Dossier Entry</span>
        </button>
      </div>

      <div className="silver-theme p-6 rounded-lg tech-border">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gothic-silver">Loading data archives...</div>
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
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold text-gothic-silver hover:text-green-400 cursor-pointer transition-colors"
                    onClick={() => {
                      setReadingDossier(entry);
                      setShowDossierReadModal(true);
                    }}
                    title="Click to read full entry"
                  >
                    {entry.title}
                  </h3>
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
              <Database size={48} className="mx-auto text-gothic-silver mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Archived Entries</h3>
              <p className="text-gothic-steel">No dossier entries found.</p>
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
          <div className="silver-theme p-8 rounded-lg tech-border mb-8">
            <Shield size={48} className="mx-auto text-gothic-silver mb-4" />
            <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text mb-4">
              Silver Heights Command Center
            </h1>
            <p className="text-gothic-steel text-lg">
              Neural network administration interface for Silver Heights consciousness management.
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
                    ? 'bg-gothic-silver text-gothic-black'
                    : 'bg-gothic-charcoal/50 text-gothic-silver hover:bg-gothic-silver/20'
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
          {activeTab === 'fragments' && renderFragments()}
          {activeTab === 'submissions' && renderSubmissions()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'dossier' && renderDossier()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'settings' && (
            <div className="silver-theme p-8 rounded-lg tech-border text-center">
              <Settings size={48} className="mx-auto text-gothic-silver mb-4" />
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">System Parameters</h3>
              <p className="text-gothic-steel">Configure neural network settings and convergence protocols.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gothic-charcoal/30 p-4 rounded">
                  <h4 className="text-gothic-silver font-medium mb-2">Neural Sync Rate</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gothic-charcoal rounded-full h-2">
                      <div className="bg-gothic-silver h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <span className="text-sm text-gothic-steel">87%</span>
                  </div>
                </div>
                <div className="bg-gothic-charcoal/30 p-4 rounded">
                  <h4 className="text-gothic-silver font-medium mb-2">Data Integrity</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gothic-charcoal rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '97%' }}></div>
                    </div>
                    <span className="text-sm text-green-400">97%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {setShowEditModal(false); setEditingItem(null);}}
        title={editingItem?.summary ? 'Edit Dossier Entry' : 'Edit Fragment'}
        theme="silver"
        size="lg"
      >
        {editingItem && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gothic-steel text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                />
              </div>

              {editingItem.summary !== undefined && (
                <>
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">Summary</label>
                    <textarea
                      value={editingItem.summary}
                      onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                      rows={3}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-1">Type</label>
                      <select
                        value={editingItem.type}
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
                        value={editingItem.city}
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
                        value={editingItem.classification}
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
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                  rows={8}
                  className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                />
              </div>

              {editingItem.summary === undefined && (
                <>
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">Author Name</label>
                    <input
                      type="text"
                      value={editingItem.author_name}
                      onChange={(e) => setEditingItem({...editingItem, author_name: e.target.value})}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      className="w-full bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-gothic-steel text-sm font-medium mb-1">Status</label>
                <select
                  value={editingItem.is_published ? 'published' : 'draft'}
                  onChange={(e) => setEditingItem({...editingItem, is_published: e.target.value === 'published'})}
                  className="bg-gothic-charcoal text-gothic-silver border border-gothic-steel rounded px-3 py-2"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {setShowEditModal(false); setEditingItem(null);}}
                className="px-4 py-2 text-gothic-steel hover:text-gothic-silver"
              >
                Cancel
              </button>
              <button
                onClick={editingItem.summary !== undefined ? updateDossierEntry : saveFragmentEdit}
                className="px-4 py-2 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false); 
          setNewFragment({title: '', content: '', author_name: 'Admin', category: 'System Messages'});
          setNewDossier({title: '', summary: '', content: '', type: 'character', city: 'silver', classification: 'public', is_published: true});
        }}
        title={activeTab === 'dossier' ? 'Create New Dossier Entry' : 'Create New Lament Fragment'}
        theme="silver"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gothic-steel mb-2">Title</label>
              <input
                type="text"
                value={activeTab === 'dossier' ? newDossier.title : newFragment.title}
                onChange={(e) => activeTab === 'dossier' 
                  ? setNewDossier({...newDossier, title: e.target.value})
                  : setNewFragment({...newFragment, title: e.target.value})
                }
                className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
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
                    className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50 h-24 resize-none"
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
                      className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
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
                      className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
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
                      className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
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
                value={activeTab === 'dossier' ? newDossier.content : newFragment.content}
                onChange={(e) => activeTab === 'dossier' 
                  ? setNewDossier({...newDossier, content: e.target.value})
                  : setNewFragment({...newFragment, content: e.target.value})
                }
                className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50 h-32 resize-none"
                style={{backgroundColor: '#1a1a1a'}}
                placeholder={activeTab === 'dossier' ? "Enter detailed dossier content..." : "Enter fragment content..."}
              />
            </div>

            {activeTab !== 'dossier' && (
              <>
                <div>
                  <label className="block text-gothic-steel mb-2">Author</label>
                  <input
                    type="text"
                    value={newFragment.author_name}
                    onChange={(e) => setNewFragment({...newFragment, author_name: e.target.value})}
                    className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
                    style={{backgroundColor: '#1a1a1a'}}
                    placeholder="Author name..."
                  />
                </div>
                <div>
                  <label className="block text-gothic-steel mb-2">Category</label>
                  <select
                    value={newFragment.category}
                    onChange={(e) => setNewFragment({...newFragment, category: e.target.value})}
                    className="w-full p-3 border border-gothic-silver/30 rounded text-gothic-silver focus:border-gothic-silver/50"
                    style={{backgroundColor: '#1a1a1a'}}
                  >
                    <option value="System Messages">System Messages</option>
                    <option value="Neural Transmissions">Neural Transmissions</option>
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
                setNewFragment({title: '', content: '', author_name: 'Admin', category: 'System Messages'});
                setNewDossier({title: '', summary: '', content: '', type: 'character', city: 'silver', classification: 'public', is_published: true});
              }}
              className="px-4 py-2 text-gothic-steel rounded hover:opacity-80"
              style={{backgroundColor: '#1a1a1a', border: '1px solid #708090'}}
            >
              Cancel
            </button>
            <button
              onClick={activeTab === 'dossier' ? createDossierEntry : createNewFragment}
              className="px-4 py-2 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80"
            >
              {activeTab === 'dossier' ? 'Create Dossier Entry' : 'Create Fragment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Read Fragment Modal */}
      <Modal
        isOpen={showReadModal && !!readingFragment}
        onClose={() => {setShowReadModal(false); setReadingFragment(null);}}
        title={readingFragment?.title || ''}
        theme="silver"
        size="xl"
      >
        {readingFragment && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                <span>By {readingFragment.author_name}</span>
                <span>•</span>
                <span>{new Date(readingFragment.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="px-2 py-1 rounded text-xs bg-gothic-steel/20">
                  {readingFragment.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  readingFragment.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {readingFragment.is_published ? 'published' : 'draft'}
                </span>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap text-base">
                {readingFragment.content}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gothic-steel/30">
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    setShowReadModal(false);
                    setReadingFragment(null);
                    editFragment(readingFragment);
                  }}
                  className="text-gothic-silver hover:text-green-400 text-sm flex items-center space-x-1"
                >
                  <Edit3 size={14} />
                  <span>Edit Fragment</span>
                </button>
              </div>
              <button
                onClick={() => {setShowReadModal(false); setReadingFragment(null);}}
                className="px-4 py-2 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dossier Create Modal */}
      {/* Dossier Create Modal */}
      <Modal
        isOpen={showDossierCreateModal}
        onClose={() => setShowDossierCreateModal(false)}
        title="Create New Data Archive Entry"
        theme="silver"
        size="lg"
      >
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            createDossierEntry();
          }}>
            <div>
              <label className="block text-sm font-medium text-gothic-silver mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newDossier.title}
                onChange={(e) => setNewDossier({ ...newDossier, title: e.target.value })}
                className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none h-32 resize-none"
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
                  className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                  className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                  className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                className="w-4 h-4 text-gothic-silver bg-gothic-charcoal/50 border-gothic-steel/50 rounded focus:ring-gothic-silver focus:ring-2"
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
                className="px-6 py-3 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80 transition-colors"
              >
                Create Data Archive Entry
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Dossier Edit Modal */}
      {showDossierEditModal && editingDossier && (
        <div className="modal-overlay" onClick={() => setShowDossierEditModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gothic-charcoal rounded-lg border border-gothic-silver shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gothic-steel/30">
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Edit Data Archive Entry</h2>
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
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                      className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none h-32 resize-none"
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
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                        className="w-full p-3 bg-gothic-charcoal/50 border border-gothic-steel/50 rounded text-gothic-silver focus:border-gothic-silver focus:outline-none"
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
                      className="px-6 py-3 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80 transition-colors"
                    >
                      Update Data Archive Entry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dossier Read Modal */}
      {showDossierReadModal && readingDossier && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDossierReadModal(false);
              setReadingDossier(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gothic-charcoal rounded-lg border border-gothic-silver shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={() => {
                  setShowDossierReadModal(false);
                  setReadingDossier(null);
                }}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold ml-4"
                title="Close"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gothic-silver mb-3">Summary</h3>
                <div className="bg-gothic-charcoal/50 p-4 rounded border border-gothic-steel/30">
                  <p className="text-gothic-steel leading-relaxed">{readingDossier.summary}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gothic-silver mb-3">Detailed Report</h3>
                <div className="bg-gothic-charcoal/50 p-4 rounded border border-gothic-steel/30">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap text-base">
                      {readingDossier.content}
                    </div>
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
                  className="text-gothic-silver hover:text-blue-400 text-sm flex items-center space-x-2 px-3 py-2 border border-gothic-steel/30 rounded hover:border-blue-400/50 transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit Archive</span>
                </button>
                <button 
                  onClick={() => deleteDossierEntry(readingDossier.id)}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-2 px-3 py-2 border border-red-400/30 rounded hover:border-red-400/50 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Archive</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setShowDossierReadModal(false);
                  setReadingDossier(null);
                }}
                className="px-4 py-2 bg-gothic-silver text-gothic-black rounded hover:bg-gothic-silver/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Announcement Create Modal */}
      <Modal
        isOpen={showAnnouncementCreateModal}
        onClose={() => setShowAnnouncementCreateModal(false)}
        title="Create New Announcement"
        theme="silver"
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={createAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-gothic text-gothic-steel mb-1">Title</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-gothic text-gothic-steel mb-1">Content</label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement((prev: any) => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none resize-none"
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
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none"
              />
              <p className="text-xs text-gothic-steel mt-1">Higher priority announcements appear first</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gothic-silver text-gothic-charcoal py-2 px-4 rounded hover:bg-gothic-silver/80 transition-colors"
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
        </div>
      </Modal>

      {/* Announcement Edit Modal */}
      <Modal
        isOpen={showAnnouncementEditModal && !!editingAnnouncement}
        onClose={() => {
          setShowAnnouncementEditModal(false);
          setEditingAnnouncement(null);
        }}
        title="Edit Announcement"
        theme="silver"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-gothic text-gothic-steel mb-1">Title</label>
              <input
                type="text"
                value={editingAnnouncement?.title || ''}
                onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-gothic text-gothic-steel mb-1">Content</label>
              <textarea
                value={editingAnnouncement?.content || ''}
                onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-gothic text-gothic-steel mb-1">Priority (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={editingAnnouncement?.priority || 0}
                onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gothic-dark-gray text-gothic-silver border border-gothic-steel rounded px-3 py-2 focus:border-gothic-silver focus:ring-1 focus:ring-gothic-silver outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingAnnouncement?.is_active || false}
                onChange={(e) => setEditingAnnouncement((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                className="text-gothic-silver"
              />
              <label htmlFor="is_active" className="text-sm font-gothic text-gothic-steel">Active</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={updateAnnouncement}
                className="flex-1 bg-gothic-silver text-gothic-charcoal py-2 px-4 rounded hover:bg-gothic-silver/80 transition-colors"
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
        </div>
      </Modal>

      {/* Announcement Read Modal */}
      <Modal
        isOpen={showAnnouncementReadModal && !!readingAnnouncement}
        onClose={() => {
          setShowAnnouncementReadModal(false);
          setReadingAnnouncement(null);
        }}
        title="Announcement Details"
        theme="silver"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-gothic font-bold text-gothic-silver mb-2">{readingAnnouncement?.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-4">
                <span>By: {readingAnnouncement?.profiles?.username}</span>
                <span className={`px-2 py-1 rounded ${
                  readingAnnouncement?.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {readingAnnouncement?.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-1 rounded ${
                  (readingAnnouncement?.priority || 0) >= 3 ? 'bg-red-500/20 text-red-400' 
                  : (readingAnnouncement?.priority || 0) >= 1 ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
                }`}>
                  Priority: {readingAnnouncement?.priority}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-gothic text-gothic-silver mb-2">Content</h4>
              <div className="bg-gothic-dark-gray/50 p-4 rounded border border-gothic-steel/30">
                <p className="text-gothic-steel whitespace-pre-wrap leading-relaxed">{readingAnnouncement?.content}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gothic-steel/30">
              <div className="text-xs text-gothic-steel">
                <p>Created: {readingAnnouncement?.created_at && new Date(readingAnnouncement.created_at).toLocaleString()}</p>
                <p>Updated: {readingAnnouncement?.updated_at && new Date(readingAnnouncement.updated_at).toLocaleString()}</p>
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
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowAnnouncementReadModal(false);
                  setReadingAnnouncement(null);
                }}
                className="px-4 py-2 bg-gothic-silver text-gothic-charcoal rounded hover:bg-gothic-silver/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
