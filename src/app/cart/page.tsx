'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: string;
  user_id: string;
  merchandise_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  merchandise: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string | null;
    badge_text: string | null;
    badge_color: string;
    badge_border_color: string;
    stock_quantity: number;
    category: string;
  };
}

export default function CartPage() {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return; // Wait for auth to load
    
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCartItems();
  }, [user, userLoading]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          merchandise (
            id,
            title,
            description,
            price,
            image_url,
            badge_text,
            badge_color,
            badge_border_color,
            stock_quantity,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!window.confirm('Remove this item from your cart?')) return;

    setUpdating(itemId);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.merchandise.price * item.quantity), 
    0
  );
  
  // Check if cart contains any physical items (non-digital goods)
  const hasPhysicalItems = cartItems.some(item => item.merchandise.category !== 'digital');
  
  // Only charge shipping for physical items
  const shipping = hasPhysicalItems ? (subtotal > 50 ? 0 : 9.99) : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (userLoading || (!user && !userLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">
          {userLoading ? 'Loading...' : 'Redirecting to login...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">Loading cart...</div>
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <button
              onClick={() => router.push('/merchandise')}
              className="mr-4 text-gothic-steel hover:text-gothic-silver transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text">
                Shopping Cart
              </h1>
              <p className="text-gothic-steel mt-2">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-gothic-crimson hover:text-red-400 transition-colors text-sm"
            >
              Clear Cart
            </button>
          )}
        </motion.div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <ShoppingBag size={80} className="text-gothic-steel mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-gothic text-gothic-steel mb-4">Your cart is empty</h2>
            <p className="text-gothic-steel mb-8">
              Discover our exclusive merchandise and add items to get started
            </p>
            <button
              onClick={() => router.push('/merchandise')}
              className="cyber-button"
            >
              Browse Merchandise
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="gothic-container p-6"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div 
                      className="w-20 h-20 bg-gothic-dark-gray rounded-lg flex-shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/merchandise/${item.merchandise.id}`)}
                    >
                      {item.merchandise.image_url ? (
                        <img
                          src={item.merchandise.image_url}
                          alt={item.merchandise.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                          <Package size={32} />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <h3 
                        className="text-lg font-gothic font-bold text-gothic-silver mb-1 cursor-pointer hover:text-white transition-colors"
                        onClick={() => router.push(`/merchandise/${item.merchandise.id}`)}
                      >
                        {item.merchandise.title}
                      </h3>
                      <p className="text-gothic-steel text-sm mb-2 capitalize">
                        {item.merchandise.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gothic-silver">
                          ${item.merchandise.price.toFixed(2)}
                        </span>
                        
                        {/* Stock warning */}
                        {item.merchandise.stock_quantity < item.quantity && (
                          <span className="text-red-400 text-xs">
                            Only {item.merchandise.stock_quantity} available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="p-1 text-gothic-steel hover:text-gothic-silver transition-colors disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center text-gothic-silver font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.merchandise.stock_quantity}
                        className="p-1 text-gothic-steel hover:text-gothic-silver transition-colors disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="p-2 text-gothic-steel hover:text-gothic-crimson transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Badge */}
                  {item.merchandise.badge_text && (
                    <div className="mt-3">
                      <div
                        className="inline-block px-2 py-1 text-xs font-bold rounded"
                        style={{
                          backgroundColor: item.merchandise.badge_color,
                          borderColor: item.merchandise.badge_border_color,
                          borderWidth: '1px',
                          color: '#ffffff'
                        }}
                      >
                        {item.merchandise.badge_text}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="gothic-container p-6 sticky top-8">
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gothic-steel">Subtotal</span>
                    <span className="text-gothic-silver">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gothic-steel">Shipping</span>
                    <span className="text-gothic-silver">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {!hasPhysicalItems && (
                    <div className="text-green-400 text-xs">
                      📱 Digital goods - No shipping required
                    </div>
                  )}
                  
                  {hasPhysicalItems && shipping === 0 && subtotal > 50 && (
                    <div className="text-green-400 text-xs">
                      🎉 You qualify for free shipping!
                    </div>
                  )}
                  
                  {hasPhysicalItems && shipping > 0 && (
                    <div className="text-gothic-steel text-xs">
                      Free shipping on orders over $50
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gothic-steel">Tax</span>
                    <span className="text-gothic-silver">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gothic-dark-gray pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gothic-silver">Total</span>
                      <span className="text-gothic-silver">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => router.push('/checkout')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cyber-button w-full mt-6 py-4"
                >
                  Proceed to Checkout
                </motion.button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/merchandise')}
                    className="text-gothic-steel hover:text-gothic-silver transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
