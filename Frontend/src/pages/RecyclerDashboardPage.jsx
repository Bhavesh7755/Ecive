import React, { useEffect, useState } from "react";

import { recyclerAPI } from "../services/authService";
import RecyclerDashboardLayout from "../components/recyclerDashboard/RecyclerDashboardLayout";
import RecyclerDashboardHome from "../components/recyclerDashboard/RecyclerDashboardHome";
import RecyclerProfile from "../components/recyclerDashboard/RecyclerProfile";
import RecyclerOrders from "../components/recyclerDashboard/RecyclerOrders";
import RecyclerSettings from "../components/recyclerDashboard/RecyclerSettings";
import RecyclerEarnings from "../components/recyclerDashboard/RecyclerEarnings";
import RecyclerRequests from "../components/recyclerDashboard/RecyclerRequests";
import RecyclerNotifications from "../components/recyclerDashboard/RecyclerNotifications"; // ✅ Fix added!

export default function RecyclerDashboardPage() {
    const [recycler, setRecycler] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchRecycler() {
            try {
                const storedUser = localStorage.getItem("user");
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;

                if (!parsedUser) {
                    setError("User not logged in!");
                    return;
                }

                setRecycler(parsedUser);
                setError("");

                // ✅ Optional: Fetch fresh profile if needed
                // const res = await recyclerAPI.getProfile();
                // setRecycler(res.data || parsedUser);

            } catch (err) {
                setError("Something went wrong while loading account!");
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
                    <div className="text-red-600 mb-4 font-semibold">{error}</div>
                    <button
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        onClick={() => window.location.reload()}
                    >
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
            {activeTab === "requests" && <RecyclerRequests recycler={recycler} />}
            {activeTab === "earnings" && <RecyclerEarnings recycler={recycler} />}
            {activeTab === "notifications" && <RecyclerNotifications recycler={recycler} />}
        </RecyclerDashboardLayout>
    );
}