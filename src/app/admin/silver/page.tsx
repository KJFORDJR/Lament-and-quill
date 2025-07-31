'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, Users, BarChart3, 
  Settings, FileText, Shield, BookOpen, Database, Megaphone, ArrowUpDown 
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
  totalUsers: number;
  totalAnnouncements: number;
  totalDossiers: number;
}

export default function SilverAdminPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [fragments, setFragments] = useState<LamentFragment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [isReorderingFragments, setIsReorderingFragments] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalFragments: 0,
    totalUsers: 0,
    totalAnnouncements: 0,
    totalDossiers: 0
  });

  // Modal hooks
  const fragmentReadModal = useReadModal<LamentFragment>();
  const { ConfirmModalComponent, openConfirmModal } = useConfirmModalComponent();

  const loadData = useCallback(async () => {
    await Promise.all([
      loadFragments(),
      loadAnnouncements(),
      loadDossiers(),
      loadStats()
    ]);
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const loadFragments = async () => {
    try {
      const { data, error } = await supabase
        .from('lament_fragments_entries')
        .select(`
          *,
          profiles:created_by (username)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const fragmentsWithAuthor = data?.map(fragment => ({
        ...fragment,
        author_name: fragment.profiles?.username || 'Unknown'
      })) || [];

      setFragments(fragmentsWithAuthor);
    } catch (error) {
      console.error('Error loading fragments:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('lament_announcements')
        .select('*')
        .order('priority', { ascending: true });

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
        .eq('city', 'lament')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDossiers(data || []);
    } catch (error) {
      console.error('Error loading dossiers:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [fragmentsCount, usersCount, announcementsCount, dossiersCount] = await Promise.all([
        supabase.from('lament_fragments_entries').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('lament_announcements').select('*', { count: 'exact', head: true }),
        supabase.from('dossier_entries').select('*', { count: 'exact', head: true }).eq('city', 'lament')
      ]);

      setStats({
        totalFragments: fragmentsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalAnnouncements: announcementsCount.count || 0,
        totalDossiers: dossiersCount.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleReadFragment = (fragment: LamentFragment) => {
    fragmentReadModal.openModal(fragment);
  };

  const handleDeleteFragment = async (id: string) => {
    const confirmed = await openConfirmModal({
      title: 'Delete Fragment',
      message: 'Are you sure you want to delete this fragment? This action cannot be undone.',
      confirmText: 'Delete',
      confirmButtonVariant: 'destructive'
    });

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('lament_fragments_entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadFragments();
      } catch (error) {
        console.error('Error deleting fragment:', error);
        alert('Error deleting fragment. Please try again.');
      }
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const confirmed = await openConfirmModal({
      title: 'Delete Announcement',
      message: 'Are you sure you want to delete this announcement? This action cannot be undone.',
      confirmText: 'Delete',
      confirmButtonVariant: 'destructive'
    });

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('lament_announcements')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement. Please try again.');
      }
    }
  };

  const handleDeleteDossier = async (id: string) => {
    const confirmed = await openConfirmModal({
      title: 'Delete Dossier',
      message: 'Are you sure you want to delete this dossier? This action cannot be undone.',
      confirmText: 'Delete',
      confirmButtonVariant: 'destructive'
    });

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('dossier_entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadDossiers();
        await loadStats();
      } catch (error) {
        console.error('Error deleting dossier:', error);
        alert('Error deleting dossier. Please try again.');
      }
    }
  };

  const handleReorderFragments = async (reorderedItems: LamentFragment[]) => {
    try {
      const updates = reorderedItems.map((fragment, index) => ({
        id: fragment.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('lament_fragments_entries')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      await loadFragments();
    } catch (error) {
      console.error('Error reordering fragments:', error);
      alert('Error reordering fragments. Please try again.');
    }
  };

  const toggleFragmentPublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('lament_fragments_entries')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      await loadFragments();
    } catch (error) {
      console.error('Error updating fragment status:', error);
      alert('Error updating fragment status. Please try again.');
    }
  };

  const toggleAnnouncementActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('lament_announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadAnnouncements();
    } catch (error) {
      console.error('Error updating announcement status:', error);
      alert('Error updating announcement status. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gothic-silver mb-4">Authentication Required</h1>
          <p className="text-gothic-steel">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{
      background: 'linear-gradient(135deg, #001a1a 0%, #000000 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-gothic font-bold mb-4 text-gothic-silver glow-text">
            Silver Heights Command
          </h1>
          <p className="text-gothic-silver/70">Manage lament fragments and content</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'fragments', label: 'Fragments', icon: FileText },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'dossiers', label: 'Dossiers', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gothic-steel hover:text-green-400 hover:bg-green-500/10'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Fragments', value: stats.totalFragments, icon: FileText, color: 'text-green-400' },
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
                { label: 'Announcements', value: stats.totalAnnouncements, icon: Megaphone, color: 'text-yellow-400' },
                { label: 'Dossier Entries', value: stats.totalDossiers, icon: BookOpen, color: 'text-purple-400' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 border border-gothic-steel/20 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 100, 0, 0.1) 0%, rgba(10, 10, 10, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div className="text-2xl font-bold text-gothic-silver mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gothic-steel">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Create Fragment',
                  description: 'Add a new lament fragment entry',
                  href: '/admin/silver/create',
                  icon: Plus,
                  color: 'text-green-400'
                },
                {
                  title: 'Create Announcement',
                  description: 'Add a new announcement',
                  href: '/admin/silver/announcement/create',
                  icon: Megaphone,
                  color: 'text-yellow-400'
                },
                {
                  title: 'Create Dossier',
                  description: 'Add a new dossier entry',
                  href: '/admin/silver/dossier/create',
                  icon: BookOpen,
                  color: 'text-purple-400'
                }
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className="p-6 border border-gothic-steel/20 rounded-lg text-left hover:border-green-500/30 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 100, 0, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <action.icon size={24} className={action.color} />
                    <h3 className="text-lg font-semibold text-gothic-silver">{action.title}</h3>
                  </div>
                  <p className="text-gothic-steel text-sm">{action.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fragments Tab */}
        {activeTab === 'fragments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gothic-silver">Lament Fragments ({fragments.length})</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsReorderingFragments(!isReorderingFragments)}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                    isReorderingFragments
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'border-gothic-steel/30 text-gothic-steel hover:text-green-400'
                  }`}
                >
                  <ArrowUpDown size={16} />
                  <span>{isReorderingFragments ? 'Done Reordering' : 'Reorder'}</span>
                </button>
                <button
                  onClick={() => router.push('/admin/silver/create')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <Plus size={16} />
                  <span>Create Fragment</span>
                </button>
              </div>
            </div>

            {isReorderingFragments ? (
              <DragDropTable
                items={fragments}
                onReorder={handleReorderFragments}
                renderItem={(fragment) => (
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold text-gothic-silver">{fragment.title}</h3>
                      <p className="text-sm text-gothic-steel">by {fragment.author_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        fragment.is_published 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {fragment.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="space-y-4">
                {fragments.map((fragment) => (
                  <div
                    key={fragment.id}
                    className="p-6 border border-gothic-steel/20 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 100, 0, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gothic-silver mb-2">{fragment.title}</h3>
                        <p className="text-gothic-steel text-sm mb-2">by {fragment.author_name}</p>
                        <p className="text-gothic-steel/70 text-sm">
                          Created {new Date(fragment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          fragment.is_published 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {fragment.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gothic-steel/20">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleReadFragment(fragment)}
                          className="flex items-center space-x-2 px-3 py-1 text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                        >
                          <Eye size={14} />
                          <span className="text-sm">Read</span>
                        </button>
                        <button
                          onClick={() => router.push(`/admin/silver/edit/${fragment.id}`)}
                          className="flex items-center space-x-2 px-3 py-1 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        >
                          <Edit3 size={14} />
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => toggleFragmentPublished(fragment.id, fragment.is_published)}
                          className="flex items-center space-x-2 px-3 py-1 text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors"
                        >
                          <Settings size={14} />
                          <span className="text-sm">{fragment.is_published ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFragment(fragment.id)}
                          className="flex items-center space-x-2 px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gothic-silver">Announcements ({announcements.length})</h2>
              <button
                onClick={() => router.push('/admin/silver/announcement/create')}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <Plus size={16} />
                <span>Create Announcement</span>
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-6 border border-gothic-steel/20 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 0, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gothic-silver mb-2">{announcement.title}</h3>
                      <p className="text-gothic-steel text-sm">
                        Created {new Date(announcement.created_at).toLocaleDateString()} • Priority: {announcement.priority}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        announcement.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {announcement.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gothic-steel mb-4">
                    {announcement.content.length > 200 
                      ? `${announcement.content.substring(0, 200)}...` 
                      : announcement.content}
                  </p>

                  <div className="flex items-center space-x-4 pt-4 border-t border-gothic-steel/20">
                    <button
                      onClick={() => toggleAnnouncementActive(announcement.id, announcement.is_active)}
                      className="flex items-center space-x-2 px-3 py-1 text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors"
                    >
                      <Settings size={14} />
                      <span className="text-sm">{announcement.is_active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="flex items-center space-x-2 px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dossiers Tab */}
        {activeTab === 'dossiers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gothic-silver">Dossier Entries ({dossiers.length})</h2>
              <button
                onClick={() => router.push('/admin/silver/dossier/create')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Plus size={16} />
                <span>Create Dossier</span>
              </button>
            </div>

            <div className="space-y-4">
              {dossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="p-6 border border-gothic-steel/20 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(128, 0, 128, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gothic-silver mb-2">{dossier.title}</h3>
                      <p className="text-gothic-steel text-sm mb-2">
                        {dossier.type} • {dossier.classification}
                      </p>
                      <p className="text-gothic-steel/70 text-sm">
                        Created {new Date(dossier.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        dossier.is_published 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {dossier.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gothic-steel mb-4">
                    {dossier.summary.length > 200 
                      ? `${dossier.summary.substring(0, 200)}...` 
                      : dossier.summary}
                  </p>

                  <div className="flex items-center space-x-4 pt-4 border-t border-gothic-steel/20">
                    <button
                      onClick={() => router.push(`/admin/silver/dossier/edit/${dossier.id}`)}
                      className="flex items-center space-x-2 px-3 py-1 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                    >
                      <Edit3 size={14} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDossier(dossier.id)}
                      className="flex items-center space-x-2 px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Read Fragment Modal */}
      <ReadModal
        isOpen={fragmentReadModal.isOpen}
        onClose={fragmentReadModal.closeModal}
        title={fragmentReadModal.selectedItem?.title || 'Fragment'}
        theme="silver"
        size="xl"
      >
        {fragmentReadModal.selectedItem && (
          <>
            <div className="flex items-center space-x-4 text-sm text-gothic-steel mb-6">
              <span>by {fragmentReadModal.selectedItem.author_name}</span>
              <span>•</span>
              <span>{fragmentReadModal.selectedItem.category}</span>
              <span>•</span>
              <span>{new Date(fragmentReadModal.selectedItem.created_at).toLocaleDateString()}</span>
            </div>

            {fragmentReadModal.selectedItem.excerpt && (
              <div className="mb-6 p-4 border border-green-500/20 rounded-lg bg-green-500/5">
                <p className="text-green-400 italic">{fragmentReadModal.selectedItem.excerpt}</p>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <div className="text-gothic-silver leading-relaxed whitespace-pre-wrap">
                {fragmentReadModal.selectedItem.content}
              </div>
            </div>
          </>
        )}
      </ReadModal>

      <ConfirmModalComponent />
    </div>
  );
}
