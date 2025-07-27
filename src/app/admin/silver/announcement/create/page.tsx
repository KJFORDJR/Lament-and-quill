'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AnnouncementFormData {
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
}

export default function CreateAnnouncementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 0,
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          ...formData,
          author_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      router.push('/admin/silver');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<AnnouncementFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gothic-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 text-gothic-silver hover:text-gothic-silver/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </button>
          </div>

          <div className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded text-sm ${
                formData.is_active 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 rounded text-sm ${
                formData.priority > 5 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                Priority: {formData.priority}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gothic-silver mb-6">{formData.title}</h1>
            <div className="prose prose-gothic-silver max-w-none">
              <div className="text-gothic-silver/90 whitespace-pre-wrap">{formData.content}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gothic-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/silver')}
                className="flex items-center space-x-2 text-gothic-silver hover:text-gothic-silver/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin</span>
              </button>
              <h1 className="text-3xl font-bold text-gothic-silver">Create Announcement</h1>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-gothic-charcoal border border-gothic-silver/20 rounded-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gothic-silver mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
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
                value={formData.priority}
                onChange={(e) => updateFormData({ priority: parseInt(e.target.value) || 0 })}
                className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              />
              <p className="text-xs text-gothic-silver/70 mt-1">Higher numbers = higher priority. Values over 5 marked as high priority.</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gothic-silver mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateFormData({ content: e.target.value })}
              rows={12}
              className="w-full bg-gothic-steel border border-gothic-silver/30 rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:ring-2 focus:ring-gothic-silver/50"
              placeholder="Announcement content..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => updateFormData({ is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gothic-silver">
                Active
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-gothic-silver hover:bg-gothic-silver/80 disabled:bg-gothic-steel text-gothic-charcoal px-6 py-2 rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Announcement'}</span>
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
