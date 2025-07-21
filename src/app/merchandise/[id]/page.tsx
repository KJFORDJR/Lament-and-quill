'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, Heart, Share2, Plus, Minus, Package } from 'lucide-react';
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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [product, setProduct] = useState<MerchandiseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/merchandise');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setAddingToCart(true);

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('merchandise_id', params.id)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            merchandise_id: params.id,
            quantity: quantity
          });

        if (error) throw error;
      }

      // Show success dialog
      setShowAddToCartDialog(true);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-gothic text-gothic-crimson mb-4">Product Not Found</h1>
          <button onClick={() => router.push('/merchandise')} className="cyber-button">
            Back to Merchandise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/merchandise')}
            className="flex items-center text-gothic-steel hover:text-gothic-silver transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Merchandise
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gothic-dark-gray/20 rounded-lg overflow-hidden border border-gothic-dark-gray/30 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                  <Package size={120} />
                </div>
              )}

              {/* Badge */}
              {product.badge_text && (
                <div
                  className="absolute top-4 left-4 px-3 py-2 text-sm font-bold rounded"
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

              {/* Featured Badge */}
              {product.is_featured && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-gothic-black px-3 py-2 text-sm rounded font-medium">
                  Featured
                </div>
              )}

              {/* Out of Stock Overlay */}
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-gothic-black/60 flex items-center justify-center">
                  <span className="text-red-400 font-bold text-2xl">Out of Stock</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Title and Category */}
            <div>
              <div className="mb-2">
                <span className="inline-block px-3 py-1 text-sm rounded bg-gothic-steel/20 text-gothic-steel capitalize">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl font-gothic font-bold text-gothic-silver mb-4">
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gothic-silver">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gothic-steel leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  product.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="font-medium">
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} in stock` 
                    : 'Out of stock'
                  }
                </span>
              </div>
              
              {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                <span className="text-yellow-400 text-sm font-medium">
                  Limited quantity!
                </span>
              )}
            </div>

            {/* Quantity Selector and Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gothic-silver font-medium">Quantity:</span>
                  <div className="flex items-center border border-gothic-dark-gray rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gothic-steel hover:text-gothic-silver transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 text-gothic-silver border-x border-gothic-dark-gray">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2 text-gothic-steel hover:text-gothic-silver transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    onClick={addToCart}
                    disabled={addingToCart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cyber-button flex-1 flex items-center justify-center space-x-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={20} />
                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                  </motion.button>

                  <button className="p-4 border border-gothic-dark-gray rounded-lg text-gothic-steel hover:text-red-400 hover:border-red-400 transition-colors">
                    <Heart size={20} />
                  </button>

                  <button className="p-4 border border-gothic-dark-gray rounded-lg text-gothic-steel hover:text-gothic-silver hover:border-gothic-silver transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gothic-dark-gray pt-6">
              <div className="space-y-3 text-sm text-gothic-steel">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="text-gothic-silver font-mono">{product.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Added:</span>
                  <span className="text-gothic-silver">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
                {product.updated_at !== product.created_at && (
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="text-gothic-silver">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products or Additional Info could go here */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center">
            <button
              onClick={() => router.push('/merchandise')}
              className="cyber-button"
            >
              Browse More Merchandise
            </button>
          </div>
        </motion.div>
      </div>

      {/* Add to Cart Dialog */}
      <AddToCartDialog
        isOpen={showAddToCartDialog}
        onClose={() => setShowAddToCartDialog(false)}
        productTitle={product?.title}
      />
    </div>
  );
}
