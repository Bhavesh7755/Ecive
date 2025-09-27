// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';
import SellProduct from '../components/dashboard/SellProduct';
import MyPosts from '../components/dashboard/MyPosts';
import UserProfile from '../components/dashboard/UserProfile';
import Settings from '../components/dashboard/Settings';
import { userAPI } from '../services/authService';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
  async function fetchUser() {
    try {
      const resp = await userAPI.getCurrentUser();

      console.log("Fetched user response:", resp);

      // if API returns { success, data: {...user} }
      setUser(resp.data || resp);

    } catch (err) {
      console.error('Failed to fetch user:', err);
      // Optionally redirect to login if unauthorized
    }
  }
  fetchUser();
}, []);

  // Handle sidebar/menu tab change
  function handleTabChange(tab) {
    setActiveTab(tab);
    setIsSelling(tab === 'sell'); // Only show SellProduct on 'sell'
  }

  // Handle "Sell Product" button (in DashboardHome)
  function handleSellClick() {
    setActiveTab('sell');
    setIsSelling(true);
  }

  function handleSellSuccess(data) {
    setIsSelling(false);
    setActiveTab('dashboard');
    // Optionally refresh posts here
    alert('Your product has been submitted! Processing AI pricing.');
  }

  function handleSellBack() {
    setIsSelling(false);
    setActiveTab('dashboard');
  }

  if (!user) return <div className="p-8 text-center">Loading user data...</div>;

  return (
    <DashboardLayout user={user} activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'dashboard' && (
        <DashboardHome user={user} onSellClick={handleSellClick} />
      )}
      {activeTab === 'sell' && isSelling && (
        <SellProduct
          onBack={handleSellBack}
          onSubmitSuccess={handleSellSuccess}
        />
      )}
      {activeTab === 'orders' && (
        <MyPosts user={user} />
      )}
      {activeTab === 'profile' && (
        <UserProfile user={user} />
      )}
      {activeTab === 'settings' && (
        <Settings />
      )}
    </DashboardLayout>
  );
}
