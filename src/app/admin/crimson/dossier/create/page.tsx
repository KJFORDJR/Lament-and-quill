'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DossierFormData {
  title: string;
  summary: string;
  content: string;
  type: string;
  city: string;
  classification: string;
  image_url: string;
  is_published: boolean;
}

export default function CreateDossierPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<DossierFormData>({
    title: '',
    summary: '',
    content: '',
    type: 'character',
    city: 'crimson',
    classification: 'public',
    image_url: '',
    is_published: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('dossier_entries')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      router.push('/admin/crimson');
    } catch (error) {
      console.error('Error creating dossier:', error);
      alert('Error creating dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<DossierFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gothic-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </button>
          </div>

          <div className="bg-gothic-charcoal border border-red-500/20 rounded-lg overflow-hidden">
            {formData.image_url && (
              <div className="bg-gothic-black/50 p-4">
                <img 
                  src={formData.image_url}
                  alt={formData.title}
                  className="w-full max-h-64 object-contain mx-auto"
                />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  formData.classification === 'public' ? 'bg-green-500/20 text-green-400' :
                  formData.classification === 'confidential' ? 'bg-yellow-500/20 text-yellow-400' :
                  formData.classification === 'secret' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {formData.classification.toUpperCase()}
                </span>
                <span className="text-red-400 text-sm capitalize">{formData.type}</span>
              </div>
              <h1 className="text-3xl font-bold text-red-500 mb-4">{formData.title}</h1>
              <p className="text-red-400/80 mb-6">{formData.summary}</p>
              <div className="prose prose-red max-w-none">
                <div className="text-red-400/90 whitespace-pre-wrap">{formData.content}</div>
              </div>
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
                onClick={() => router.push('/admin/crimson')}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin</span>
              </button>
              <h1 className="text-3xl font-bold text-red-500">Create Dossier Entry</h1>
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
          className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-red-500 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-red-500 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateFormData({ type: e.target.value })}
                className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
                value={formData.classification}
                onChange={(e) => updateFormData({ classification: e.target.value })}
                className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="public">Public</option>
                <option value="confidential">Confidential</option>
                <option value="secret">Secret</option>
                <option value="top-secret">Top Secret</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-red-500 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => updateFormData({ image_url: e.target.value })}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-3 bg-gothic-black/50 rounded-md p-2">
                <img 
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded border border-red-500/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-red-500 mb-2">
              Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => updateFormData({ summary: e.target.value })}
              rows={3}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Brief summary of the dossier entry"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-red-500 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateFormData({ content: e.target.value })}
              rows={12}
              className="w-full bg-gothic-steel border border-red-500/30 rounded-md px-3 py-2 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Detailed dossier content..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => updateFormData({ is_published: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_published" className="text-sm text-red-400">
                Publish immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-6 py-2 rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Dossier'}</span>
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
