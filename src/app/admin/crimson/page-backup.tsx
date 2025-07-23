'use client';

import { useState, useEffect } from 'react';
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
  is_anonymous: boolean;
  status: string;
  tip_count: number;
  total_tip_amount: number;
  featured_in_forum: boolean;
  moderation_notes?: string;
  author_name: string;
  created_at: string;
  updated_at: string;
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
  type: 'character' | 'location' | 'event';
  city: 'crimson' | 'silver';
  classification: 'public' | 'confidential' | 'secret' | 'top-secret';
  is_published: boolean;
  created_at: string;
}

export default function AdminCrimson() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'tips'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data state
  const [crimsonEntries, setCrimsonEntries] = useState<CrimsonEntry[]>([]);
  const [crimsonSubmissions, setCrimsonSubmissions] = useState<CrimsonSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossierEntries, setDossierEntries] = useState<DossierEntry[]>([]);

  // Modal hooks
  const entryFormModal = useFormModal<Partial<CrimsonEntry>>();
  const entryReadModal = useReadModal<CrimsonEntry>();
  const confessionReadModal = useReadModal<CrimsonSubmission>();
  const announcementFormModal = useFormModal<Partial<Announcement>>();
  const announcementReadModal = useReadModal<Announcement>();
  const dossierFormModal = useFormModal<Partial<DossierEntry>>();
  const dossierReadModal = useReadModal<DossierEntry>();
  const { ConfirmModalComponent, openConfirmModal } = useConfirmModalComponent();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ledger', label: 'Crimson Ledger', icon: BookOpen },
    { id: 'confessions', label: 'Blood Confessions', icon: MessageCircle },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'dossier', label: 'Dossier Archive', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCrimsonEntries(),
        loadCrimsonSubmissions(),
        loadAnnouncements(),
        loadDossierEntries(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCrimsonEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('crimson_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrimsonEntries(data || []);
    } catch (error) {
      console.error('Error loading crimson entries:', error);
    }
  };

  const loadCrimsonSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('crimson_submissions')
        .select(`
          *,
          profiles!inner(username),
          tips(amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const submissionsWithTips = (data || []).map(submission => ({
        ...submission,
        tipTotal: submission.tips?.reduce((sum: number, tip: any) => sum + (tip.amount || 0), 0) || 0
      }));

      setCrimsonSubmissions(submissionsWithTips);
    } catch (error) {
      console.error('Error loading crimson submissions:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!inner(username, city_affiliation, user_role)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const loadDossierEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('dossier_entries')
        .select('*')
        .eq('city', 'crimson')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDossierEntries(data || []);
    } catch (error) {
      console.error('Error loading dossier entries:', error);
    }
  };

  // Handler functions
  const handleCreateEntry = () => {
    entryFormModal.openModal({
      title: '',
      content: '',
      author_name: 'Admin',
      category: 'Official Records',
      is_published: true
    });
  };

  const handleEditEntry = (entry: CrimsonEntry) => {
    entryFormModal.openModal(entry);
  };

  const handleReadEntry = (entry: CrimsonEntry) => {
    entryReadModal.openModal(entry);
  };

  const handleSubmitEntry = async () => {
    try {
      entryFormModal.setIsSubmitting(true);
      const formData = entryFormModal.formData;

      if (!formData?.title || !formData?.content) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.id) {
        // Update existing entry
        const { error } = await supabase
          .from('crimson_entries')
          .update({
            title: formData.title,
            content: formData.content,
            author_name: formData.author_name,
            category: formData.category,
            is_published: formData.is_published
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('crimson_entries')
          .insert({
            title: formData.title,
            content: formData.content,
            author_name: formData.author_name,
            category: formData.category,
            is_published: formData.is_published
          });

        if (error) throw error;
      }

      entryFormModal.closeModal();
      loadCrimsonEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry');
    } finally {
      entryFormModal.setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    openConfirmModal({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('crimson_entries')
            .delete()
            .eq('id', entryId);

          if (error) throw error;
          loadCrimsonEntries();
        } catch (error) {
          console.error('Error deleting entry:', error);
          alert('Error deleting entry');
        }
      }
    });
  };

  const handleReadConfession = (confession: CrimsonSubmission) => {
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
          const { error } = await supabase
            .from('crimson_submissions')
            .delete()
            .eq('id', confessionId);

          if (error) throw error;
          loadCrimsonSubmissions();
        } catch (error) {
          console.error('Error deleting confession:', error);
          alert('Error deleting confession');
        }
      }
    });
  };

  const approveConfession = async (confessionId: string) => {
    try {
      const { error } = await supabase
        .from('crimson_submissions')
        .update({ status: 'approved' })
        .eq('id', confessionId);

      if (error) throw error;
      loadCrimsonSubmissions();
    } catch (error) {
      console.error('Error approving confession:', error);
      alert('Error approving confession');
    }
  };

  const rejectConfession = async (confessionId: string) => {
    try {
      const { error } = await supabase
        .from('crimson_submissions')
        .update({ status: 'rejected' })
        .eq('id', confessionId);

      if (error) throw error;
      loadCrimsonSubmissions();
    } catch (error) {
      console.error('Error rejecting confession:', error);
      alert('Error rejecting confession');
    }
  };

  const handleCreateAnnouncement = () => {
    announcementFormModal.openModal({
      title: '',
      content: '',
      priority: 0,
      is_active: true
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    announcementFormModal.openModal(announcement);
  };

  const handleReadAnnouncement = (announcement: Announcement) => {
    announcementReadModal.openModal(announcement);
  };

  const handleSubmitAnnouncement = async () => {
    try {
      announcementFormModal.setIsSubmitting(true);
      const formData = announcementFormModal.formData;

      if (!formData?.title || !formData?.content) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.id) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Create new announcement
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active,
            author_id: userData.user?.id
          });

        if (error) throw error;
      }

      announcementFormModal.closeModal();
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement');
    } finally {
      announcementFormModal.setIsSubmitting(false);
    }
  };

  const handleCreateDossier = () => {
    dossierFormModal.openModal({
      title: '',
      summary: '',
      content: '',
      type: 'character',
      city: 'crimson',
      classification: 'public',
      is_published: true
    });
  };

  const handleEditDossier = (dossier: DossierEntry) => {
    dossierFormModal.openModal(dossier);
  };

  const handleReadDossier = (dossier: DossierEntry) => {
    dossierReadModal.openModal(dossier);
  };

  const handleSubmitDossier = async () => {
    try {
      dossierFormModal.setIsSubmitting(true);
      const formData = dossierFormModal.formData;

      if (!formData?.title || !formData?.content) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.id) {
        // Update existing dossier
        const { error } = await supabase
          .from('dossier_entries')
          .update({
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            type: formData.type,
            city: formData.city,
            classification: formData.classification,
            is_published: formData.is_published
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Create new dossier
        const { error } = await supabase
          .from('dossier_entries')
          .insert({
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            type: formData.type,
            city: formData.city,
            classification: formData.classification,
            is_published: formData.is_published
          });

        if (error) throw error;
      }

      dossierFormModal.closeModal();
      loadDossierEntries();
    } catch (error) {
      console.error('Error saving dossier:', error);
      alert('Error saving dossier');
    } finally {
      dossierFormModal.setIsSubmitting(false);
    }
  };

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

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="crimson-theme p-6 rounded-lg tech-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gothic-steel text-sm">Total Entries</p>
            <p className="text-2xl font-bold text-gothic-silver">{crimsonEntries.length}</p>
          </div>
          <BookOpen className="text-gothic-crimson" size={24} />
        </div>
      </div>

      <div className="crimson-theme p-6 rounded-lg tech-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gothic-steel text-sm">Blood Confessions</p>
            <p className="text-2xl font-bold text-gothic-silver">{crimsonSubmissions.length}</p>
          </div>
          <MessageCircle className="text-gothic-crimson" size={24} />
        </div>
      </div>

      <div className="crimson-theme p-6 rounded-lg tech-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gothic-steel text-sm">Announcements</p>
            <p className="text-2xl font-bold text-gothic-silver">{announcements.length}</p>
          </div>
          <Megaphone className="text-gothic-crimson" size={24} />
        </div>
      </div>

      <div className="crimson-theme p-6 rounded-lg tech-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gothic-steel text-sm">Dossier Files</p>
            <p className="text-2xl font-bold text-gothic-silver">{dossierEntries.length}</p>
          </div>
          <Database className="text-gothic-crimson" size={24} />
        </div>
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Crimson Ledger Archive</h2>
        <button
          onClick={handleCreateEntry}
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
            <p className="text-gothic-steel mb-4 line-clamp-3">{entry.content}</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleReadEntry(entry)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Eye size={14} className="inline mr-1" />
                Read Full Entry
              </button>
              <button 
                onClick={() => handleEditEntry(entry)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Edit3 size={14} className="inline mr-1" />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteEntry(entry.id)}
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
              onClick={handleCreateEntry}
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
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {sortedConfessions.map((confession) => (
            <div key={confession.id} className="crimson-theme p-4 rounded-lg tech-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-gothic-silver font-medium">{confession.title}</h4>
                  <p className="text-sm text-gothic-steel">
                    By {confession.profiles.username} • {new Date(confession.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    confession.status === 'approved' ? 'bg-red-500/20 text-red-400' :
                    confession.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {confession.status}
                  </span>
                  <span className="text-xs text-gothic-steel">
                    ${confession.tipTotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              
              <p className="text-gothic-steel text-sm mb-3 line-clamp-2">{confession.content}</p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleReadConfession(confession)}
                  className="text-gothic-crimson hover:text-red-400 text-sm"
                >
                  <Eye size={14} className="inline mr-1" />
                  Read Full
                </button>
                
                {confession.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveConfession(confession.id)}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectConfession(confession.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handleDeleteConfession(confession.id)}
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
              <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Confessions Found</h3>
              <p className="text-gothic-steel">Blood confessions will appear here for moderation.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Network Announcements</h2>
        <button
          onClick={handleCreateAnnouncement}
          className="cyber-button px-4 py-2 bg-gothic-crimson text-white hover:bg-gothic-crimson/80"
        >
          <Plus size={16} className="mr-2" />
          New Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="crimson-theme p-4 rounded-lg tech-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-gothic-silver font-medium">{announcement.title}</h4>
                <p className="text-sm text-gothic-steel">
                  By {announcement.profiles.username} • {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  announcement.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {announcement.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  announcement.priority >= 3 ? 'bg-red-500/20 text-red-400' :
                  announcement.priority >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  P{announcement.priority}
                </span>
              </div>
            </div>
            
            <p className="text-gothic-steel text-sm mb-3 line-clamp-2">{announcement.content}</p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleReadAnnouncement(announcement)}
                className="text-gothic-crimson hover:text-red-400 text-sm"
              >
                <Eye size={14} className="inline mr-1" />
                Read Full
              </button>
              <button
                onClick={() => handleEditAnnouncement(announcement)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Edit3 size={14} className="inline mr-1" />
                Edit
              </button>
            </div>
          </div>
        ))}

        {announcements.length === 0 && !loading && (
          <div className="crimson-theme p-8 rounded-lg tech-border text-center">
            <Megaphone size={48} className="mx-auto text-gothic-crimson mb-4" />
            <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Announcements Found</h3>
            <p className="text-gothic-steel mb-4">Create your first announcement to communicate with users.</p>
            <button
              onClick={handleCreateAnnouncement}
              className="cyber-button px-4 py-2 bg-gothic-crimson text-white"
            >
              Create First Announcement
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDossier = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-gothic font-bold text-gothic-silver">Dossier Archive</h2>
        <button
          onClick={handleCreateDossier}
          className="cyber-button px-4 py-2 bg-gothic-crimson text-white hover:bg-gothic-crimson/80"
        >
          <Plus size={16} className="mr-2" />
          New Dossier
        </button>
      </div>

      <div className="grid gap-4">
        {dossierEntries.map((dossier) => (
          <div key={dossier.id} className="crimson-theme p-4 rounded-lg tech-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-gothic-silver font-medium">{dossier.title}</h4>
                <p className="text-sm text-gothic-steel mb-2">{dossier.summary}</p>
                <p className="text-xs text-gothic-steel">
                  {new Date(dossier.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  dossier.classification === 'top-secret' ? 'bg-red-500/20 text-red-400' :
                  dossier.classification === 'secret' ? 'bg-orange-500/20 text-orange-400' :
                  dossier.classification === 'confidential' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {dossier.classification}
                </span>
                <span className="px-2 py-1 bg-gothic-steel/20 text-gothic-steel rounded text-xs">
                  {dossier.type}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleReadDossier(dossier)}
                className="text-gothic-crimson hover:text-red-400 text-sm"
              >
                <Eye size={14} className="inline mr-1" />
                Read Full
              </button>
              <button
                onClick={() => handleEditDossier(dossier)}
                className="text-gothic-silver hover:text-red-400 text-sm"
              >
                <Edit3 size={14} className="inline mr-1" />
                Edit
              </button>
            </div>
          </div>
        ))}

        {dossierEntries.length === 0 && !loading && (
          <div className="crimson-theme p-8 rounded-lg tech-border text-center">
            <Database size={48} className="mx-auto text-gothic-crimson mb-4" />
            <h3 className="text-xl font-gothic text-gothic-silver mb-2">No Dossier Files Found</h3>
            <p className="text-gothic-steel mb-4">Create your first dossier entry to begin cataloging intelligence.</p>
            <button
              onClick={handleCreateDossier}
              className="cyber-button px-4 py-2 bg-gothic-crimson text-white"
            >
              Create First Dossier
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-gothic font-bold text-gothic-silver">User Management</h2>
      <div className="crimson-theme p-8 rounded-lg tech-border text-center">
        <Users size={48} className="mx-auto text-gothic-crimson mb-4" />
        <h3 className="text-xl font-gothic text-gothic-silver mb-2">User Management Interface</h3>
        <p className="text-gothic-steel">Advanced user administration and network monitoring tools.</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading...</div>
      </div>
    );
  }

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

      {/* Entry Form Modal */}
      <FormModal
        isOpen={entryFormModal.isOpen}
        onClose={entryFormModal.closeModal}
        title={entryFormModal.formData?.id ? 'Edit Entry' : 'Create Entry'}
        theme="crimson"
        size="lg"
        onSubmit={handleSubmitEntry}
        isSubmitting={entryFormModal.isSubmitting}
        submitText={entryFormModal.formData?.id ? 'Update Entry' : 'Create Entry'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-gothic-crimson mb-2">Title</label>
            <input
              type="text"
              value={entryFormModal.formData?.title || ''}
              onChange={(e) => entryFormModal.updateFormData({ title: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Content</label>
            <textarea
              value={entryFormModal.formData?.content || ''}
              onChange={(e) => entryFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Author</label>
            <input
              type="text"
              value={entryFormModal.formData?.author_name || ''}
              onChange={(e) => entryFormModal.updateFormData({ author_name: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Category</label>
            <select
              value={entryFormModal.formData?.category || ''}
              onChange={(e) => entryFormModal.updateFormData({ category: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            >
              <option value="Official Records">Official Records</option>
              <option value="Blood Transmissions">Blood Transmissions</option>
              <option value="Data Fragments">Data Fragments</option>
              <option value="Archive Entries">Archive Entries</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={entryFormModal.formData?.is_published || false}
              onChange={(e) => entryFormModal.updateFormData({ is_published: e.target.checked })}
              className="text-gothic-crimson"
            />
            <label htmlFor="is_published" className="text-gothic-crimson">Published</label>
          </div>
        </div>
      </FormModal>

      {/* Entry Read Modal */}
      <ReadModal
        isOpen={entryReadModal.isOpen}
        onClose={entryReadModal.closeModal}
        title={entryReadModal.selectedItem?.title || 'Reading Entry'}
        theme="crimson"
        size="xl"
        author={entryReadModal.selectedItem?.author_name}
        category={entryReadModal.selectedItem?.category}
        publishedAt={entryReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-gothic-crimson max-w-none">
            {entryReadModal.selectedItem?.content}
          </div>
        </div>
      </ReadModal>

      {/* Confession Read Modal */}
      <ReadModal
        isOpen={confessionReadModal.isOpen}
        onClose={confessionReadModal.closeModal}
        title={confessionReadModal.selectedItem?.title || 'Reading Confession'}
        theme="crimson"
        size="xl"
        author={confessionReadModal.selectedItem?.profiles?.username}
        category="Blood Confession"
        publishedAt={confessionReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="border-l-4 border-gothic-crimson/50 pl-6 bg-gothic-charcoal/30">
            <p className="text-gothic-silver italic text-lg leading-relaxed font-noir whitespace-pre-wrap">
              &ldquo;{confessionReadModal.selectedItem?.content}&rdquo;
            </p>
          </div>
          
          {/* Confession Actions */}
          <div className="mt-6 pt-4 border-t border-gothic-crimson/20">
            <div className="flex space-x-4">
              {confessionReadModal.selectedItem?.status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      if (confessionReadModal.selectedItem) {
                        approveConfession(confessionReadModal.selectedItem.id);
                        confessionReadModal.closeModal();
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Approve Confession
                  </button>
                  <button 
                    onClick={() => {
                      if (confessionReadModal.selectedItem) {
                        rejectConfession(confessionReadModal.selectedItem.id);
                        confessionReadModal.closeModal();
                      }
                    }}
                    className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-400/30 rounded hover:bg-gray-500/30 transition-colors"
                  >
                    Reject Confession
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  if (confessionReadModal.selectedItem) {
                    handleDeleteConfession(confessionReadModal.selectedItem.id);
                    confessionReadModal.closeModal();
                  }
                }}
                className="px-4 py-2 bg-gothic-charcoal text-gothic-steel border border-gothic-steel rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                Delete Confession
              </button>
            </div>
          </div>
        </div>
      </ReadModal>

      {/* Announcement Form Modal */}
      <FormModal
        isOpen={announcementFormModal.isOpen}
        onClose={announcementFormModal.closeModal}
        title={announcementFormModal.formData?.id ? 'Edit Announcement' : 'Create Announcement'}
        theme="crimson"
        size="lg"
        onSubmit={handleSubmitAnnouncement}
        isSubmitting={announcementFormModal.isSubmitting}
        submitText={announcementFormModal.formData?.id ? 'Update Announcement' : 'Create Announcement'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-gothic-crimson mb-2">Title</label>
            <input
              type="text"
              value={announcementFormModal.formData?.title || ''}
              onChange={(e) => announcementFormModal.updateFormData({ title: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Content</label>
            <textarea
              value={announcementFormModal.formData?.content || ''}
              onChange={(e) => announcementFormModal.updateFormData({ content: e.target.value })}
              rows={6}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Priority (0-5)</label>
            <input
              type="number"
              min="0"
              max="5"
              value={announcementFormModal.formData?.priority || 0}
              onChange={(e) => announcementFormModal.updateFormData({ priority: parseInt(e.target.value) || 0 })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="announcement_active"
              checked={announcementFormModal.formData?.is_active || false}
              onChange={(e) => announcementFormModal.updateFormData({ is_active: e.target.checked })}
              className="text-gothic-crimson"
            />
            <label htmlFor="announcement_active" className="text-gothic-crimson">Active</label>
          </div>
        </div>
      </FormModal>

      {/* Announcement Read Modal */}
      <ReadModal
        isOpen={announcementReadModal.isOpen}
        onClose={announcementReadModal.closeModal}
        title={announcementReadModal.selectedItem?.title || 'Reading Announcement'}
        theme="crimson"
        size="lg"
        author={announcementReadModal.selectedItem?.profiles?.username || 'Admin'}
        category="Announcement"
        publishedAt={announcementReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-gothic-crimson max-w-none">
            <div className="bg-gothic-dark-gray/50 p-4 rounded border border-gothic-steel/30">
              {announcementReadModal.selectedItem?.content}
            </div>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gothic-steel">
              <span className={`px-2 py-1 rounded ${
                announcementReadModal.selectedItem?.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {announcementReadModal.selectedItem?.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-2 py-1 rounded ${
                (announcementReadModal.selectedItem?.priority || 0) >= 3 ? 'bg-red-500/20 text-red-400' 
                : (announcementReadModal.selectedItem?.priority || 0) >= 1 ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-blue-500/20 text-blue-400'
              }`}>
                Priority: {announcementReadModal.selectedItem?.priority || 0}
              </span>
            </div>
          </div>
        </div>
      </ReadModal>

      {/* Dossier Form Modal */}
      <FormModal
        isOpen={dossierFormModal.isOpen}
        onClose={dossierFormModal.closeModal}
        title={dossierFormModal.formData?.id ? 'Edit Dossier Entry' : 'Create Dossier Entry'}
        theme="crimson"
        size="lg"
        onSubmit={handleSubmitDossier}
        isSubmitting={dossierFormModal.isSubmitting}
        submitText={dossierFormModal.formData?.id ? 'Update Dossier' : 'Create Dossier'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-gothic-crimson mb-2">Title</label>
            <input
              type="text"
              value={dossierFormModal.formData?.title || ''}
              onChange={(e) => dossierFormModal.updateFormData({ title: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Summary</label>
            <input
              type="text"
              value={dossierFormModal.formData?.summary || ''}
              onChange={(e) => dossierFormModal.updateFormData({ summary: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Content</label>
            <textarea
              value={dossierFormModal.formData?.content || ''}
              onChange={(e) => dossierFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gothic-crimson mb-2">Type</label>
              <select
                value={dossierFormModal.formData?.type || 'character'}
                onChange={(e) => dossierFormModal.updateFormData({ type: e.target.value as any })}
                className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
              >
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="event">Event</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gothic-crimson mb-2">City</label>
              <select
                value={dossierFormModal.formData?.city || 'crimson'}
                onChange={(e) => dossierFormModal.updateFormData({ city: e.target.value as any })}
                className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
              >
                <option value="crimson">Crimson City</option>
                <option value="silver">Silver Heights</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gothic-crimson mb-2">Classification</label>
              <select
                value={dossierFormModal.formData?.classification || 'public'}
                onChange={(e) => dossierFormModal.updateFormData({ classification: e.target.value as any })}
                className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
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
              id="dossier_published"
              checked={dossierFormModal.formData?.is_published || false}
              onChange={(e) => dossierFormModal.updateFormData({ is_published: e.target.checked })}
              className="text-gothic-crimson"
            />
            <label htmlFor="dossier_published" className="text-gothic-crimson">Published</label>
          </div>
        </div>
      </FormModal>

      {/* Dossier Read Modal */}
      <ReadModal
        isOpen={dossierReadModal.isOpen}
        onClose={dossierReadModal.closeModal}
        title={dossierReadModal.selectedItem?.title || 'Reading Dossier'}
        theme="crimson"
        size="xl"
        author="Admin"
        category={`${dossierReadModal.selectedItem?.type} • ${dossierReadModal.selectedItem?.city} • ${dossierReadModal.selectedItem?.classification}`}
        publishedAt={dossierReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gothic-silver mb-2">Summary</h3>
            <p className="text-gothic-steel">{dossierReadModal.selectedItem?.summary}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gothic-silver mb-2">Details</h3>
            <div className="prose prose-gothic-crimson max-w-none">
              <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap text-base">
                {dossierReadModal.selectedItem?.content}
              </div>
            </div>
          </div>
        </div>
      </ReadModal>

      {/* Confirmation Modal */}
      {ConfirmModalComponent}
    </div>
  );
}
