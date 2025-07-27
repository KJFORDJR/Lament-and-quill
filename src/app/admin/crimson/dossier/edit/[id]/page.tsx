'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditDossierPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (id) {
      loadDossier();
    }
  }, [id]);

  const loadDossier = async () => {
    try {
      const { data, error } = await supabase
        .from('dossier_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          summary: data.summary,
          content: data.content,
          type: data.type,
          city: data.city,
          classification: data.classification,
          image_url: data.image_url || '',
          is_published: data.is_published
        });
      }
    } catch (error) {
      console.error('Error loading dossier:', error);
      alert('Error loading dossier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('dossier_entries')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      alert('Dossier updated successfully!');
      router.push('/admin/crimson');
    } catch (error) {
      console.error('Error updating dossier:', error);
      alert('Error updating dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gothic-black flex items-center justify-center">
        <div className="text-red-500">Loading dossier...</div>
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
          <button
            onClick={() => router.push('/admin/crimson')}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Panel</span>
          </button>

          <h1 className="text-4xl font-bold text-red-500 mb-2">Edit Dossier</h1>
          <p className="text-red-400/70">Update dossier information and content</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-red-500 text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    placeholder="Enter dossier title"
                  />
                </div>

                <div>
                  <label className="block text-red-500 text-sm font-medium mb-2">
                    Summary *
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    placeholder="Brief summary of the dossier"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-red-500 text-sm font-medium mb-2">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    >
                      <option value="character">Character</option>
                      <option value="location">Location</option>
                      <option value="organization">Organization</option>
                      <option value="event">Event</option>
                      <option value="artifact">Artifact</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-red-500 text-sm font-medium mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    >
                      <option value="crimson">Crimson</option>
                      <option value="silver">Silver</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-red-500 text-sm font-medium mb-2">
                      Classification
                    </label>
                    <select
                      name="classification"
                      value={formData.classification}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    >
                      <option value="public">Public</option>
                      <option value="restricted">Restricted</option>
                      <option value="classified">Classified</option>
                      <option value="top-secret">Top Secret</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-red-500 text-sm font-medium mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-red-500 text-sm font-medium mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={12}
                    className="w-full px-3 py-2 bg-gothic-black border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                    placeholder="Enter the full dossier content..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="rounded border-red-500/30 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="is_published" className="text-red-500 text-sm">
                    Publish immediately
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-500 hover:bg-red-600 text-gothic-black px-6 py-3 rounded-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Updating...' : 'Update Dossier'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-gothic-black border border-red-500/30 hover:bg-red-500/10 text-red-500 px-6 py-3 rounded-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                </div>
              </div>
            </motion.form>
          </div>

          {showPreview && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gothic-charcoal border border-red-500/20 rounded-lg p-6 sticky top-8"
              >
                <h3 className="text-xl font-bold text-red-500 mb-4">Preview</h3>
                
                {formData.image_url && (
                  <div className="mb-4">
                    <img
                      src={formData.image_url}
                      alt={formData.title}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gothic-silver">
                    {formData.title || 'Untitled Dossier'}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {formData.type}
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {formData.city}
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {formData.classification}
                    </span>
                  </div>

                  <p className="text-gothic-silver/70 text-sm">
                    {formData.summary || 'No summary provided'}
                  </p>

                  <div className="border-t border-red-500/20 pt-3">
                    <p className="text-gothic-silver/90 text-sm whitespace-pre-wrap">
                      {formData.content.substring(0, 200)}
                      {formData.content.length > 200 && '...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
