import React, { useEffect, useState } from "react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerDashboardHome({ recycler }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recycler?._id) return;

    async function fetchDashboardStats() {
      try {
        const res = await recyclerAPI.getRecyclerDashboardStats();
        
        const data = res?.data?.stats || res?.stats || {
          totalOrders: 0,
          acceptedRequests: 0,
          pendingRequests: 0,
          totalEarnings: 0,
        };

        setStats(data);
      } catch (err) {
        console.log("Dashboard Stats Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [recycler]);

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {recycler?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your orders, requests and earnings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders" value={stats.totalOrders} color="blue" />
        <StatCard title="Accepted Requests" value={stats.acceptedRequests} color="green" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} color="orange" />
        <StatCard
          title="Total Earnings (₹)"
          value={stats.totalEarnings}
          color="purple"
        />
      </div>

      {/* About Recycler Shop */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Shop & Profile Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
          <Info label="Shop Name" value={recycler?.shopName} />
          <Info label="City" value={recycler?.city} />
          <Info label="State" value={recycler?.state} />
          <Info label="Verified" value={recycler?.verified ? "✅ Yes" : "❌ No"} />
          <Info label="Rating" value={`${recycler?.rating}/5`} />
        </div>
      </div>
    </div>
  );
}

// Components used below
function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-5 text-center hover:scale-105 transition">
      <p className="text-gray-600 font-medium">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-gray-900">{value}</h2>
      <div className={`h-1 mt-4 rounded-full ${colors[color]}`}></div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}: </span>
      <span className="ml-1">{value || "N/A"}</span>
    </p>
  );
}