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

interface LamentFragment {
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

interface LamentSubmission {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: string;
  author_name: string;
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
  totalFragments: number;
  totalSubmissions: number;
  totalUsers: number;
  totalAnnouncements: number;
  totalDossiers: number;
}

export default function SilverAdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [fragments, setFragments] = useState<LamentFragment[]>([]);
  const [submissions, setSubmissions] = useState<LamentSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalFragments: 0,
    totalSubmissions: 0,
    totalUsers: 0,
    totalAnnouncements: 0,
    totalDossiers: 0
  });

  // Modal hooks
  const fragmentReadModal = useReadModal<LamentFragment>();
  const submissionReadModal = useReadModal<LamentSubmission>();
  const fragmentFormModal = useFormModal<Partial<LamentFragment>>();
  const announcementFormModal = useFormModal<Partial<Announcement>>();
  const dossierFormModal = useFormModal<Partial<DossierEntry>>();
  const { ConfirmModalComponent, openConfirmModal } = useConfirmModalComponent();

  const loadData = useCallback(async () => {
    await Promise.all([
      loadFragments(),
      loadSubmissions(),
      loadAnnouncements(),
      loadDossiers(),
      loadStats()
    ]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadFragments = async () => {
    try {
      const { data, error } = await supabase
        .from('lament_fragments_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFragments(data || []);
    } catch (error) {
      console.error('Error loading fragments:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('lament_submissions')
        .select(`
          *,
          profiles(username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const submissionsWithAuthor = data?.map(submission => ({
        ...submission,
        author_name: submission.profiles?.username || 'Unknown'
      })) || [];
      
      setSubmissions(submissionsWithAuthor);
    } catch (error) {
      console.error('Error loading submissions:', error);
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
      const [fragmentsCount, submissionsCount, usersCount, announcementsCount, dossiersCount] = await Promise.all([
        supabase.from('lament_fragments_entries').select('*', { count: 'exact', head: true }),
        supabase.from('lament_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('dossier_entries').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalFragments: fragmentsCount.count || 0,
        totalSubmissions: submissionsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalAnnouncements: announcementsCount.count || 0,
        totalDossiers: dossiersCount.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Fragment handlers
  const handleCreateFragment = () => {
    fragmentFormModal.openModal({
      id: '',
      title: '',
      excerpt: '',
      content: '',
      author_name: '',
      category: 'Transmissions',
      read_time: '',
      is_published: false,
      created_at: '',
      updated_at: ''
    });
  };

  const handleEditFragment = (fragment: LamentFragment) => {
    fragmentFormModal.openModal(fragment);
  };

  const handleSaveFragment = async () => {
    if (!fragmentFormModal.formData) return;
    
    try {
      fragmentFormModal.setIsSubmitting(true);
      
      const fragmentData = {
        title: fragmentFormModal.formData.title,
        excerpt: fragmentFormModal.formData.excerpt,
        content: fragmentFormModal.formData.content,
        author_name: fragmentFormModal.formData.author_name,
        category: fragmentFormModal.formData.category,
        read_time: fragmentFormModal.formData.read_time,
        is_published: fragmentFormModal.formData.is_published,
        created_by: user?.id
      };

      if (fragmentFormModal.formData.id) {
        const { error } = await supabase
          .from('lament_fragments_entries')
          .update(fragmentData)
          .eq('id', fragmentFormModal.formData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lament_fragments_entries')
          .insert([fragmentData]);
        
        if (error) throw error;
      }

      await loadFragments();
      fragmentFormModal.closeModal();
      alert('Fragment saved successfully');
    } catch (error) {
      console.error('Error saving fragment:', error);
      alert('Error saving fragment');
    } finally {
      fragmentFormModal.setIsSubmitting(false);
    }
  };

  const handleDeleteFragment = async (fragmentId: string) => {
    openConfirmModal({
      title: 'Delete Fragment',
      message: 'Are you sure you want to delete this fragment? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('lament_fragments_entries')
            .delete()
            .eq('id', fragmentId);

          if (error) throw error;
          loadFragments();
        } catch (error) {
          console.error('Error deleting fragment:', error);
          alert('Error deleting fragment');
        }
      }
    });
  };

  const handleReadFragment = (fragment: LamentFragment) => {
    fragmentReadModal.openModal(fragment);
  };

  const handleReadSubmission = (submission: LamentSubmission) => {
    submissionReadModal.openModal(submission);
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    openConfirmModal({
      title: 'Delete Submission',
      message: 'Are you sure you want to delete this submission? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('lament_submissions')
            .delete()
            .eq('id', submissionId);

          if (error) throw error;
          loadSubmissions();
        } catch (error) {
          console.error('Error deleting submission:', error);
          alert('Error deleting submission');
        }
      }
    });
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
      city: 'silver',
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
        city: dossierFormModal.formData.city || 'silver',
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
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 text-gothic-silver" />
            <span className="text-3xl font-bold text-gothic-silver">{stats.totalFragments}</span>
          </div>
          <h3 className="text-lg font-semibold text-gothic-silver mb-2">Fragments</h3>
          <p className="text-sm text-gothic-silver/70">Total published fragments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-gothic-silver" />
            <span className="text-3xl font-bold text-gothic-silver">{stats.totalSubmissions}</span>
          </div>
          <h3 className="text-lg font-semibold text-gothic-silver mb-2">Submissions</h3>
          <p className="text-sm text-gothic-silver/70">User submissions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-gothic-silver" />
            <span className="text-3xl font-bold text-gothic-silver">{stats.totalUsers}</span>
          </div>
          <h3 className="text-lg font-semibold text-gothic-silver mb-2">Users</h3>
          <p className="text-sm text-gothic-silver/70">Registered users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Megaphone className="h-8 w-8 text-gothic-silver" />
            <span className="text-3xl font-bold text-gothic-silver">{stats.totalAnnouncements}</span>
          </div>
          <h3 className="text-lg font-semibold text-gothic-silver mb-2">Announcements</h3>
          <p className="text-sm text-gothic-silver/70">Published announcements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="h-8 w-8 text-gothic-silver" />
            <span className="text-3xl font-bold text-gothic-silver">{stats.totalDossiers}</span>
          </div>
          <h3 className="text-lg font-semibold text-gothic-silver mb-2">Dossiers</h3>
          <p className="text-sm text-gothic-silver/70">Investigation entries</p>
        </motion.div>
      </div>
    </div>
  );

  const renderFragments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gothic-silver">Lament Fragments</h2>
        <button
          onClick={handleCreateFragment}
          className="bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Fragment</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-gothic-silver/20 rounded-lg">
          <thead>
            <tr className="border-b border-gothic-silver/20">
              <th className="text-left p-4 text-gothic-silver">Title</th>
              <th className="text-left p-4 text-gothic-silver">Author</th>
              <th className="text-left p-4 text-gothic-silver">Category</th>
              <th className="text-left p-4 text-gothic-silver">Read Time</th>
              <th className="text-left p-4 text-gothic-silver">Status</th>
              <th className="text-left p-4 text-gothic-silver">Created</th>
              <th className="text-left p-4 text-gothic-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fragments.map((fragment) => (
              <tr key={fragment.id} className="border-b border-gothic-silver/10 hover:bg-gothic-steel/10">
                <td className="p-4 text-gothic-silver/90">{fragment.title}</td>
                <td className="p-4 text-gothic-silver/70">{fragment.author_name}</td>
                <td className="p-4 text-gothic-silver/70">{fragment.category}</td>
                <td className="p-4 text-gothic-silver/70">{fragment.read_time || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    fragment.is_published 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {fragment.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(fragment.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReadFragment(fragment)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditFragment(fragment)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFragment(fragment.id)}
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

  const renderSubmissions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gothic-silver">User Submissions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-gothic-silver/20 rounded-lg">
          <thead>
            <tr className="border-b border-gothic-silver/20">
              <th className="text-left p-4 text-gothic-silver">Title</th>
              <th className="text-left p-4 text-gothic-silver">Author</th>
              <th className="text-left p-4 text-gothic-silver">Status</th>
              <th className="text-left p-4 text-gothic-silver">Submitted</th>
              <th className="text-left p-4 text-gothic-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b border-gothic-silver/10 hover:bg-gothic-steel/10">
                <td className="p-4 text-gothic-silver/90">{submission.title}</td>
                <td className="p-4 text-gothic-silver/70">{submission.author_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.status === 'approved' 
                      ? 'bg-green-500/20 text-green-400'
                      : submission.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {submission.status}
                  </span>
                </td>
                <td className="p-4 text-gothic-silver/70">
                  {new Date(submission.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReadSubmission(submission)}
                      className="text-gothic-silver/70 hover:text-gothic-silver transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubmission(submission.id)}
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
        <h2 className="text-2xl font-bold text-gothic-silver">Announcements</h2>
        <button
          onClick={handleCreateAnnouncement}
          className="bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-gothic-silver/20 rounded-lg">
          <thead>
            <tr className="border-b border-gothic-silver/20">
              <th className="text-left p-4 text-gothic-silver">Title</th>
              <th className="text-left p-4 text-gothic-silver">Priority</th>
              <th className="text-left p-4 text-gothic-silver">Status</th>
              <th className="text-left p-4 text-gothic-silver">Created</th>
              <th className="text-left p-4 text-gothic-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="border-b border-gothic-silver/10 hover:bg-gothic-steel/10">
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
        <h2 className="text-2xl font-bold text-gothic-silver">Dossier Entries</h2>
        <button
          onClick={handleCreateDossier}
          className="bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Dossier</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gothic-charcoal border border-gothic-silver/20 rounded-lg">
          <thead>
            <tr className="border-b border-gothic-silver/20">
              <th className="text-left p-4 text-gothic-silver">Title</th>
              <th className="text-left p-4 text-gothic-silver">Type</th>
              <th className="text-left p-4 text-gothic-silver">City</th>
              <th className="text-left p-4 text-gothic-silver">Classification</th>
              <th className="text-left p-4 text-gothic-silver">Status</th>
              <th className="text-left p-4 text-gothic-silver">Created</th>
              <th className="text-left p-4 text-gothic-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((dossier) => (
              <tr key={dossier.id} className="border-b border-gothic-silver/10 hover:bg-gothic-steel/10">
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
      case 'fragments':
        return renderFragments();
      case 'submissions':
        return renderSubmissions();
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
          <h1 className="text-4xl font-bold text-gothic-silver mb-2">Silver Admin Panel</h1>
          <p className="text-gothic-silver/70">Manage lament fragments, submissions, and content</p>
        </motion.div>

        <div className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg mb-8">
          <div className="flex flex-wrap border-b border-gothic-silver/20">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'fragments', label: 'Fragments', icon: BookOpen },
              { id: 'submissions', label: 'Submissions', icon: FileText },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'dossiers', label: 'Dossiers', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gothic-silver/10 text-gothic-silver border-b-2 border-gothic-silver'
                    : 'text-gothic-silver/70 hover:text-gothic-silver hover:bg-gothic-steel/10'
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

      {/* Fragment Form Modal */}
      <FormModal
        isOpen={fragmentFormModal.isOpen}
        onClose={fragmentFormModal.closeModal}
        title={fragmentFormModal.formData?.id ? 'Edit Fragment' : 'Create Fragment'}
        onSubmit={handleSaveFragment}
        submitText={fragmentFormModal.formData?.id ? 'Update Fragment' : 'Create Fragment'}
        isSubmitting={fragmentFormModal.isSubmitting}
        theme="silver"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Title
            </label>
            <input
              type="text"
              value={fragmentFormModal.formData?.title || ''}
              onChange={(e) => fragmentFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={fragmentFormModal.formData?.author_name || ''}
              onChange={(e) => fragmentFormModal.updateFormData({ author_name: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Category
            </label>
            <select
              value={fragmentFormModal.formData?.category || 'Transmissions'}
              onChange={(e) => fragmentFormModal.updateFormData({ category: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
            >
              <option value="Transmissions">Transmissions</option>
              <option value="Lament">Lament</option>
              <option value="Reflection">Reflection</option>
              <option value="Memory">Memory</option>
              <option value="Sorrow">Sorrow</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Excerpt
            </label>
            <textarea
              value={fragmentFormModal.formData?.excerpt || ''}
              onChange={(e) => fragmentFormModal.updateFormData({ excerpt: e.target.value })}
              rows={3}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              placeholder="Brief excerpt or summary (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Read Time
            </label>
            <input
              type="text"
              value={fragmentFormModal.formData?.read_time || ''}
              onChange={(e) => fragmentFormModal.updateFormData({ read_time: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              placeholder="e.g., '5 min read' (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Content
            </label>
            <textarea
              value={fragmentFormModal.formData?.content || ''}
              onChange={(e) => fragmentFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              checked={fragmentFormModal.formData?.is_published || false}
              onChange={(e) => fragmentFormModal.updateFormData({ is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_published" className="text-sm text-gothic-silver">
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
        theme="silver"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Title
            </label>
            <input
              type="text"
              value={announcementFormModal.formData?.title || ''}
              onChange={(e) => announcementFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Priority (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={announcementFormModal.formData?.priority || 0}
              onChange={(e) => announcementFormModal.updateFormData({ priority: parseInt(e.target.value) || 0 })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
            />
            <p className="text-xs text-gothic-steel mt-1">Higher numbers = higher priority. Values over 5 marked as high priority.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Content
            </label>
            <textarea
              value={announcementFormModal.formData?.content || ''}
              onChange={(e) => announcementFormModal.updateFormData({ content: e.target.value })}
              rows={6}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="announcement_is_active"
              checked={announcementFormModal.formData?.is_active || false}
              onChange={(e) => announcementFormModal.updateFormData({ is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="announcement_is_active" className="text-sm text-gothic-silver">
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
        theme="silver"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Title
            </label>
            <input
              type="text"
              value={dossierFormModal.formData?.title || ''}
              onChange={(e) => dossierFormModal.updateFormData({ title: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Summary
            </label>
            <textarea
              value={dossierFormModal.formData?.summary || ''}
              onChange={(e) => dossierFormModal.updateFormData({ summary: e.target.value })}
              rows={3}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              placeholder="Brief summary of the dossier entry"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Type
            </label>
            <select
              value={dossierFormModal.formData?.type || 'character'}
              onChange={(e) => dossierFormModal.updateFormData({ type: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
            >
              <option value="character">Character</option>
              <option value="location">Location</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              City
            </label>
            <select
              value={dossierFormModal.formData?.city || 'silver'}
              onChange={(e) => dossierFormModal.updateFormData({ city: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
            >
              <option value="silver">Silver</option>
              <option value="crimson">Crimson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Classification
            </label>
            <select
              value={dossierFormModal.formData?.classification || 'public'}
              onChange={(e) => dossierFormModal.updateFormData({ classification: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
            >
              <option value="public">Public</option>
              <option value="confidential">Confidential</option>
              <option value="secret">Secret</option>
              <option value="top-secret">Top Secret</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={dossierFormModal.formData?.image_url || ''}
              onChange={(e) => dossierFormModal.updateFormData({ image_url: e.target.value })}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Content
            </label>
            <textarea
              value={dossierFormModal.formData?.content || ''}
              onChange={(e) => dossierFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="dossier_is_published"
              checked={dossierFormModal.formData?.is_published || false}
              onChange={(e) => dossierFormModal.updateFormData({ is_published: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="dossier_is_published" className="text-sm text-gothic-silver">
              Publish immediately
            </label>
          </div>
        </div>
      </FormModal>

      {/* Read Modals */}
      <ReadModal
        isOpen={fragmentReadModal.isOpen}
        onClose={fragmentReadModal.closeModal}
        title={fragmentReadModal.selectedItem?.title || 'Reading Fragment'}
        theme="silver"
        size="xl"
        author={fragmentReadModal.selectedItem?.author_name}
        category={fragmentReadModal.selectedItem?.category}
        publishedAt={fragmentReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-gothic-silver max-w-none">
            {fragmentReadModal.selectedItem?.content}
          </div>
        </div>
      </ReadModal>

      <ReadModal
        isOpen={submissionReadModal.isOpen}
        onClose={submissionReadModal.closeModal}
        title={submissionReadModal.selectedItem?.title || 'Reading Submission'}
        theme="silver"
        size="xl"
        author={submissionReadModal.selectedItem?.author_name}
        publishedAt={submissionReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-gothic-silver max-w-none">
            {submissionReadModal.selectedItem?.content}
          </div>
        </div>
      </ReadModal>

      {/* Confirmation Modal */}
      {ConfirmModalComponent}
    </div>
  );
}
