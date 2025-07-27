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
  display_order?: number;
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [fragments, setFragments] = useState<LamentFragment[]>([]);
  const [submissions, setSubmissions] = useState<LamentSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [isReorderingFragments, setIsReorderingFragments] = useState(false);
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
      // Try to order by display_order first, fall back to created_at if column doesn't exist
      let query = supabase
        .from('lament_fragments_entries')
        .select('*');
      
      try {
        const { data, error } = await query.order('display_order', { ascending: true });
        if (error && error.message.includes('column "display_order" does not exist')) {
          // Fall back to created_at ordering
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('lament_fragments_entries')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          setFragments(fallbackData || []);
        } else {
          if (error) throw error;
          setFragments(data || []);
        }
      } catch (err) {
        // If ordering by display_order fails, use created_at
        const { data, error } = await supabase
          .from('lament_fragments_entries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setFragments(data || []);
      }
    } catch (error) {
      console.error('Error loading fragments:', error);
    }
  };

  const handleFragmentReorder = async (reorderedFragments: LamentFragment[]) => {
    // Update local state immediately for better UX
    setFragments(reorderedFragments);
    
    try {
      // Get user token for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/admin/silver/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reorderedItems: reorderedFragments.map(fragment => ({ id: fragment.id })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating fragment order:', error);
      // Reload fragments on error to restore correct order
      loadFragments();
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
    router.push('/admin/silver/create');
  };

  const handleEditFragment = (fragment: LamentFragment) => {
    router.push(`/admin/silver/edit/${fragment.id}`);
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
    router.push('/admin/silver/announcement/create');
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    router.push(`/admin/silver/announcement/edit/${announcement.id}`);
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
    router.push('/admin/silver/dossier/create');
  };

  const handleEditDossier = (dossier: DossierEntry) => {
    router.push(`/admin/silver/dossier/edit/${dossier.id}`);
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

      {/* Admin Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-6"
      >
        <h3 className="text-xl font-semibold text-gothic-silver mb-4">Admin Tools</h3>
        <div className="flex space-x-4">
          <button
            onClick={runMigration}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Add Display Order Columns</span>
          </button>
        </div>
        <p className="text-sm text-gothic-silver/70 mt-2">
          This migration adds display_order columns to enable drag-and-drop reordering functionality.
        </p>
      </motion.div>
    </div>
  );

  const renderFragments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gothic-silver">Lament Fragments</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsReorderingFragments(!isReorderingFragments)}
            className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
              isReorderingFragments 
                ? 'bg-green-500 hover:bg-green-600 text-gothic-black' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{isReorderingFragments ? 'Finish Reordering' : 'Reorder'}</span>
          </button>
          <button
            onClick={handleCreateFragment}
            className="bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Fragment</span>
          </button>
        </div>
      </div>

      <DragDropTable
        items={fragments}
        onReorder={handleFragmentReorder}
        isReordering={isReorderingFragments}
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (fragment: LamentFragment) => (
              <span className="text-gothic-silver/90">{fragment.title}</span>
            ),
          },
          {
            key: 'author',
            header: 'Author',
            render: (fragment: LamentFragment) => (
              <span className="text-gothic-silver/70">{fragment.author_name}</span>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (fragment: LamentFragment) => (
              <span className="text-gothic-silver/70">{fragment.category}</span>
            ),
          },
          {
            key: 'read_time',
            header: 'Read Time',
            render: (fragment: LamentFragment) => (
              <span className="text-gothic-silver/70">{fragment.read_time || 'N/A'}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (fragment: LamentFragment) => (
              <span className={`px-2 py-1 rounded text-xs ${
                fragment.is_published 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {fragment.is_published ? 'Published' : 'Draft'}
              </span>
            ),
          },
          {
            key: 'created',
            header: 'Created',
            render: (fragment: LamentFragment) => (
              <span className="text-gothic-silver/70">
                {new Date(fragment.created_at).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        actionsColumn={(fragment: LamentFragment) => (
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
        )}
      />
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
