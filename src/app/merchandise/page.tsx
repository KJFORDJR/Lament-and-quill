'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Star, Eye, Heart, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import AddToCartDialog from '@/components/AddToCartDialog';

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

export default function Merchandise() {
  const { user } = useUser();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string>('');

  useEffect(() => {
    fetchMerchandise();
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchMerchandise = async () => {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMerchandise(data || []);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalCount = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalCount);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('merchandise_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            merchandise_id: productId,
            quantity: 1
          });

        if (error) throw error;
      }

      await fetchCartCount();
      
      // Show success dialog
      const product = merchandise.find(m => m.id === productId);
      setLastAddedProduct(product?.title || 'Item');
      setShowAddToCartDialog(true);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'collectibles', label: 'Collectibles' },
    { id: 'digital', label: 'Digital Goods' },
    { id: 'services', label: 'Services' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? merchandise 
    : merchandise.filter(product => product.category === activeCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'featured':
        return Number(b.is_featured) - Number(a.is_featured);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <ShoppingBag size={60} className="text-gothic-silver mr-4 animate-pulse-slow" />
            <h1 className="text-5xl md:text-6xl font-gothic font-bold text-gothic-silver glow-text">
              Black Ledger Goods
            </h1>
          </div>
          <p className="text-xl text-gothic-steel max-w-3xl mx-auto">
            Exclusive merchandise and services from the shadow markets. Where style meets substance 
            in the convergence of Crimson passion and Silver precision.
          </p>
          <div className="mt-6 p-4 bg-gothic-dark-gray/20 border border-gothic-silver/30 rounded-lg inline-block">
            <p className="text-gothic-silver text-sm font-medium">
              🛒 Secure Transactions • Cross-City Delivery • Digital Instant Access
            </p>
          </div>
        </motion.div>

        {/* Authentication Notice for Non-Authenticated Users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 border border-amber-500/30 rounded-lg p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%)'
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-tech text-amber-400">Guest Shopping Mode</h3>
            </div>
            <p className="text-amber-300 mb-4">
              You can browse our merchandise catalog, but purchasing requires an account. 
              <Link href="/login" className="text-gothic-silver hover:text-white mx-1 underline transition-colors">
                Login
              </Link>
              or
              <Link href="/register" className="text-gothic-silver hover:text-white mx-1 underline transition-colors">
                Register
              </Link>
              to access the shadow markets.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
              <span className="text-amber-400 font-tech text-sm">Guest Market Access</span>
            </div>
          </motion.div>
        )}

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gothic-silver/20 text-gothic-silver border border-gothic-silver/40'
                    : 'bg-gothic-dark-gray/30 text-gothic-steel hover:text-gothic-silver border border-transparent'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-gothic-steel text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gothic-steel">Loading merchandise...</div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShoppingBag size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel">No products found in this category.</p>
            </div>
          ) : (
            sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/merchandise/${product.id}`)}
              >
                <div className="bg-gothic-dark-gray/20 hover:bg-gothic-dark-gray/30 rounded-lg overflow-hidden border border-gothic-dark-gray/30 hover:border-gothic-silver/30 transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-gothic-charcoal to-gothic-black flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gothic-steel text-6xl opacity-20">📦</div>
                    )}
                    
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-gothic-black/60 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    {product.badge_text && (
                      <div
                        className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded"
                        style={{
                          backgroundColor: product.badge_color,
                          borderColor: product.badge_border_color,
                          borderWidth: '1px',
                          color: '#ffffff'
                        }}
                      >
                        {product.badge_text}
                      </div>
                    )}
                    
                    {/* Status Indicators */}
                    {product.is_featured && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-gothic-black px-2 py-1 text-xs rounded font-medium">
                        Featured
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/merchandise/${product.id}`);
                        }}
                        className="p-2 bg-gothic-black/60 rounded-full text-gothic-steel hover:text-gothic-silver"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist functionality
                        }}
                        className="p-2 bg-gothic-black/60 rounded-full text-gothic-steel hover:text-red-400"
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-gothic font-bold text-gothic-silver mb-2 group-hover:text-white transition-colors">
                      {product.title}
                    </h3>
                    
                    <p className="text-gothic-steel text-sm mb-4 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    {/* Category */}
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 text-xs rounded bg-gothic-steel/20 text-gothic-steel capitalize">
                        {product.category}
                      </span>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gothic-silver">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      {user ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product.id);
                          }}
                          disabled={product.stock_quantity === 0}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            product.stock_quantity > 0
                              ? 'cyber-button hover:shadow-lg hover:shadow-gothic-silver/20'
                              : 'bg-gothic-dark-gray text-gothic-steel cursor-not-allowed'
                          }`}
                        >
                          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/login');
                          }}
                          className="px-4 py-2 rounded-lg font-medium bg-amber-600 hover:bg-amber-700 text-white transition-all"
                        >
                          Login to Purchase
                        </button>
                      )}
                    </div>
                    
                    {/* Stock indicator */}
                    {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                      <div className="mt-2 text-xs text-yellow-400">
                        Only {product.stock_quantity} left in stock
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button 
            onClick={() => router.push('/cart')}
            className="cyber-button flex items-center space-x-2 shadow-lg shadow-gothic-silver/20"
          >
            <ShoppingBag size={20} />
            <span>Cart ({cartCount})</span>
          </button>
        </motion.div>

        {/* Add to Cart Dialog */}
        <AddToCartDialog
          isOpen={showAddToCartDialog}
          onClose={() => setShowAddToCartDialog(false)}
          productTitle={lastAddedProduct}
        />
      </div>
    </div>
  );
}
