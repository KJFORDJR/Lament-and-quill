'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, Calendar, Download, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber } from '@/utils/phoneUtils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_time: number;
    merchandise_snapshot: {
      title: string;
      price: number;
      image_url?: string;
    };
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return; // Wait for auth to load
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (params.id) {
      fetchOrder();
    }
  }, [user, userLoading, params.id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            merchandise_snapshot
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/merchandise');
    } finally {
      setLoading(false);
    }
  };

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
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-gothic text-gothic-crimson mb-4">Order Not Found</h1>
          <button 
            onClick={() => router.push('/merchandise')} 
            className="cyber-button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-gothic font-bold text-gothic-silver mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gothic-steel mb-2">
            Thank you for your purchase from Black Ledger Goods
          </p>
          <p className="text-gothic-steel">
            Order #{order.order_number}
          </p>
          
          <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg inline-block">
            <p className="text-green-400 text-sm font-medium flex items-center">
              <Mail size={16} className="mr-2" />
              Confirmation email sent to {order.shipping_address.email}
            </p>
          </div>
        </motion.div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="gothic-container p-8 mb-8"
            >
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-6">
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gothic-dark-gray/20 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gothic-dark-gray rounded-lg flex-shrink-0 overflow-hidden">
                      {item.merchandise_snapshot.image_url ? (
                        <img
                          src={item.merchandise_snapshot.image_url}
                          alt={item.merchandise_snapshot.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gothic-silver">
                        {item.merchandise_snapshot.title}
                      </h3>
                      <p className="text-gothic-steel">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-gothic-steel">
                        ${item.price_at_time.toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gothic-silver">
                        ${(item.price_at_time * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="gothic-container p-8"
            >
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4 flex items-center">
                <MapPin size={20} className="mr-3" />
                Shipping Address
              </h2>
              
              <div className="text-gothic-steel space-y-1">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && (
                  <p>{order.shipping_address.address2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                </p>
                <p>{order.shipping_address.country}</p>
                <div className="pt-2 border-t border-gothic-dark-gray mt-3">
                  <p>{order.shipping_address.email}</p>
                  <p>{formatPhoneNumber(order.shipping_address.phone || '')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary and Status */}
          <div className="space-y-6">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="gothic-container p-6"
            >
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Order Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gothic-steel">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    order.status === 'processing' ? 'bg-yellow-600/20 text-yellow-400' :
                    order.status === 'shipped' ? 'bg-blue-600/20 text-blue-400' :
                    order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                    'bg-gothic-steel/20 text-gothic-steel'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gothic-steel">Payment</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    order.payment_status === 'paid' ? 'bg-green-600/20 text-green-400' :
                    order.payment_status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gothic-steel">Order Date</span>
                  <span className="text-gothic-silver">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gothic-steel">Order placed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ['processing', 'shipped', 'delivered'].includes(order.status)
                      ? 'bg-green-600'
                      : 'bg-gothic-dark-gray'
                  }`}></div>
                  <span className="text-sm text-gothic-steel">Processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ['shipped', 'delivered'].includes(order.status)
                      ? 'bg-green-600'
                      : 'bg-gothic-dark-gray'
                  }`}></div>
                  <span className="text-sm text-gothic-steel">Shipped</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'delivered'
                      ? 'bg-green-600'
                      : 'bg-gothic-dark-gray'
                  }`}></div>
                  <span className="text-sm text-gothic-steel">Delivered</span>
                </div>
              </div>
            </motion.div>

            {/* Order Total */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="gothic-container p-6"
            >
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Order Total
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gothic-steel">Subtotal</span>
                  <span className="text-gothic-silver">
                    ${(order.total_amount / 1.08 - (order.total_amount > 50 ? 0 : 9.99)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gothic-steel">Shipping</span>
                  <span className="text-gothic-silver">
                    {order.total_amount > 50 ? 'Free' : '$9.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gothic-steel">Tax</span>
                  <span className="text-gothic-silver">
                    ${(order.total_amount * 0.08 / 1.08).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gothic-dark-gray pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gothic-silver">Total</span>
                    <span className="text-gothic-silver">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gothic-steel">
                Payment Method: {order.payment_method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={() => router.push('/merchandise')}
                className="cyber-button w-full"
              >
                Continue Shopping
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full border border-gothic-dark-gray text-gothic-steel hover:text-gothic-silver hover:border-gothic-silver transition-colors py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Print Receipt</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 gothic-container p-8 text-center"
        >
          <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-4">
            What's Next?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gothic-steel/20 rounded-full flex items-center justify-center mx-auto">
                <Mail size={24} className="text-gothic-steel" />
              </div>
              <h3 className="font-medium text-gothic-silver">Email Confirmation</h3>
              <p className="text-sm text-gothic-steel">
                Check your email for order details and tracking information
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gothic-steel/20 rounded-full flex items-center justify-center mx-auto">
                <Package size={24} className="text-gothic-steel" />
              </div>
              <h3 className="font-medium text-gothic-silver">Processing</h3>
              <p className="text-sm text-gothic-steel">
                Your order is being prepared for shipment
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gothic-steel/20 rounded-full flex items-center justify-center mx-auto">
                <Truck size={24} className="text-gothic-steel" />
              </div>
              <h3 className="font-medium text-gothic-silver">Shipping</h3>
              <p className="text-sm text-gothic-steel">
                Track your package once it ships
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
