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
        // server returns ApiResponse: { statusCode, data, message, success }
        if (resp && resp.data) {
          setUser(resp.data);
        } else {
          // fallback: maybe resp is already a user object
          setUser(resp || null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        // Optionally redirect to login if unauthorized
      }
    }
    fetchUser();
  }, []);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setIsSelling(tab === 'sell');
  }

  function handleSellClick() {
    setActiveTab('sell');
    setIsSelling(true);
  }

  function handleSellSuccess(data) {
    setIsSelling(false);
    setActiveTab('dashboard');
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
        <SellProduct onBack={handleSellBack} onSubmitSuccess={handleSellSuccess} />
      )}
      {activeTab === 'orders' && <MyPosts user={user} />}
      {activeTab === 'profile' && <UserProfile user={user} />}
      {activeTab === 'settings' && <Settings />}
    </DashboardLayout>
  );
}