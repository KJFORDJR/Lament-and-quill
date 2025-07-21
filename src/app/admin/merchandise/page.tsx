'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, Package, ShoppingCart, DollarSign, Tag, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface MerchandiseItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
  badge_text: string | null;
  badge_color: string;
  badge_border_color: string;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function MerchandiseAdmin() {
  const { user, profile } = useUser();
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.user_role === 'admin') {
      fetchMerchandise();
    }
  }, [profile]);

  const fetchMerchandise = async () => {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMerchandise(data || []);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMerchandise = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('merchandise')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMerchandise(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting merchandise:', error);
      alert('Failed to delete product');
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('merchandise')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setMerchandise(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_featured: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('merchandise')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setMerchandise(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_active: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  const filteredMerchandise = merchandise.filter(item => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && item.is_active) ||
      (filter === 'inactive' && !item.is_active) ||
      (filter === 'featured' && item.is_featured);
    
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <Link href="/admin" className="mr-4 text-gothic-steel hover:text-gothic-silver transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text">
                Black Ledger Goods
              </h1>
              <p className="text-gothic-steel mt-2">
                Comprehensive merchandise management system
              </p>
            </div>
          </div>
          
          <Link href="/admin/merchandise/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cyber-button flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Product
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="gothic-container p-6 text-center">
            <Package size={32} className="mx-auto text-gothic-steel mb-2" />
            <div className="text-2xl font-bold text-gothic-silver">{merchandise.length}</div>
            <div className="text-gothic-steel text-sm">Total Products</div>
          </div>
          
          <div className="gothic-container p-6 text-center">
            <Eye size={32} className="mx-auto text-green-400 mb-2" />
            <div className="text-2xl font-bold text-green-400">
              {merchandise.filter(item => item.is_active).length}
            </div>
            <div className="text-gothic-steel text-sm">Active Products</div>
          </div>
          
          <div className="gothic-container p-6 text-center">
            <Star size={32} className="mx-auto text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-yellow-400">
              {merchandise.filter(item => item.is_featured).length}
            </div>
            <div className="text-gothic-steel text-sm">Featured Products</div>
          </div>
          
          <div className="gothic-container p-6 text-center">
            <DollarSign size={32} className="mx-auto text-gothic-crimson mb-2" />
            <div className="text-2xl font-bold text-gothic-crimson">
              ${merchandise.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </div>
            <div className="text-gothic-steel text-sm">Total Value</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gothic-container p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'inactive', 'featured'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-md capitalize transition-colors ${
                    filter === filterOption
                      ? 'bg-gothic-silver text-gothic-black'
                      : 'bg-gothic-dark-gray text-gothic-steel hover:bg-gothic-dark-gray/80'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-2 text-white focus:outline-none focus:border-gothic-silver w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gothic-steel">Loading merchandise...</div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredMerchandise.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`gothic-container p-6 relative ${
                  !item.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-gothic-dark-gray rounded-lg mb-4 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                      <Package size={48} />
                    </div>
                  )}
                </div>

                {/* Badge */}
                {item.badge_text && (
                  <div
                    className="absolute top-8 right-8 px-2 py-1 text-xs font-bold rounded"
                    style={{
                      backgroundColor: item.badge_color,
                      borderColor: item.badge_border_color,
                      borderWidth: '1px',
                      color: '#ffffff'
                    }}
                  >
                    {item.badge_text}
                  </div>
                )}

                {/* Status Indicators */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.is_featured && (
                    <div className="bg-yellow-400 text-gothic-black px-2 py-1 text-xs rounded">
                      Featured
                    </div>
                  )}
                  {!item.is_active && (
                    <div className="bg-gothic-crimson text-white px-2 py-1 text-xs rounded">
                      Inactive
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gothic-silver mb-2 truncate">
                    {item.title}
                  </h3>
                  <p className="text-gothic-steel text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gothic-crimson">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gothic-steel">
                      Stock: {item.stock_quantity}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/merchandise/edit/${item.id}`}>
                    <button className="w-full bg-gothic-steel hover:bg-gothic-steel/80 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </Link>
                  
                  <button
                    onClick={() => deleteMerchandise(item.id)}
                    className="w-full bg-gothic-crimson hover:bg-gothic-crimson/80 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => toggleFeatured(item.id, item.is_featured)}
                    className={`w-full px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 ${
                      item.is_featured
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-gothic-black'
                        : 'bg-gothic-dark-gray hover:bg-gothic-dark-gray/80 text-gothic-steel'
                    }`}
                  >
                    <Star size={14} />
                    {item.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  
                  <button
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className={`w-full px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 ${
                      item.is_active
                        ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    <Eye size={14} />
                    {item.is_active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredMerchandise.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="text-gothic-steel mx-auto mb-4" />
            <p className="text-gothic-steel">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
