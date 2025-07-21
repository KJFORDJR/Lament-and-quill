'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Database, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  Eye,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers30d: number;
    usersByCity: { crimson: number; silver: number; neutral: number };
    userGrowthRate: number;
  };
  contentStats: {
    totalThreads: number;
    totalReplies: number;
    totalConfessions: number;
    totalLaments: number;
    contentThisWeek: number;
  };
  commerceStats: {
    totalOrders: number;
    totalRevenue: number;
    ordersThisMonth: number;
    revenueThisMonth: number;
    averageOrderValue: number;
    topProducts: Array<{ title: string; sales: number }>;
  };
  engagementStats: {
    postsThisWeek: number;
    averageSessionTime: number;
    bounceRate: number;
    activeThreads: number;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    if (refreshing) return;
    setRefreshing(true);
    
    try {
      // Calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // User Statistics
      const [
        { data: allUsers },
        { data: newUsersThisMonth },
        { data: activeUsers },
        { data: lastMonthUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('id, city_affiliation, created_at'),
        supabase.from('profiles').select('id').gte('created_at', startOfMonth.toISOString()),
        supabase.from('profiles').select('id').gte('updated_at', thirtyDaysAgo.toISOString()),
        supabase.from('profiles').select('id').gte('created_at', lastMonth.toISOString()).lte('created_at', endOfLastMonth.toISOString())
      ]);

      const usersByCity = {
        crimson: allUsers?.filter(u => u.city_affiliation === 'crimson').length || 0,
        silver: allUsers?.filter(u => u.city_affiliation === 'silver').length || 0,
        neutral: allUsers?.filter(u => u.city_affiliation === 'neutral').length || 0
      };

      const userGrowthRate = lastMonthUsers?.length ? 
        ((newUsersThisMonth?.length || 0) - lastMonthUsers.length) / lastMonthUsers.length * 100 : 0;

      // Content Statistics - Using only accessible tables
      const [
        { data: replies },
        { data: confessions },
        { data: laments }
      ] = await Promise.all([
        supabase.from('forum_replies').select('id'),
        supabase.from('crimson_confessions').select('id'),
        supabase.from('lament_submissions').select('id')
      ]);

      // Calculate threads from replies (approximate count)
      const { data: recentReplies } = await supabase
        .from('forum_replies')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Commerce Statistics
      const [
        { data: orders },
        { data: ordersThisMonth },
        { data: orderItems }
      ] = await Promise.all([
        supabase.from('orders').select('id, total_amount, created_at, payment_status').eq('payment_status', 'paid'),
        supabase.from('orders').select('id, total_amount').eq('payment_status', 'paid').gte('created_at', startOfMonth.toISOString()),
        supabase.from('order_items').select('quantity, merchandise!inner(title)')
      ]);

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const revenueThisMonth = ordersThisMonth?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageOrderValue = orders?.length ? totalRevenue / orders.length : 0;

      // Calculate top products
      const productSales: { [key: string]: number } = {};
      orderItems?.forEach(item => {
        const merchandise = item.merchandise as any;
        if (merchandise && Array.isArray(merchandise)) {
          merchandise.forEach((merch: any) => {
            if (merch.title) {
              productSales[merch.title] = (productSales[merch.title] || 0) + item.quantity;
            }
          });
        } else if (merchandise?.title) {
          productSales[merchandise.title] = (productSales[merchandise.title] || 0) + item.quantity;
        }
      });

      const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([title, sales]) => ({ title, sales }));

      // Engagement Statistics
      const [
        { data: recentPosts }
      ] = await Promise.all([
        supabase.from('forum_replies').select('id').gte('created_at', sevenDaysAgo.toISOString())
      ]);

      const analyticsData: AnalyticsData = {
        userStats: {
          totalUsers: allUsers?.length || 0,
          newUsersThisMonth: newUsersThisMonth?.length || 0,
          activeUsers30d: activeUsers?.length || 0,
          usersByCity,
          userGrowthRate
        },
        contentStats: {
          totalThreads: Math.ceil((replies?.length || 0) / 5), // Estimate threads from replies
          totalReplies: replies?.length || 0,
          totalConfessions: confessions?.length || 0,
          totalLaments: laments?.length || 0,
          contentThisWeek: (recentReplies?.length || 0) + (recentPosts?.length || 0)
        },
        commerceStats: {
          totalOrders: orders?.length || 0,
          totalRevenue,
          ordersThisMonth: ordersThisMonth?.length || 0,
          revenueThisMonth,
          averageOrderValue,
          topProducts
        },
        engagementStats: {
          postsThisWeek: recentPosts?.length || 0,
          averageSessionTime: 24, // Placeholder - would need session tracking
          bounceRate: 35, // Placeholder - would need proper analytics
          activeThreads: Math.ceil((recentReplies?.length || 0) / 3) // Estimate active threads
        }
      };

      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-silver">Loading analytics...</div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <button className="cyber-button-secondary flex items-center space-x-2">
                  <ArrowLeft size={16} />
                  <span>Back to Admin</span>
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-gothic font-bold text-gothic-silver">
                  Analytics Dashboard
                </h1>
                <p className="text-gothic-steel">Comprehensive platform metrics and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-md text-gothic-silver focus:outline-none focus:border-gothic-silver"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="cyber-button-secondary flex items-center space-x-2"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {analytics && (
          <>
            {/* Key Metrics Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="gothic-container p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="text-gothic-silver" size={24} />
                  <span className={`text-sm ${analytics.userStats.userGrowthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(analytics.userStats.userGrowthRate)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gothic-silver mb-2">
                  {analytics.userStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gothic-steel">Total Users</div>
                <div className="text-xs text-gothic-steel/70 mt-1">
                  {analytics.userStats.newUsersThisMonth} new this month
                </div>
              </div>

              <div className="gothic-container p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="text-gothic-silver" size={24} />
                  <Activity className="text-green-400" size={16} />
                </div>
                <div className="text-2xl font-bold text-gothic-silver mb-2">
                  {(analytics.contentStats.totalThreads + analytics.contentStats.totalReplies).toLocaleString()}
                </div>
                <div className="text-sm text-gothic-steel">Forum Activity</div>
                <div className="text-xs text-gothic-steel/70 mt-1">
                  {analytics.contentStats.contentThisWeek} posts this week
                </div>
              </div>

              <div className="gothic-container p-6">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="text-gothic-silver" size={24} />
                  <TrendingUp className="text-green-400" size={16} />
                </div>
                <div className="text-2xl font-bold text-gothic-silver mb-2">
                  {analytics.commerceStats.totalOrders.toLocaleString()}
                </div>
                <div className="text-sm text-gothic-steel">Total Orders</div>
                <div className="text-xs text-gothic-steel/70 mt-1">
                  {analytics.commerceStats.ordersThisMonth} this month
                </div>
              </div>

              <div className="gothic-container p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="text-gothic-silver" size={24} />
                  <TrendingUp className="text-green-400" size={16} />
                </div>
                <div className="text-2xl font-bold text-gothic-silver mb-2">
                  {formatCurrency(analytics.commerceStats.totalRevenue)}
                </div>
                <div className="text-sm text-gothic-steel">Total Revenue</div>
                <div className="text-xs text-gothic-steel/70 mt-1">
                  {formatCurrency(analytics.commerceStats.revenueThisMonth)} this month
                </div>
              </div>
            </motion.div>

            {/* Content Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="gothic-container p-6"
              >
                <div className="flex items-center mb-6">
                  <BarChart3 className="text-gothic-silver mr-3" size={24} />
                  <h3 className="text-xl font-gothic font-bold text-gothic-silver">Content Breakdown</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gothic-steel">Forum Threads</span>
                    <span className="text-gothic-silver font-medium">
                      {analytics.contentStats.totalThreads.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gothic-steel">Forum Replies</span>
                    <span className="text-gothic-silver font-medium">
                      {analytics.contentStats.totalReplies.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gothic-crimson">Crimson Confessions</span>
                    <span className="text-gothic-crimson font-medium">
                      {analytics.contentStats.totalConfessions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gothic-silver">Lament Submissions</span>
                    <span className="text-gothic-silver font-medium">
                      {analytics.contentStats.totalLaments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="gothic-container p-6"
              >
                <div className="flex items-center mb-6">
                  <PieChart className="text-gothic-silver mr-3" size={24} />
                  <h3 className="text-xl font-gothic font-bold text-gothic-silver">User Distribution</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gothic-crimson rounded-full mr-3"></div>
                      <span className="text-gothic-steel">Crimson City</span>
                    </div>
                    <span className="text-gothic-silver font-medium">
                      {analytics.userStats.usersByCity.crimson.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gothic-silver rounded-full mr-3"></div>
                      <span className="text-gothic-steel">Silver Heights</span>
                    </div>
                    <span className="text-gothic-silver font-medium">
                      {analytics.userStats.usersByCity.silver.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gothic-steel rounded-full mr-3"></div>
                      <span className="text-gothic-steel">Neutral</span>
                    </div>
                    <span className="text-gothic-silver font-medium">
                      {analytics.userStats.usersByCity.neutral.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Commerce Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="gothic-container p-6 mb-8"
            >
              <div className="flex items-center mb-6">
                <Target className="text-gothic-silver mr-3" size={24} />
                <h3 className="text-xl font-gothic font-bold text-gothic-silver">Commerce Insights</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {formatCurrency(analytics.commerceStats.averageOrderValue)}
                  </div>
                  <div className="text-sm text-gothic-steel">Average Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gothic-silver mb-2">
                    {analytics.engagementStats.activeThreads}
                  </div>
                  <div className="text-sm text-gothic-steel">Active Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gothic-silver mb-2">
                    {analytics.userStats.activeUsers30d}
                  </div>
                  <div className="text-sm text-gothic-steel">Monthly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gothic-silver mb-2">
                    {analytics.engagementStats.postsThisWeek}
                  </div>
                  <div className="text-sm text-gothic-steel">Posts This Week</div>
                </div>
              </div>

              {analytics.commerceStats.topProducts.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gothic-silver mb-4">Top Products</h4>
                  <div className="space-y-2">
                    {analytics.commerceStats.topProducts.map((product, index) => (
                      <div key={product.title} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gothic-crimson rounded-full flex items-center justify-center text-white text-xs mr-3">
                            {index + 1}
                          </div>
                          <span className="text-gothic-silver">{product.title}</span>
                        </div>
                        <span className="text-gothic-steel">{product.sales} sales</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Last Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-gothic-steel/50"
            >
              Last updated: {new Date().toLocaleString()}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
