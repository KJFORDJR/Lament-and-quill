"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  X,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { useReadModal } from '@/hooks/useReadModal';
import Modal from '@/components/Modal';

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
    customer_notes?: string | null;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updating, setUpdating] = useState(false);
  
  // Modern modal system
  const { isOpen, selectedItem: selectedOrder, openModal, closeModal } = useReadModal<Order>();

  useEffect(() => {
    if (profile && profile.user_role !== "admin") {
      router.push("/");
      return;
    }

    if (profile?.user_role === "admin") {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
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
            customer_notes,
            merchandise (
              title,
              category
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Raw orders data:", data);
      console.log("Number of orders found:", data?.length || 0);

      // Now fetch profiles separately and match them
      const orderData = data || [];
      const userIds = orderData.map((order: any) => order.user_id);

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name, user_role")
          .in("id", userIds);

        if (!profilesError) {
          // Create a map of user profiles
          const profileMap = new Map();
          profiles?.forEach((profile) => {
            profileMap.set(profile.id, profile);
          });

          // Add profile data to orders and extract email from shipping_address
          orderData.forEach((order: any) => {
            const profile = profileMap.get(order.user_id) || {};
            // Get email from shipping address if available
            const email = order.shipping_address?.email || null;
            order.user_profile = {
              ...profile,
              email: email,
            };
          });
        }
      }

      setOrders(orderData as unknown as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      // Refresh orders
      await fetchOrders();

      // Update selected order if it's the one we just updated
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find((o) => o.id === orderId);
        if (updatedOrder) {
          openModal({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      await fetchOrders();

      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find((o) => o.id === orderId);
        if (updatedOrder) {
          openModal({ ...updatedOrder, payment_status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-400" size={16} />;
      case "processing":
        return <RefreshCw className="text-blue-400" size={16} />;
      case "shipped":
        return <Truck className="text-green-400" size={16} />;
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "cancelled":
        return <X className="text-red-400" size={16} />;
      default:
        return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="text-green-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-400" size={16} />;
      case "failed":
        return <X className="text-red-400" size={16} />;
      case "refunded":
        return <RefreshCw className="text-blue-400" size={16} />;
      default:
        return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_profile?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.user_profile?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.user_profile?.display_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + order.total_amount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Customer Username",
      "Total Amount",
      "Order Status",
      "Payment Status",
      "Payment Method",
      "Items Count",
      "Total Quantity",
      "Item Details",
      "Shipping Address",
      "Stripe Payment ID",
      "Order Date",
      "Last Updated",
    ];

    // Convert orders to CSV rows
    const csvData = filteredOrders.map((order) => {
      // Format item details
      const itemDetails = order.order_items
        .map(
          (item) =>
            `${item.merchandise.title} (${item.quantity}x$${item.unit_price.toFixed(2)}=${item.total_price.toFixed(2)})`
        )
        .join("; ");

      // Format shipping address
      const shippingAddress = order.shipping_address
        ? `${order.shipping_address.firstName || ""} ${order.shipping_address.lastName || ""}, ${order.shipping_address.address1 || ""}, ${order.shipping_address.city || ""}, ${order.shipping_address.state || ""} ${order.shipping_address.zipCode || ""}`.trim()
        : "N/A";

      return [
        order.order_number,
        order.user_profile?.display_name ||
          order.user_profile?.username ||
          "N/A",
        order.user_profile?.email || "N/A",
        order.user_profile?.username || "N/A",
        order.total_amount.toFixed(2),
        order.status,
        order.payment_status,
        order.payment_method,
        order.order_items.length,
        order.order_items.reduce((sum, item) => sum + item.quantity, 0),
        `"${itemDetails}"`, // Wrap in quotes to handle commas
        `"${shippingAddress}"`, // Wrap in quotes to handle commas
        order.stripe_payment_intent_id || "N/A",
        new Date(order.created_at).toLocaleString(),
        new Date(order.updated_at).toLocaleString(),
      ];
    });

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDetailedCSV = () => {
    // Create one row per order item for detailed analysis
    const headers = [
      "Order Number",
      "Order Date",
      "Customer Name",
      "Customer Email",
      "Customer Username",
      "Order Total",
      "Order Status",
      "Payment Status",
      "Payment Method",
      "Stripe Payment ID",
      "Item Name",
      "Item Category",
      "Item Quantity",
      "Item Unit Price",
      "Item Total Price",
      "Shipping First Name",
      "Shipping Last Name",
      "Shipping Address",
      "Shipping City",
      "Shipping State",
      "Shipping Zip",
      "Shipping Email",
      "Shipping Phone",
      "Last Updated",
    ];

    const csvData: string[][] = [];

    filteredOrders.forEach((order) => {
      order.order_items.forEach((item) => {
        csvData.push([
          order.order_number,
          new Date(order.created_at).toLocaleString(),
          order.user_profile?.display_name ||
            order.user_profile?.username ||
            "N/A",
          order.user_profile?.email || "N/A",
          order.user_profile?.username || "N/A",
          order.total_amount.toFixed(2),
          order.status,
          order.payment_status,
          order.payment_method,
          order.stripe_payment_intent_id || "N/A",
          `"${item.merchandise.title}"`,
          item.merchandise.category,
          item.quantity.toString(),
          item.unit_price.toFixed(2),
          item.total_price.toFixed(2),
          order.shipping_address?.firstName || "N/A",
          order.shipping_address?.lastName || "N/A",
          order.shipping_address?.address1 || "N/A",
          order.shipping_address?.city || "N/A",
          order.shipping_address?.state || "N/A",
          order.shipping_address?.zipCode || "N/A",
          order.shipping_address?.email || "N/A",
          order.shipping_address?.phone || "N/A",
          new Date(order.updated_at).toLocaleString(),
        ]);
      });
    });

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_detailed_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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
                <p className="text-2xl font-bold text-green-400">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gothic-silver">
                  {totalOrders}
                </p>
              </div>
              <Package className="text-gothic-silver" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {pendingOrders}
                </p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="gothic-container p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gothic-steel text-sm">Shipped Orders</p>
                <p className="text-2xl font-bold text-green-400">
                  {shippedOrders}
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gothic-steel"
                size={16}
              />
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

            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="cyber-button-secondary flex items-center space-x-2"
                disabled={filteredOrders.length === 0}
                title="Export summary view - one row per order"
              >
                <Download size={16} />
                <span>Export Summary</span>
              </button>

              <button
                onClick={exportDetailedCSV}
                className="cyber-button-secondary flex items-center space-x-2"
                disabled={filteredOrders.length === 0}
                title="Export detailed view - one row per item"
              >
                <Download size={16} />
                <span>Export Detailed</span>
              </button>
            </div>
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
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Order
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Items
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Payment
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-gothic-silver font-medium">
                    Actions
                  </th>
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
                          {order.user_profile?.display_name ||
                            order.user_profile?.username ||
                            "N/A"}
                        </div>
                        <div className="text-gothic-steel text-sm">
                          {order.user_profile?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gothic-silver">
                        {order.order_items.length} item
                        {order.order_items.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-gothic-steel text-sm">
                        {order.order_items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        total qty
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
                        onClick={() => openModal(order)}
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
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title={`Order Details - ${selectedOrder.order_number}`}
            size="xl"
          >
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gothic-silver mb-3">
                  Customer
                </h3>
                <div className="space-y-2">
                  <p className="text-gothic-steel">
                    <span className="font-medium">Name:</span>{" "}
                    {selectedOrder.user_profile?.display_name ||
                      selectedOrder.user_profile?.username ||
                      "N/A"}
                  </p>
                  <p className="text-gothic-steel">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedOrder.user_profile?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-medium text-gothic-silver mb-3">
                  Order Info
                </h3>
                <div className="space-y-2">
                  <p className="text-gothic-steel">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                  <p className="text-gothic-steel">
                    <span className="font-medium">Updated:</span>{" "}
                    {new Date(selectedOrder.updated_at).toLocaleString()}
                  </p>
                  <p className="text-gothic-steel">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {selectedOrder.payment_method}
                  </p>
                  {selectedOrder.stripe_payment_intent_id && (
                    <p className="text-gothic-steel">
                      <span className="font-medium">Stripe ID:</span>{" "}
                      {selectedOrder.stripe_payment_intent_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gothic-silver mb-3">
                  Order Status
                </h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.id, e.target.value)
                  }
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
                <h3 className="text-lg font-medium text-gothic-silver mb-3">
                  Payment Status
                </h3>
                <select
                  value={selectedOrder.payment_status}
                  onChange={(e) =>
                    updatePaymentStatus(selectedOrder.id, e.target.value)
                  }
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
              <h3 className="text-lg font-medium text-gothic-silver mb-3">
                Order Items
              </h3>
              <div className="space-y-3">
                {selectedOrder.order_items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gothic-dark-gray/20 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-gothic-silver font-medium">
                          {item.merchandise.title}
                        </h4>
                        <p className="text-gothic-steel text-sm">
                          {item.merchandise.category} • Qty: {item.quantity} •
                          Unit: ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-gothic-silver font-medium">
                          ${item.total_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Customer Notes */}
                    {item.customer_notes && (
                      <div className="mt-3 pt-3 border-t border-gothic-dark-gray">
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-400 mb-1">
                              Customer Notes:
                            </p>
                            <p className="text-sm text-gothic-steel bg-gothic-dark-gray/40 p-2 rounded border-l-2 border-blue-400">
                              {item.customer_notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gothic-dark-gray">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gothic-silver">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gothic-silver">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gothic-silver mb-3">
                  Shipping Address
                </h3>
                <div className="bg-gothic-dark-gray/20 p-4 rounded-lg">
                  <pre className="text-gothic-steel whitespace-pre-wrap">
                    {JSON.stringify(
                      selectedOrder.shipping_address,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}
