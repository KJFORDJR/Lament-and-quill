'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, Download, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    merchandise: {
      title: string;
      price: number;
      category: string;
    };
  }>;
}

export default function OrderConfirmation() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrder();
  }, [user, userLoading, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_status,
          status,
          created_at,
          order_items (
            quantity,
            merchandise (
              title,
              price,
              category
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data as any);
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const hasDigitalItems = order?.order_items?.some(item => item.merchandise.category === 'digital') || false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Order not found</div>
          <button
            onClick={() => router.push('/')}
            className="cyber-button"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-gothic font-bold text-gothic-silver mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gothic-steel">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gothic-container p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-2">
                Order Details
              </h2>
              <p className="text-gothic-steel">
                Order #{order.order_number}
              </p>
              <p className="text-gothic-steel text-sm">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                order.payment_status === 'paid' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {order.payment_status === 'paid' ? '✓ Paid' : 'Processing Payment'}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gothic-silver">Items Ordered</h3>
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gothic-dark-gray/20 rounded-lg">
                <div>
                  <h4 className="text-gothic-silver font-medium">{item.merchandise.title}</h4>
                  <p className="text-gothic-steel text-sm">
                    {item.merchandise.category === 'digital' ? '📱 Digital Good' : '📦 Physical Item'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-gothic-silver">
                    ${item.merchandise.price.toFixed(2)} × {item.quantity}
                  </div>
                  <div className="text-gothic-steel text-sm">
                    ${(item.merchandise.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gothic-dark-gray pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gothic-silver">Total:</span>
              <span className="text-gothic-silver">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="gothic-container p-6">
            <div className="flex items-center mb-4">
              <Mail size={24} className="text-gothic-silver mr-3" />
              <h3 className="text-lg font-gothic font-bold text-gothic-silver">
                Confirmation Email
              </h3>
            </div>
            <p className="text-gothic-steel mb-4">
              A confirmation email has been sent to your registered email address with order details and receipt.
            </p>
            <div className="text-sm text-gothic-steel">
              📧 Check your inbox (and spam folder)
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center mb-4">
              {hasDigitalItems ? (
                <Download size={24} className="text-gothic-silver mr-3" />
              ) : (
                <Package size={24} className="text-gothic-silver mr-3" />
              )}
              <h3 className="text-lg font-gothic font-bold text-gothic-silver">
                {hasDigitalItems ? 'Digital Access' : 'Shipping'}
              </h3>
            </div>
            {hasDigitalItems ? (
              <div>
                <p className="text-gothic-steel mb-4">
                  Your digital items are being processed and will be available shortly.
                </p>
                <div className="text-sm text-gothic-steel">
                  📱 Access links will be emailed within 24 hours
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gothic-steel mb-4">
                  Your order is being prepared for shipment. You'll receive tracking information once shipped.
                </p>
                <div className="text-sm text-gothic-steel">
                  📦 Expected delivery: 3-5 business days
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="cyber-button-secondary"
            >
              View Order History
            </button>
            <button
              onClick={() => router.push('/merchandise')}
              className="cyber-button"
            >
              Continue Shopping
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 p-6 bg-gothic-dark-gray/10 rounded-lg"
        >
          <p className="text-gothic-steel text-sm mb-2">
            Questions about your order?
          </p>
          <p className="text-gothic-steel text-sm">
            Contact us at <span className="text-gothic-silver">support@lamentandquill.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
