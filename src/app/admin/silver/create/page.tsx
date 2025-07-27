'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateSilverFragment() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author_name: '',
    category: 'Transmissions',
    read_time: '',
    is_published: false
  });

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, router]);

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
      const response = await fetch('/api/admin/fragments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create fragment');
      }

      router.push('/admin/silver?tab=fragments');
    } catch (error) {
      console.error('Error creating fragment:', error);
      alert('Failed to create fragment. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              h1 { color: #c0c0c0; border-bottom: 2px solid #c0c0c0; padding-bottom: 10px; }
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
                className="text-gothic-silver hover:text-gothic-silver/80 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-gothic-silver">Create Silver Fragment</h1>
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
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.content || !formData.author_name}
                className="bg-gothic-silver hover:bg-gothic-silver/80 disabled:bg-gray-500 disabled:cursor-not-allowed text-gothic-charcoal px-6 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Creating...' : 'Create Fragment'}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gothic-silver mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  placeholder="Enter the title of the fragment"
                />
              </div>

              {/* Author Name */}
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-gothic-silver mb-2">
                  Author Name *
                </label>
                <input
                  type="text"
                  id="author_name"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  placeholder="e.g., Silver Chronicler"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gothic-silver mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                >
                  <option value="Transmissions">Transmissions</option>
                  <option value="Fragments">Fragments</option>
                  <option value="Echoes">Echoes</option>
                  <option value="Whispers">Whispers</option>
                </select>
              </div>

              {/* Read Time */}
              <div>
                <label htmlFor="read_time" className="block text-sm font-medium text-gothic-silver mb-2">
                  Read Time
                </label>
                <input
                  type="text"
                  id="read_time"
                  name="read_time"
                  value={formData.read_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
                  placeholder="e.g., 3 min read"
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
                  className="w-4 h-4 text-gothic-silver bg-gothic-charcoal border-gothic-silver/30 rounded focus:ring-gothic-silver"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gothic-silver">
                  Publish immediately
                </label>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gothic-silver mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver resize-vertical"
                placeholder="Brief description or excerpt (optional)"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gothic-silver mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={15}
                className="w-full px-3 py-2 bg-gothic-charcoal border border-gothic-silver/30 rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver resize-vertical"
                placeholder="Write your fragment content here..."
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
