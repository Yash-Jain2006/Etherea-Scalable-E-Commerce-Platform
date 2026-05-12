import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, productApi } from '../../api/api';
import { 
  Users, Package, ShoppingCart, DollarSign, 
  TrendingUp, Clock, CheckCircle2, Truck, XCircle,
  Loader2, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const queryClient = useQueryClient();

  // 1. Fetch Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: orderApi.getAdminStats
  });

  // 2. Fetch Orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderApi.getAllOrders({ per_page: 50 })
  });

  // 3. Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['admin-stats']);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-blue-400 bg-blue-500/10';
      case 'shipped': return 'text-yellow-400 bg-yellow-500/10';
      case 'delivered': return 'text-green-400 bg-green-500/10';
      case 'cancelled': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-white/10';
    }
  };

  if (statsLoading || ordersLoading) {
    return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  const stats = statsData?.data || {};

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Platform <span className="text-gradient">Control</span></h1>
        <p className="text-gray-400">Manage products, monitor revenue, and track deliveries.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Revenue', value: `₹${stats.total_revenue?.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'text-primary' },
          { label: 'Active Products', value: stats.total_products, icon: Package, color: 'text-accent' },
          { label: 'Total Customers', value: stats.total_users, icon: Users, color: 'text-secondary' },
        ].map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.label} 
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}><item.icon size={24} /></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">LIVE</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{item.label}</p>
            <h3 className="text-2xl font-black mt-1">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {['stats', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card overflow-hidden">
        {activeTab === 'stats' ? (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Recent Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-500 uppercase border-b border-white/5">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer ID</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {stats.recent_orders?.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono text-primary">#{order.id}</td>
                      <td className="py-4">UID-{order.user_id}</td>
                      <td className="py-4 font-bold">₹{order.total.toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">Order Command Center</h3>
            <div className="space-y-4">
              {ordersData?.data?.orders.map((order) => (
                <div key={order.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/10 text-primary rounded-xl"><ShoppingCart /></div>
                    <div>
                      <h4 className="font-bold">Order #{order.id}</h4>
                      <p className="text-xs text-gray-400">By Customer #{order.user_id} • {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-black text-lg">₹{order.total.toLocaleString()}</p>
                    </div>
                    
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                      className="input-field py-2 text-xs w-32"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
