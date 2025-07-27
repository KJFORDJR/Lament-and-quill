'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

export default function EditCrimsonLedgerEntry() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author_name: '',
    category: 'Chronicle',
    read_time: '',
    is_published: false
  });

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/auth');
      return;
    }

    // Load the entry
    loadEntry();
  }, [user, router, params.id]);

  const loadEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('crimson_ledger_entries')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading entry:', error);
        router.push('/admin/crimson');
        return;
      }

      setFormData({
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.content,
        author_name: data.author_name,
        category: data.category,
        read_time: data.read_time || '',
        is_published: data.is_published
      });
    } catch (error) {
      console.error('Error loading entry:', error);
      router.push('/admin/crimson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/crimson-entries/create', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      router.push('/admin/crimson?tab=ledger');
    } catch (error) {
      console.error('Error updating ledger entry:', error);
      alert('Failed to update entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/admin/delete-crimson-entry', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: params.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      router.push('/admin/crimson?tab=ledger');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = () => {
    // Simple preview in a new window/tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Preview: ${formData.title}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #e5e5e5; }
              h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
              .meta { color: #999; margin-bottom: 20px; }
              .content { line-height: 1.6; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${formData.title}</h1>
            <div class="meta">
              <strong>Author:</strong> ${formData.author_name} | 
              <strong>Category:</strong> ${formData.category} | 
              <strong>Status:</strong> ${formData.is_published ? 'Published' : 'Draft'}
            </div>
            ${formData.excerpt ? `<p><em>${formData.excerpt}</em></p>` : ''}
            <div class="content">${formData.content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gothic-black text-gothic-silver flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gothic-black text-gothic-silver">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gothic-silver hover:text-red-500 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-red-500">Edit Crimson Ledger Entry</h1>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handlePreview}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.content || !formData.author_name}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-red-500 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                  placeholder="Enter the title of the ledger entry"
                />
              </div>

              {/* Author Name */}
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-red-500 mb-2">
                  Author Name *
                </label>
                <input
                  type="text"
                  id="author_name"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                  placeholder="e.g., The Red Scribe"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-red-500 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                >
                  <option value="Chronicle">Chronicle</option>
                  <option value="Investigation">Investigation</option>
                  <option value="Official Records">Official Records</option>
                  <option value="Personal Notes">Personal Notes</option>
                </select>
              </div>

              {/* Read Time */}
              <div>
                <label htmlFor="read_time" className="block text-sm font-medium text-red-500 mb-2">
                  Read Time
                </label>
                <input
                  type="text"
                  id="read_time"
                  name="read_time"
                  value={formData.read_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500"
                  placeholder="e.g., 5 min read"
                />
              </div>

              {/* Published Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-500 bg-gothic-charcoal border-red-500/30 rounded focus:ring-red-500"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-red-500">
                  Published
                </label>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-red-500 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500 resize-vertical"
                placeholder="Brief description or excerpt (optional)"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-red-500 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={15}
                className="w-full px-3 py-2 bg-gothic-charcoal border border-red-500/30 rounded-md text-gothic-silver focus:outline-none focus:border-red-500 resize-vertical"
                placeholder="Write your ledger entry content here..."
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
