'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye,
  ArrowLeft,
  Download,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OrderDetail {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: {
    email: string;
    name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at?: string;
  order_items: Array<{
    quantity: number;
    merchandise: {
      title: string;
      category: string;
    };
  }>;
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchUserOrders();
  }, [user, authLoading]);

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      // First, let's try the same query that works in the profile page
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          shipping_address,
          created_at,
          updated_at,
          order_items!inner (
            quantity,
            merchandise!inner (
              title,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: sortBy === 'oldest' });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      console.log('Orders data:', data); // Debug log
      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid' && status === 'delivered') {
      return <CheckCircle className="text-green-500" size={20} />;
    } else if (paymentStatus === 'paid' && status === 'shipped') {
      return <Truck className="text-blue-500" size={20} />;
    } else if (paymentStatus === 'paid') {
      return <Clock className="text-yellow-500" size={20} />;
    } else {
      return <AlertCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid' && status === 'delivered') {
      return { text: 'Delivered', color: 'text-green-500' };
    } else if (paymentStatus === 'paid' && status === 'shipped') {
      return { text: 'Shipped', color: 'text-blue-500' };
    } else if (paymentStatus === 'paid' && status === 'processing') {
      return { text: 'Processing', color: 'text-yellow-500' };
    } else if (paymentStatus === 'paid') {
      return { text: 'Confirmed', color: 'text-green-500' };
    } else {
      return { text: 'Payment Pending', color: 'text-red-500' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'delivered') return order.status === 'delivered' && order.payment_status === 'paid';
    if (selectedStatus === 'shipped') return order.status === 'shipped' && order.payment_status === 'paid';
    if (selectedStatus === 'processing') return order.payment_status === 'paid' && order.status !== 'delivered' && order.status !== 'shipped';
    if (selectedStatus === 'pending') return order.payment_status !== 'paid';
    return true;
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <button className="cyber-button-secondary flex items-center space-x-2">
                  <ArrowLeft size={16} />
                  <span>Back to Profile</span>
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-gothic font-bold text-gothic-silver">
                  Order History
                </h1>
                <p className="text-gothic-steel">
                  View and track all your orders
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'processing', label: 'Processing' },
                { key: 'pending', label: 'Pending Payment' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedStatus(filter.key)}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    selectedStatus === filter.key
                      ? 'bg-gothic-silver text-gothic-black'
                      : 'bg-gothic-dark-gray text-gothic-steel hover:bg-gothic-charcoal'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gothic-charcoal border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package size={48} className="text-gothic-steel mx-auto mb-4" />
            <p className="text-gothic-steel mb-4">
              {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders found`}
            </p>
            <Link href="/merchandise">
              <div className="cyber-button inline-block">Browse Products</div>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gothic-container p-6"
              >
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status, order.payment_status)}
                    <div>
                      <h3 className="text-lg font-medium text-gothic-silver">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gothic-steel">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-medium text-gothic-silver">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <p className={`text-sm ${getStatusText(order.status, order.payment_status).color}`}>
                        {getStatusText(order.status, order.payment_status).text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gothic-silver">Order Items</h4>
                  {order.order_items.map((item, itemIndex) => (
                    <div key={`order-${order.id}-item-${itemIndex}`} className="flex items-center space-x-4 p-4 bg-gothic-charcoal/30 rounded-lg">
                      <div className="flex-grow">
                        <h5 className="font-medium text-gothic-silver">{item.merchandise.title}</h5>
                        <p className="text-sm text-gothic-steel">{item.merchandise.category}</p>
                        <p className="text-sm text-gothic-steel">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="mt-6 p-4 bg-gothic-dark-gray/30 rounded-lg">
                    <h4 className="text-md font-medium text-gothic-silver mb-2">Shipping Address</h4>
                    <div className="text-sm text-gothic-steel space-y-1">
                      <p>{order.shipping_address.name}</p>
                      <p>{order.shipping_address.street}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                      {order.shipping_address.email && (
                        <p>Email: {order.shipping_address.email}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Timeline */}
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="mt-4 text-xs text-gothic-steel">
                    Last updated: {new Date(order.updated_at).toLocaleString()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 gothic-container p-6"
          >
            <h3 className="text-lg font-medium text-gothic-silver mb-4">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gothic-silver">
                  {filteredOrders.length}
                </p>
                <p className="text-sm text-gothic-steel">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gothic-silver">
                  ${filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gothic-steel">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gothic-silver">
                  {filteredOrders.reduce((sum, order) => 
                    sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
                  )}
                </p>
                <p className="text-sm text-gothic-steel">Items Purchased</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
