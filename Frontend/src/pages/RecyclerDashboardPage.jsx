import React, { useEffect, useState } from "react";

import { recyclerAPI } from "../services/authService";
import RecyclerDashboardLayout from "../components/recyclerDashboard/RecyclerDashboardLayout";
import RecyclerDashboardHome from "../components/recyclerDashboard/RecyclerDashboardHome";
import RecyclerProfile from "../components/recyclerDashboard/RecyclerProfile";
import RecyclerOrders from "../components/recyclerDashboard/RecyclerOrders";
import RecyclerSettings from "../components/recyclerDashboard/RecyclerSettings";

export default function RecyclerDashboardPage() {
  const [recycler, setRecycler] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecycler() {
      try {
        const stored = localStorage.getItem("user");
        setRecycler(stored ? JSON.parse(stored) : null);

        // Optionally, fetch fresh recycler profile here
        // const resp = await recyclerAPI.getProfile();
        // setRecycler(resp.data || stored ? JSON.parse(stored) : null);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecycler();
  }, []);

  const handleTabChange = (tab) => setActiveTab(tab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center shadow-lg">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <RecyclerDashboardLayout recycler={recycler} activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "dashboard" && <RecyclerDashboardHome recycler={recycler} />}
      {activeTab === "orders" && <RecyclerOrders recycler={recycler} />}
      {activeTab === "profile" && <RecyclerProfile recycler={recycler} />}
      {activeTab === "settings" && <RecyclerSettings recycler={recycler} />}
    </RecyclerDashboardLayout>
  );
}