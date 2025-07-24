'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, Users, BarChart3, 
  Settings, MessageCircle, FileText, Shield, BookOpen, Database, Megaphone 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useReadModal } from '@/hooks/useReadModal';
import { useFormModal } from '@/hooks/useModalHooks';
import { FormModal, useConfirmModalComponent } from '@/components/ModalComponents';
import { ReadModal } from '@/components/ReadModal';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [ledgerEntries, setLedgerEntries] = useState<CrimsonLedgerEntry[]>([]);
  const [confessions, setConfessions] = useState<CrimsonConfession[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
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
  const ledgerFormModal = useFormModal<Partial<CrimsonLedgerEntry>>();
  const announcementFormModal = useFormModal<Partial<Announcement>>();
  const dossierFormModal = useFormModal<Partial<DossierEntry>>();
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

  const loadLedgerEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('crimson_ledger_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLedgerEntries(data || []);
    } catch (error) {
      console.error('Error loading ledger entries:', error);
    }
  };

  const loadConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('crimson_confessions')
        .select(`
          *,
          profiles(username)
        `)
        .order('created_at', { ascending: false });
      
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
    ledgerFormModal.openModal({
      id: '',
      title: '',
      excerpt: '',
      content: '',
      author_name: '',
      category: 'Chronicle',
      read_time: '',
      is_published: false,
      created_at: '',
      updated_at: ''
    });
  };

  const handleEditLedgerEntry = (entry: CrimsonLedgerEntry) => {
    ledgerFormModal.openModal(entry);
  };

  const handleSaveLedgerEntry = async () => {
    if (!ledgerFormModal.formData) return;
    
    try {
      ledgerFormModal.setIsSubmitting(true);
      
      const entryData = {
        title: ledgerFormModal.formData.title,
        excerpt: ledgerFormModal.formData.excerpt,
        content: ledgerFormModal.formData.content,
        author_name: ledgerFormModal.formData.author_name,
        category: ledgerFormModal.formData.category,
        read_time: ledgerFormModal.formData.read_time,
        is_published: ledgerFormModal.formData.is_published,
        created_by: user?.id
      };

      if (ledgerFormModal.formData.id) {
        const { error } = await supabase
          .from('crimson_ledger_entries')
          .update(entryData)
          .eq('id', ledgerFormModal.formData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('crimson_ledger_entries')
          .insert([entryData]);
        
        if (error) throw error;
      }

      await loadLedgerEntries();
      ledgerFormModal.closeModal();
      alert('Ledger entry saved successfully');
    } catch (error) {
      console.error('Error saving ledger entry:', error);
      alert('Error saving ledger entry');
    } finally {
      ledgerFormModal.setIsSubmitting(false);
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

  const handleDeleteConfession = async (confessionId: string) => {
    openConfirmModal({
      title: 'Delete Confession',
      message: 'Are you sure you want to delete this confession? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          console.log('Attempting to delete confession:', confessionId);
          const { error } = await supabase
            .from('crimson_confessions')
            .delete()
            .eq('id', confessionId);

          if (error) {
            console.error('Delete error:', error);
            throw error;
          }
          
          console.log('Delete successful, reloading confessions...');
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
  const handleCreateAnnouncement = () => {
    announcementFormModal.openModal({
      id: '',
      title: '',
      content: '',
      author_id: user?.id || '',
      priority: 0,
      is_active: true,
      created_at: ''
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    announcementFormModal.openModal(announcement);
  };

  const handleSaveAnnouncement = async () => {
    if (!announcementFormModal.formData) return;
    
    try {
      announcementFormModal.setIsSubmitting(true);
      
      const announcementData = {
        title: announcementFormModal.formData.title,
        content: announcementFormModal.formData.content,
        author_id: user?.id,
        priority: announcementFormModal.formData.priority || 0,
        is_active: announcementFormModal.formData.is_active || false
      };

      if (announcementFormModal.formData.id) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcementFormModal.formData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData]);
        
        if (error) throw error;
      }

      await loadAnnouncements();
      announcementFormModal.closeModal();
      alert('Announcement saved successfully');
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement');
    } finally {
      announcementFormModal.setIsSubmitting(false);
    }
  };

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
  const handleCreateDossier = () => {
    dossierFormModal.openModal({
      id: '',
      title: '',
      summary: '',
      content: '',
      type: 'character',
      city: 'crimson',
      classification: 'public',
      image_url: '',
      is_published: false,
      created_at: '',
      updated_at: ''
    });
  };

  const handleEditDossier = (dossier: DossierEntry) => {
    dossierFormModal.openModal(dossier);
  };

  const handleSaveDossier = async () => {
    if (!dossierFormModal.formData) return;
    
    try {
      dossierFormModal.setIsSubmitting(true);
      
      const dossierData = {
        title: dossierFormModal.formData.title,
        summary: dossierFormModal.formData.summary,
        content: dossierFormModal.formData.content,
        type: dossierFormModal.formData.type,
        city: dossierFormModal.formData.city || 'crimson',
        classification: dossierFormModal.formData.classification || 'public',
        image_url: dossierFormModal.formData.image_url,
        is_published: dossierFormModal.formData.is_published
      };

      if (dossierFormModal.formData.id) {
        const { error } = await supabase
          .from('dossier_entries')
          .update(dossierData)
          .eq('id', dossierFormModal.formData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dossier_entries')
          .insert([dossierData]);
        
        if (error) throw error;
      }

      await loadDossiers();
      dossierFormModal.closeModal();
      alert('Dossier saved successfully');
    } catch (error) {
      console.error('Error saving dossier:', error);
      alert('Error saving dossier');
    } finally {
      dossierFormModal.setIsSubmitting(false);
    }
  };

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
    </div>
  );

  const renderLedgerEntries = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Crimson Ledger Entries</h2>
        <button
          onClick={handleCreateLedgerEntry}
          className="bg-red-500 hover:bg-red-600 text-gothic-black px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Entry</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-red-500/20 rounded-lg">
          <thead>
            <tr className="border-b border-red-500/20">
              <th className="text-left p-4 text-red-500">Title</th>
              <th className="text-left p-4 text-red-500">Author</th>
              <th className="text-left p-4 text-red-500">Category</th>
              <th className="text-left p-4 text-red-500">Read Time</th>
              <th className="text-left p-4 text-red-500">Status</th>
              <th className="text-left p-4 text-red-500">Created</th>
              <th className="text-left p-4 text-red-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                <td className="p-4 text-gothic-silver/90">{entry.title}</td>
                <td className="p-4 text-gothic-silver/70">{entry.author_name}</td>
                <td className="p-4 text-gothic-silver/70">{entry.category}</td>
                <td className="p-4 text-gothic-silver/70">{entry.read_time || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.is_published 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {entry.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConfessions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-red-500">Crimson Confessions</h2>
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
              <tr key={confession.id} className="border-b border-red-500/10 hover:bg-red-500/5">
                <td className="p-4 text-gothic-silver/90">{confession.title}</td>
                <td className="p-4 text-gothic-silver/70">{confession.author_name}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      confession.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400'
                        : confession.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {confession.status}
                    </span>
                    {confession.status === 'pending' && (
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
                    <button
                      onClick={() => handleDeleteConfession(confession.id)}
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

      {/* Ledger Entry Form Modal */}
      <FormModal
        isOpen={ledgerFormModal.isOpen}
        onClose={ledgerFormModal.closeModal}
        title={ledgerFormModal.formData?.id ? 'Edit Ledger Entry' : 'Create Ledger Entry'}
        onSubmit={handleSaveLedgerEntry}
        submitText={ledgerFormModal.formData?.id ? 'Update Entry' : 'Create Entry'}
        isSubmitting={ledgerFormModal.isSubmitting}
        theme="crimson"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Title
            </label>
            <input
              type="text"
              value={ledgerFormModal.formData?.title || ''}
              onChange={(e) => ledgerFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={ledgerFormModal.formData?.author_name || ''}
              onChange={(e) => ledgerFormModal.updateFormData({ author_name: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Category
            </label>
            <select
              value={ledgerFormModal.formData?.category || 'Chronicle'}
              onChange={(e) => ledgerFormModal.updateFormData({ category: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="Chronicle">Chronicle</option>
              <option value="Investigation">Investigation</option>
              <option value="Mystery">Mystery</option>
              <option value="Revelation">Revelation</option>
              <option value="Conspiracy">Conspiracy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Excerpt
            </label>
            <textarea
              value={ledgerFormModal.formData?.excerpt || ''}
              onChange={(e) => ledgerFormModal.updateFormData({ excerpt: e.target.value })}
              rows={3}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Brief excerpt or summary (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Read Time
            </label>
            <input
              type="text"
              value={ledgerFormModal.formData?.read_time || ''}
              onChange={(e) => ledgerFormModal.updateFormData({ read_time: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="e.g., '5 min read' (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Content
            </label>
            <textarea
              value={ledgerFormModal.formData?.content || ''}
              onChange={(e) => ledgerFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ledger_is_published"
              checked={ledgerFormModal.formData?.is_published || false}
              onChange={(e) => ledgerFormModal.updateFormData({ is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="ledger_is_published" className="text-sm text-red-500">
              Publish immediately
            </label>
          </div>
        </div>
      </FormModal>

      {/* Announcement Form Modal */}
      <FormModal
        isOpen={announcementFormModal.isOpen}
        onClose={announcementFormModal.closeModal}
        title={announcementFormModal.formData?.id ? 'Edit Announcement' : 'Create Announcement'}
        onSubmit={handleSaveAnnouncement}
        submitText={announcementFormModal.formData?.id ? 'Update Announcement' : 'Create Announcement'}
        isSubmitting={announcementFormModal.isSubmitting}
        theme="crimson"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Title
            </label>
            <input
              type="text"
              value={announcementFormModal.formData?.title || ''}
              onChange={(e) => announcementFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Priority (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={announcementFormModal.formData?.priority || 0}
              onChange={(e) => announcementFormModal.updateFormData({ priority: parseInt(e.target.value) || 0 })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <p className="text-xs text-red-400 mt-1">Higher numbers = higher priority. Values over 5 marked as high priority.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Content
            </label>
            <textarea
              value={announcementFormModal.formData?.content || ''}
              onChange={(e) => announcementFormModal.updateFormData({ content: e.target.value })}
              rows={6}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="crimson_announcement_is_active"
              checked={announcementFormModal.formData?.is_active || false}
              onChange={(e) => announcementFormModal.updateFormData({ is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="crimson_announcement_is_active" className="text-sm text-red-500">
              Active
            </label>
          </div>
        </div>
      </FormModal>

      {/* Dossier Form Modal */}
      <FormModal
        isOpen={dossierFormModal.isOpen}
        onClose={dossierFormModal.closeModal}
        title={dossierFormModal.formData?.id ? 'Edit Dossier' : 'Create Dossier'}
        onSubmit={handleSaveDossier}
        submitText={dossierFormModal.formData?.id ? 'Update Dossier' : 'Create Dossier'}
        isSubmitting={dossierFormModal.isSubmitting}
        theme="crimson"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Title
            </label>
            <input
              type="text"
              value={dossierFormModal.formData?.title || ''}
              onChange={(e) => dossierFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Summary
            </label>
            <textarea
              value={dossierFormModal.formData?.summary || ''}
              onChange={(e) => dossierFormModal.updateFormData({ summary: e.target.value })}
              rows={3}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Brief summary of the dossier entry"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Type
            </label>
            <select
              value={dossierFormModal.formData?.type || 'character'}
              onChange={(e) => dossierFormModal.updateFormData({ type: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="character">Character</option>
              <option value="location">Location</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              City
            </label>
            <select
              value={dossierFormModal.formData?.city || 'crimson'}
              onChange={(e) => dossierFormModal.updateFormData({ city: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="crimson">Crimson</option>
              <option value="silver">Silver</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Classification
            </label>
            <select
              value={dossierFormModal.formData?.classification || 'public'}
              onChange={(e) => dossierFormModal.updateFormData({ classification: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="public">Public</option>
              <option value="confidential">Confidential</option>
              <option value="secret">Secret</option>
              <option value="top-secret">Top Secret</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={dossierFormModal.formData?.image_url || ''}
              onChange={(e) => dossierFormModal.updateFormData({ image_url: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-2">
              Content
            </label>
            <textarea
              value={dossierFormModal.formData?.content || ''}
              onChange={(e) => dossierFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="crimson_dossier_is_published"
              checked={dossierFormModal.formData?.is_published || false}
              onChange={(e) => dossierFormModal.updateFormData({ is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="crimson_dossier_is_published" className="text-sm text-red-500">
              Publish immediately
            </label>
          </div>
        </div>
      </FormModal>

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
