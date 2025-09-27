// src/components/dashboard/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Package, DollarSign, Clock, Plus, Eye, MessageCircle
} from 'lucide-react';

export default function DashboardHome({ onSellClick, user }) {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activePosts: 0,
    completedOrders: 0,
    pendingOffers: 0
  });

  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    // TODO: Fetch stats and recent posts from API
    setStats({
      totalEarnings: 15800,
      activePosts: 4,
      completedOrders: 14,
      pendingOffers: 1
    });
    setRecentPosts([
      {
        _id: '1',
        products: [{ wasteType: 'electronics', brand: 'Apple', model: 'iPhone 12' }],
        aiSuggestedPrice: 25000,
        status: 'negotiation',
        createdAt: '2025-09-23'
      },
      {
        _id: '2',
        products: [{ wasteType: 'plastic' }],
        aiSuggestedPrice: 1000,
        status: 'waitingRecycler',
        createdAt: '2025-09-20'
      }
    ]);
  }, []);

  const statCards = [
    { title: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'Active Posts', value: stats.activePosts, icon: Package, color: 'bg-blue-500' },
    { title: 'Completed', value: stats.completedOrders, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Pending Offers', value: stats.pendingOffers, icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h2>
            <p className="text-green-100 text-lg">
              Ready to turn your e-waste into cash? Let's get started!
            </p>
          </div>
          <motion.button
            onClick={onSellClick}
            className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} /> <span>Sell Product</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <motion.div
            key={card.title}
            className="bg-white rounded-xl p-6 shadow-sm border"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
            <p className="text-gray-600">{card.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recent Posts</h3>
          <button className="text-green-600 hover:text-green-700 font-medium">
            View All
          </button>
        </div>

        {recentPosts.length === 0 && <p>No posts yet.</p>}

        <div className="space-y-4">
          {recentPosts.map((post) => {
            const product = post.products[0];
            return (
              <motion.div
                key={post._id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-green-200 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="text-gray-400" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{product.brand || product.wasteType} {product.model || ''}</h4>
                  <p className="text-sm text-gray-600">{product.category || product.wasteType}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{post.aiSuggestedPrice?.toLocaleString() || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'negotiation' ? 'bg-orange-100 text-orange-600' :
                      post.status === 'waitingRecycler' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Eye size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MessageCircle size={16} className="text-gray-600" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}