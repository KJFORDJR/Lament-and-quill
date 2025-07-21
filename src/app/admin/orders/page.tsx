'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  Calendar, 
  DollarSign, 
  Eye, 
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  user_profile?: {
    id: string;
    username: string;
    display_name?: string;
    email?: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    merchandise: {
      title: string;
      category: string;
    };
  }>;
  shipping_address?: any;
}

export default function OrdersAdmin() {
  const { user, profile } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile && profile.user_role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (profile?.user_role === 'admin') {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          payment_method,
          created_at,
          updated_at,
          stripe_payment_intent_id,
          shipping_address,
          user_id,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            merchandise (
              title,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Raw orders data:', data);
      console.log('Number of orders found:', data?.length || 0);
      
      // Now fetch profiles separately and match them
      const orderData = data || [];
      const userIds = orderData.map((order: any) => order.user_id);
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, user_role')
          .in('id', userIds);
          
        if (!profilesError) {
          // Create a map of user profiles
          const profileMap = new Map();
          profiles?.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
          
          // Add profile data to orders and extract email from shipping_address
          orderData.forEach((order: any) => {
            const profile = profileMap.get(order.user_id) || {};
            // Get email from shipping address if available
            const email = order.shipping_address?.email || null;
            order.user_profile = {
              ...profile,
              email: email
            };
          });
        }
      }
      
      setOrders(orderData as unknown as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders
      await fetchOrders();
      
      // Update selected order if it's the one we just updated
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      await fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, payment_status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'processing': return <RefreshCw className="text-blue-400" size={16} />;
      case 'shipped': return <Truck className="text-green-400" size={16} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled': return <X className="text-red-400" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="text-green-500" size={16} />;
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'failed': return <X className="text-red-400" size={16} />;
      case 'refunded': return <RefreshCw className="text-blue-400" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_profile?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading orders...</div>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-gothic font-bold text-gothic-silver mb-2">
                Order Management
              </h1>
              <p className="text-gothic-steel">
                Manage all marketplace orders and transactions
              </p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="cyber-button flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gothic-silver">{totalOrders}</p>
              </div>
              <Package className="text-gothic-silver" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingOrders}</p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Shipped Orders</p>
                <p className="text-2xl font-bold text-green-400">{shippedOrders}</p>
              </div>
              <Truck className="text-green-400" size={24} />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gothic-container p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel" size={16} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <button className="cyber-button-secondary flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="gothic-container overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gothic-dark-gray">
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Order</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Customer</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Items</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Payment</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gothic-dark-gray/30 hover:bg-gothic-dark-gray/10 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gothic-silver font-medium">
                          {order.order_number}
                        </div>
                        <div className="text-gothic-steel text-sm">
                          {order.payment_method}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gothic-silver">
                          {order.user_profile?.display_name || order.user_profile?.username || 'N/A'}
                        </div>
                        <div className="text-gothic-steel text-sm">
                          {order.user_profile?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gothic-silver">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-gothic-steel text-sm">
                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} total qty
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gothic-silver font-medium">
                        ${order.total_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="text-gothic-silver capitalize">
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getPaymentStatusIcon(order.payment_status)}
                        <span className="text-gothic-silver capitalize">
                          {order.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gothic-silver">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-gothic-steel text-sm">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="cyber-button-secondary flex items-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="text-gothic-steel mx-auto mb-4" />
              <p className="text-gothic-steel">No orders found</p>
            </div>
          )}
        </motion.div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gothic-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="gothic-container max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-gothic font-bold text-gothic-silver">
                      Order Details
                    </h2>
                    <p className="text-gothic-steel">{selectedOrder.order_number}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="cyber-button-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Customer</h3>
                    <div className="space-y-2">
                      <p className="text-gothic-steel">
                        <span className="font-medium">Name:</span> {selectedOrder.user_profile?.display_name || selectedOrder.user_profile?.username || 'N/A'}
                      </p>
                      <p className="text-gothic-steel">
                        <span className="font-medium">Email:</span> {selectedOrder.user_profile?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Order Info</h3>
                    <div className="space-y-2">
                      <p className="text-gothic-steel">
                        <span className="font-medium">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}
                      </p>
                      <p className="text-gothic-steel">
                        <span className="font-medium">Updated:</span> {new Date(selectedOrder.updated_at).toLocaleString()}
                      </p>
                      <p className="text-gothic-steel">
                        <span className="font-medium">Payment Method:</span> {selectedOrder.payment_method}
                      </p>
                      {selectedOrder.stripe_payment_intent_id && (
                        <p className="text-gothic-steel">
                          <span className="font-medium">Stripe ID:</span> {selectedOrder.stripe_payment_intent_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Order Status</h3>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      disabled={updating}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Payment Status</h3>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                      disabled={updating}
                      className="w-full bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md px-3 py-2 text-gothic-silver focus:outline-none focus:border-gothic-silver"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gothic-silver mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gothic-dark-gray/20 rounded-lg">
                        <div>
                          <h4 className="text-gothic-silver font-medium">{item.merchandise.title}</h4>
                          <p className="text-gothic-steel text-sm">
                            {item.merchandise.category} • Qty: {item.quantity} • Unit: ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-gothic-silver font-medium">
                            ${item.total_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gothic-dark-gray">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gothic-silver">Total:</span>
                      <span className="text-xl font-bold text-gothic-silver">
                        ${selectedOrder.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Shipping Address</h3>
                    <div className="bg-gothic-dark-gray/20 p-4 rounded-lg">
                      <pre className="text-gothic-steel whitespace-pre-wrap">
                        {JSON.stringify(selectedOrder.shipping_address, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
