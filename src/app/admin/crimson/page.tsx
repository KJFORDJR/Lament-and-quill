'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, Users, BarChart3, 
  Settings, MessageCircle, FileText, Shield, BookOpen, Database, Megaphone, ArrowUpDown 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useReadModal } from '@/hooks/useReadModal';
import { useConfirmModalComponent } from '@/components/ModalComponents';
import { ReadModal } from '@/components/ReadModal';
import { DragDropTable } from '@/components/DragDropTable';

interface CrimsonLedgerEntry {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author_name: string;
  category: string;
  read_time?: string;
  is_published: boolean;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  display_order?: number;
}

interface CrimsonConfession {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: string;
  author_name: string;
  tip_count: number;
  total_tip_amount: number;
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

interface DossierEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: string;
  city: string;
  classification: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminStats {
  totalLedgerEntries: number;
  totalConfessions: number;
  totalUsers: number;
  totalAnnouncements: number;
  totalDossiers: number;
}

export default function CrimsonAdminPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [ledgerEntries, setLedgerEntries] = useState<CrimsonLedgerEntry[]>([]);
  const [confessions, setConfessions] = useState<CrimsonConfession[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [showDeletedConfessions, setShowDeletedConfessions] = useState(false);
  const [isReorderingLedger, setIsReorderingLedger] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalLedgerEntries: 0,
    totalConfessions: 0,
    totalUsers: 0,
    totalAnnouncements: 0,
    totalDossiers: 0
  });

  // Modal hooks
  const ledgerReadModal = useReadModal<CrimsonLedgerEntry>();
  const confessionReadModal = useReadModal<CrimsonConfession>();
  const { ConfirmModalComponent, openConfirmModal } = useConfirmModalComponent();

  const loadData = useCallback(async () => {
    await Promise.all([
      loadLedgerEntries(),
      loadConfessions(),
      loadAnnouncements(),
      loadDossiers(),
      loadStats()
    ]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload confessions when toggling deleted view
  useEffect(() => {
    loadConfessions();
  }, [showDeletedConfessions]);

  const loadLedgerEntries = async () => {
    try {
      // Try to order by display_order first, fall back to created_at if column doesn't exist
      let query = supabase
        .from('crimson_ledger_entries')
        .select('*');
      
      try {
        const { data, error } = await query.order('display_order', { ascending: true });
        if (error && error.message.includes('column "display_order" does not exist')) {
          // Fall back to created_at ordering
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('crimson_ledger_entries')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          setLedgerEntries(fallbackData || []);
        } else {
          if (error) throw error;
          setLedgerEntries(data || []);
        }
      } catch (err) {
        // If ordering by display_order fails, use created_at
        const { data, error } = await supabase
          .from('crimson_ledger_entries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLedgerEntries(data || []);
      }
    } catch (error) {
      console.error('Error loading ledger entries:', error);
    }
  };

  const loadConfessions = async () => {
    try {
      let query = supabase
        .from('crimson_confessions')
        .select(`
          *,
          profiles(username)
        `);
      
      // Filter based on whether we want to show deleted confessions
      if (!showDeletedConfessions) {
        query = query.neq('is_deleted', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const confessionsWithAuthor = data?.map(confession => ({
        ...confession,
        author_name: confession.profiles?.username || 'Anonymous'
      })) || [];
      
      setConfessions(confessionsWithAuthor);
    } catch (error) {
      console.error('Error loading confessions:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleLedgerReorder = async (reorderedEntries: CrimsonLedgerEntry[]) => {
    // Update local state immediately for better UX
    setLedgerEntries(reorderedEntries);
    
    try {
      // Get user token for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/admin/crimson/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reorderedItems: reorderedEntries.map(entry => ({ id: entry.id })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating ledger order:', error);
      // Reload entries on error to restore correct order
      loadLedgerEntries();
    }
  };

  const loadDossiers = async () => {
    try {
      const { data, error } = await supabase
        .from('dossier_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDossiers(data || []);
    } catch (error) {
      console.error('Error loading dossiers:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [ledgerCount, confessionsCount, usersCount, announcementsCount, dossiersCount] = await Promise.all([
        supabase.from('crimson_ledger_entries').select('*', { count: 'exact', head: true }),
        supabase.from('crimson_confessions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('dossier_entries').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalLedgerEntries: ledgerCount.count || 0,
        totalConfessions: confessionsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalAnnouncements: announcementsCount.count || 0,
        totalDossiers: dossiersCount.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Ledger entry handlers
  const handleCreateLedgerEntry = () => {
    router.push('/admin/crimson/create');
  };

  const handleEditLedgerEntry = (entry: CrimsonLedgerEntry) => {
    router.push(`/admin/crimson/edit/${entry.id}`);
  };

  // Announcement handlers
  const handleCreateAnnouncement = () => {
    router.push('/admin/crimson/announcement/create');
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    router.push(`/admin/crimson/announcement/edit/${announcement.id}`);
  };

  // Dossier handlers
  const handleCreateDossier = () => {
    router.push('/admin/crimson/dossier/create');
  };

  const handleEditDossier = (dossier: DossierEntry) => {
    router.push(`/admin/crimson/dossier/edit/${dossier.id}`);
  };

  const runMigration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('You must be logged in to run migrations');
        return;
      }

      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Migration failed');
      }

      const result = await response.json();
      alert(`Migration completed successfully! Updated ${result.crimsonEntriesUpdated} crimson entries and ${result.fragmentEntriesUpdated} fragment entries.`);
      
      // Reload data to use the new ordering
      await loadData();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Please check the console for details.');
    }
  };

  const handleDeleteLedgerEntry = async (entryId: string) => {
    openConfirmModal({
      title: 'Delete Ledger Entry',
      message: 'Are you sure you want to delete this ledger entry? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('crimson_ledger_entries')
            .delete()
            .eq('id', entryId);

          if (error) throw error;
          loadLedgerEntries();
        } catch (error) {
          console.error('Error deleting ledger entry:', error);
          alert('Error deleting ledger entry');
        }
      }
    });
  };

  const handleReadLedgerEntry = (entry: CrimsonLedgerEntry) => {
    ledgerReadModal.openModal(entry);
  };

  const handleReadConfession = (confession: CrimsonConfession) => {
    confessionReadModal.openModal(confession);
  };

  const handleRestoreConfession = async (confessionId: string) => {
    try {
      const { error } = await supabase
        .from('crimson_confessions')
        .update({ 
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          status: 'pending' // Reset to pending for review
        })
        .eq('id', confessionId);

      if (error) throw error;
      await loadConfessions();
      await loadStats();
      alert('Confession restored successfully');
    } catch (error) {
      console.error('Error restoring confession:', error);
      alert('Error restoring confession');
    }
  };

  const handleDeleteConfession = async (confessionId: string) => {
    openConfirmModal({
      title: 'Delete Confession',
      message: 'Are you sure you want to delete this confession? This will hide it from users but preserve the data for records.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          console.log('Attempting to soft delete confession:', confessionId);
          
          // Soft delete - mark as deleted but preserve data
          const { error } = await supabase
            .from('crimson_confessions')
            .update({ 
              is_deleted: true,
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id,
              status: 'deleted' // Update status to reflect deletion
            })
            .eq('id', confessionId);

          if (error) {
            console.error('Delete error:', error);
            throw error;
          }
          
          console.log('Soft delete successful, reloading confessions...');
          await loadConfessions();
          await loadStats(); // Also refresh stats
          alert('Confession deleted successfully');
        } catch (error) {
          console.error('Error deleting confession:', error);
          alert(`Error deleting confession: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    });
  };

  const handleUpdateConfessionStatus = async (confessionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('crimson_confessions')
        .update({ status: newStatus })
        .eq('id', confessionId);

      if (error) throw error;
      loadConfessions();
      alert(`Confession ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating confession status:', error);
      alert('Error updating confession status');
    }
  };

  // Announcement handlers
  const handleDeleteAnnouncement = async (announcementId: string) => {
    openConfirmModal({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);

          if (error) throw error;
          loadAnnouncements();
        } catch (error) {
          console.error('Error deleting announcement:', error);
          alert('Error deleting announcement');
        }
      }
    });
  };

  // Dossier handlers  
  const handleDeleteDossier = async (dossierId: string) => {
    openConfirmModal({
      title: 'Delete Dossier',
      message: 'Are you sure you want to delete this dossier? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('dossier_entries')
            .delete()
            .eq('id', dossierId);

          if (error) throw error;
          loadDossiers();
        } catch (error) {
          console.error('Error deleting dossier:', error);
          alert('Error deleting dossier');
        }
      }
    });
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold text-red-500">{stats.totalLedgerEntries}</span>
          </div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Ledger Entries</h3>
          <p className="text-sm text-red-400/70">Total published entries</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageCircle className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold text-red-500">{stats.totalConfessions}</span>
          </div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Confessions</h3>
          <p className="text-sm text-red-400/70">User confessions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold text-red-500">{stats.totalUsers}</span>
          </div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Users</h3>
          <p className="text-sm text-red-400/70">Registered users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Megaphone className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold text-red-500">{stats.totalAnnouncements}</span>
          </div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Announcements</h3>
          <p className="text-sm text-red-400/70">Published announcements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold text-red-500">{stats.totalDossiers}</span>
          </div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Dossiers</h3>
          <p className="text-sm text-red-400/70">Investigation entries</p>
        </motion.div>
      </div>

      {/* Admin Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-red-500 mb-4">Admin Tools</h3>
        <div className="flex space-x-4">
          <button
            onClick={runMigration}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Add Display Order Columns</span>
          </button>
        </div>
        <p className="text-sm text-red-400/70 mt-2">
          This migration adds display_order columns to enable drag-and-drop reordering functionality.
        </p>
      </motion.div>
    </div>
  );

  const renderLedgerEntries = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Crimson Ledger Entries</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsReorderingLedger(!isReorderingLedger)}
            className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
              isReorderingLedger 
                ? 'bg-green-500 hover:bg-green-600 text-gothic-black' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{isReorderingLedger ? 'Finish Reordering' : 'Reorder'}</span>
          </button>
          <button
            onClick={handleCreateLedgerEntry}
            className="bg-red-500 hover:bg-red-600 text-gothic-black px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Entry</span>
          </button>
        </div>
      </div>

      <DragDropTable
        items={ledgerEntries}
        onReorder={handleLedgerReorder}
        isReordering={isReorderingLedger}
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (entry: CrimsonLedgerEntry) => (
              <span className="text-gothic-silver/90">{entry.title}</span>
            ),
          },
          {
            key: 'author',
            header: 'Author',
            render: (entry: CrimsonLedgerEntry) => (
              <span className="text-gothic-silver/70">{entry.author_name}</span>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (entry: CrimsonLedgerEntry) => (
              <span className="text-gothic-silver/70">{entry.category}</span>
            ),
          },
          {
            key: 'read_time',
            header: 'Read Time',
            render: (entry: CrimsonLedgerEntry) => (
              <span className="text-gothic-silver/70">{entry.read_time || 'N/A'}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (entry: CrimsonLedgerEntry) => (
              <span className={`px-2 py-1 rounded text-xs ${
                entry.is_published 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {entry.is_published ? 'Published' : 'Draft'}
              </span>
            ),
          },
          {
            key: 'created',
            header: 'Created',
            render: (entry: CrimsonLedgerEntry) => (
              <span className="text-gothic-silver/70">
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        actionsColumn={(entry: CrimsonLedgerEntry) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleReadLedgerEntry(entry)}
              className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditLedgerEntry(entry)}
              className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteLedgerEntry(entry.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />
    </div>
  );

  const renderConfessions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Crimson Confessions</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDeletedConfessions(!showDeletedConfessions)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-md transition-all duration-200 text-sm"
          >
            {showDeletedConfessions ? 'Hide Deleted' : 'Show Deleted'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-red-500/20 rounded-lg">
          <thead>
            <tr className="border-b border-red-500/20">
              <th className="text-left p-4 text-red-500">Title</th>
              <th className="text-left p-4 text-red-500">Author</th>
              <th className="text-left p-4 text-red-500">Status</th>
              <th className="text-left p-4 text-red-500">Tips</th>
              <th className="text-left p-4 text-red-500">Total Amount</th>
              <th className="text-left p-4 text-red-500">Submitted</th>
              <th className="text-left p-4 text-red-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {confessions.map((confession) => (
              <tr key={confession.id} className={`border-b border-red-500/10 hover:bg-red-500/5 ${
                confession.is_deleted ? 'opacity-50 bg-red-500/10' : ''
              }`}>
                <td className="p-4 text-gothic-silver/90">
                  {confession.title}
                  {confession.is_deleted && (
                    <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      DELETED
                    </span>
                  )}
                </td>
                <td className="p-4 text-gothic-silver/70">{confession.author_name}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      confession.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400'
                        : confession.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : confession.status === 'deleted'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {confession.status}
                    </span>
                    {confession.status === 'pending' && !confession.is_deleted && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleUpdateConfessionStatus(confession.id, 'approved')}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateConfessionStatus(confession.id, 'rejected')}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gothic-silver/70">{confession.tip_count || 0}</td>
                <td className="p-4 text-gothic-silver/70">${(confession.total_tip_amount || 0).toFixed(2)}</td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(confession.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReadConfession(confession)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {confession.is_deleted ? (
                      <button
                        onClick={() => handleRestoreConfession(confession.id)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Restore confession"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteConfession(confession.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Announcements</h2>
        <button
          onClick={handleCreateAnnouncement}
          className="bg-red-500 hover:bg-red-600 text-gothic-black px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-red-500/20 rounded-lg">
          <thead>
            <tr className="border-b border-red-500/20">
              <th className="text-left p-4 text-red-500">Title</th>
              <th className="text-left p-4 text-red-500">Priority</th>
              <th className="text-left p-4 text-red-500">Status</th>
              <th className="text-left p-4 text-red-500">Created</th>
              <th className="text-left p-4 text-red-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                <td className="p-4 text-gothic-silver/90">{announcement.title}</td>
                <td className="p-4 text-gothic-silver/70">{announcement.priority}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    announcement.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDossiers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Dossier Entries</h2>
        <button
          onClick={handleCreateDossier}
          className="bg-red-500 hover:bg-red-600 text-gothic-black px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dossier</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-red-500/20 rounded-lg">
          <thead>
            <tr className="border-b border-red-500/20">
              <th className="text-left p-4 text-red-500">Title</th>
              <th className="text-left p-4 text-red-500">Type</th>
              <th className="text-left p-4 text-red-500">City</th>
              <th className="text-left p-4 text-red-500">Classification</th>
              <th className="text-left p-4 text-red-500">Status</th>
              <th className="text-left p-4 text-red-500">Created</th>
              <th className="text-left p-4 text-red-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((dossier) => (
              <tr key={dossier.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                <td className="p-4 text-gothic-silver/90">{dossier.title}</td>
                <td className="p-4 text-gothic-silver/70 capitalize">{dossier.type}</td>
                <td className="p-4 text-gothic-silver/70 capitalize">{dossier.city}</td>
                <td className="p-4 text-gothic-silver/70 capitalize">{dossier.classification}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    dossier.is_published 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {dossier.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(dossier.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditDossier(dossier)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDossier(dossier.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverview();
      case 'ledger':
        return renderLedgerEntries();
      case 'confessions':
        return renderConfessions();
      case 'announcements':
        return renderAnnouncements();
      case 'dossiers':
        return renderDossiers();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gothic-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-red-500 mb-2">Crimson Admin Panel</h1>
          <p className="text-red-400/70">Manage crimson ledger entries, confessions, and content</p>
        </motion.div>

        <div className="bg-gothic-charcoal border border-red-500/20 rounded-lg mb-8">
          <div className="flex flex-wrap border-b border-red-500/20">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'ledger', label: 'Ledger', icon: BookOpen },
              { id: 'confessions', label: 'Confessions', icon: MessageCircle },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'dossiers', label: 'Dossiers', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-500/10 text-red-500 border-b-2 border-red-500'
                    : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/5'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Read Modals */}
      <ReadModal
        isOpen={ledgerReadModal.isOpen}
        onClose={ledgerReadModal.closeModal}
        title={ledgerReadModal.selectedItem?.title || 'Reading Ledger Entry'}
        theme="crimson"
        size="xl"
        author={ledgerReadModal.selectedItem?.author_name}
        category={ledgerReadModal.selectedItem?.category}
        publishedAt={ledgerReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-red-500 max-w-none">
            {ledgerReadModal.selectedItem?.content}
          </div>
        </div>
      </ReadModal>

      <ReadModal
        isOpen={confessionReadModal.isOpen}
        onClose={confessionReadModal.closeModal}
        title={confessionReadModal.selectedItem?.title || 'Reading Confession'}
        theme="crimson"
        size="xl"
        author={confessionReadModal.selectedItem?.author_name}
        publishedAt={confessionReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-red-500 max-w-none">
            {confessionReadModal.selectedItem?.content}
          </div>
          {confessionReadModal.selectedItem && (
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <div className="flex justify-between items-center text-sm text-red-400">
                <span>Tips: {confessionReadModal.selectedItem.tip_count || 0}</span>
                <span>Total Amount: ${(confessionReadModal.selectedItem.total_tip_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </ReadModal>

      {/* Confirmation Modal */}
      {ConfirmModalComponent}
    </div>
  );
}
