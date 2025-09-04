'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Palette, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface ProductForm {
  title: string;
  description: string;
  price: string;
  shipping: string;
  image_url: string;
  badge_text: string;
  badge_color: string;
  badge_border_color: string;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: string;
  category: string;
}

export default function NewProduct() {
  const { profile } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    price: '',
    shipping: '',
    image_url: '',
    badge_text: '',
    badge_color: '#666666',
    badge_border_color: '#999999',
    is_featured: false,
    is_active: true,
    stock_quantity: '0',
    category: 'general'
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'apparel', label: 'Apparel' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'books', label: 'Books & Media' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'digital', label: 'Digital Goods' }
  ];

  const badgePresets = [
    { text: 'NEW', color: '#22C55E', border: '#16A34A' },
    { text: 'BESTSELLER', color: '#DC2626', border: '#EF4444' },
    { text: 'LIMITED', color: '#6366F1', border: '#8B5CF6' },
    { text: 'POPULAR', color: '#F59E0B', border: '#FBBF24' },
    { text: 'COLLECTOR', color: '#059669', border: '#10B981' },
    { text: 'EXCLUSIVE', color: '#7C2D12', border: '#A16207' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.user_role !== 'admin') return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('merchandise')
        .insert([{
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          shipping: parseFloat(form.shipping),
          image_url: form.image_url.trim() || null,
          badge_text: form.badge_text.trim() || null,
          badge_color: form.badge_color,
          badge_border_color: form.badge_border_color,
          is_featured: form.is_featured,
          is_active: form.is_active,
          stock_quantity: parseInt(form.stock_quantity),
          category: form.category
        }]);

      if (error) throw error;

      router.push('/admin/merchandise');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyBadgePreset = (preset: typeof badgePresets[0]) => {
    setForm(prev => ({
      ...prev,
      badge_text: preset.text,
      badge_color: preset.color,
      badge_border_color: preset.border
    }));
  };

  if (profile?.user_role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-gothic text-gothic-crimson mb-4">Access Denied</h1>
          <p className="text-gothic-steel">Administrator privileges required.</p>
          <Link href="/admin" className="cyber-button mt-4 inline-block">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link href="/admin/merchandise" className="mr-4 text-gothic-steel hover:text-gothic-silver transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text">
              Add New Product
            </h1>
            <p className="text-gothic-steel mt-2">
              Create a new item for the Black Ledger Goods marketplace
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="gothic-container p-8 space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-gothic-silver font-medium mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                  placeholder="Enter product title..."
                  required
                />
              </div>

              <div>
                <label className="block text-gothic-silver font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver resize-none"
                  placeholder="Enter product description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gothic-silver font-medium mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gothic-silver font-medium mb-2">
                    Shipping ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.shipping}
                    onChange={(e) => handleInputChange('shipping', e.target.value)}
                    className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gothic-silver font-medium mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gothic-silver font-medium mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image and Preview */}
            <div className="space-y-6">
              <div>
                <label className="block text-gothic-silver font-medium mb-2">
                  Product Image URL
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {/* Image Preview */}
                  <div className="aspect-square bg-gothic-dark-gray rounded-lg overflow-hidden relative">
                    {form.image_url ? (
                      <>
                        <img
                          src={form.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLElement;
                            if (errorDiv) errorDiv.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full items-center justify-center text-gothic-crimson" style={{ display: 'none' }}>
                          <div className="text-center">
                            <Package size={48} className="mx-auto mb-2" />
                            <p className="text-sm">Invalid image URL</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                        <div className="text-center">
                          <Upload size={48} className="mx-auto mb-2" />
                          <p className="text-sm">No image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge Preview */}
                    {form.badge_text && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded"
                        style={{
                          backgroundColor: form.badge_color,
                          borderColor: form.badge_border_color,
                          borderWidth: '1px',
                          color: '#ffffff'
                        }}
                      >
                        {form.badge_text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badge Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-gothic text-gothic-silver flex items-center gap-2">
              <Palette size={20} />
              Custom Badge
            </h3>
            
            {/* Badge Presets */}
            <div>
              <label className="block text-gothic-steel font-medium mb-2">
                Quick Badge Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {badgePresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyBadgePreset(preset)}
                    className="p-2 bg-gothic-dark-gray hover:bg-gothic-dark-gray/80 rounded-md transition-colors"
                    style={{
                      borderColor: preset.border,
                      borderWidth: '1px'
                    }}
                  >
                    <div
                      className="px-2 py-1 text-xs font-bold rounded text-white"
                      style={{
                        backgroundColor: preset.color,
                        borderColor: preset.border,
                        borderWidth: '1px'
                      }}
                    >
                      {preset.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Badge Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gothic-steel font-medium mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={form.badge_text}
                  onChange={(e) => handleInputChange('badge_text', e.target.value)}
                  className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                  placeholder="NEW, SALE, etc."
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-gothic-steel font-medium mb-2">
                  Badge Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.badge_color}
                    onChange={(e) => handleInputChange('badge_color', e.target.value)}
                    className="w-12 h-12 rounded-md border border-gothic-dark-gray bg-gothic-dark-gray"
                  />
                  <input
                    type="text"
                    value={form.badge_color}
                    onChange={(e) => handleInputChange('badge_color', e.target.value)}
                    className="flex-1 bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="#666666"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gothic-steel font-medium mb-2">
                  Badge Border Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.badge_border_color}
                    onChange={(e) => handleInputChange('badge_border_color', e.target.value)}
                    className="w-12 h-12 rounded-md border border-gothic-dark-gray bg-gothic-dark-gray"
                  />
                  <input
                    type="text"
                    value={form.badge_border_color}
                    onChange={(e) => handleInputChange('badge_border_color', e.target.value)}
                    className="flex-1 bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    placeholder="#999999"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-gothic text-gothic-silver">Product Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-gothic-silver bg-gothic-dark-gray border-gothic-dark-gray rounded focus:ring-gothic-silver focus:ring-2"
                />
                <span className="text-gothic-silver">Featured Product</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-5 h-5 text-gothic-silver bg-gothic-dark-gray border-gothic-dark-gray rounded focus:ring-gothic-silver focus:ring-2"
                />
                <span className="text-gothic-silver">Active (Visible to customers)</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gothic-dark-gray">
            <button
              type="submit"
              disabled={loading || !form.title || !form.price}
              className="flex-1 cyber-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            
            <Link href="/admin/merchandise" className="flex-1">
              <button
                type="button"
                className="w-full py-3 px-6 bg-gothic-dark-gray hover:bg-gothic-dark-gray/80 text-gothic-steel rounded-md transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
