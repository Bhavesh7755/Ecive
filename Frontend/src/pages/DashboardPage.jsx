// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';
import SellProduct from '../components/dashboard/SellProduct';
import MyPosts from '../components/dashboard/MyPosts';
import UserProfile from '../components/dashboard/UserProfile';
import Settings from '../components/dashboard/Settings';
import { userAPI } from '../services/authService';
import RecyclerList from '../components/dashboard/RecyclerList';
import RecyclerDetails from '../components/dashboard/RecyclerDetails';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSelling, setIsSelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const resp = await userAPI.getCurrentUser();
        if (resp && resp.data) {
          setUser(resp.data);
        } else {
          setUser(resp || null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
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
    navigate('/dashboard/sell');
  }

  function handleSellSuccess() {
    setIsSelling(false);
    setActiveTab('dashboard');
    navigate('/dashboard');
    alert('Your product has been submitted! Processing AI pricing.');
  }

  function handleSellBack() {
    setIsSelling(false);
    setActiveTab('dashboard');
    navigate('/dashboard');
  }

  // NEW: Pass this to SellProduct to navigate to RecyclerList
  function handleFindRecyclers(recyclers) {
    navigate('/dashboard/recycler-list', { state: { recyclers } });
  }

  if (!user) return <div className="p-8 text-center">Loading user data...</div>;

  return (
    <DashboardLayout user={user} activeTab={activeTab} onTabChange={handleTabChange}>
      <Routes>
        <Route
          path="/"
          element={<DashboardHome user={user} onSellClick={handleSellClick} />}
        />
        <Route
          path="sell"
          element={
            <SellProduct
              user={user} // pass user to get city
              onBack={handleSellBack}
              onSubmitSuccess={handleSellSuccess}
              onFindRecyclers={handleFindRecyclers} // pass function for Find Recycler
            />
          }
        />
        <Route path="orders" element={<MyPosts user={user} />} />
        <Route path="profile" element={<UserProfile user={user} />} />
        <Route path="settings" element={<Settings />} />
        <Route path="recycler-list" element={<RecyclerList />} />
        <Route path="recycler-details/:id" element={<RecyclerDetails />} />

      </Routes>
    </DashboardLayout>
  );
}