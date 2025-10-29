// src/components/dashboard/DashboardLayout.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Package, MessageCircle, User, Settings, LogOut, Bell, Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/authService';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'sell', label: 'Sell Product', icon: Plus },
  { id: 'orders', label: 'My Posts', icon: Package },
  { id: 'chats', label: 'Messages', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children, activeTab, onTabChange, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userAPI.logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-600">Ecive</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30`}
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold text-green-600 mb-8">Ecive</h1>

            {/* User Info */}
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{user?.fullName}</h3>
                  {/* <p className="text-sm text-gray-600">{user?.email}</p> */}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-green-600 border-r-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search your items..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </motion.button>

                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}