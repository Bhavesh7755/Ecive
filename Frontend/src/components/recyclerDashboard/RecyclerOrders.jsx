// src/components/recyclerDashboard/RecyclerOrders.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { recyclerAPI } from "../../services/authService";
import RecyclerRequestCard from "./RecyclerRequestCard";

export default function RecyclerOrders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await recyclerAPI.getRecyclerRequests(); // Fetch latest posts for recycler
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-10">
        Error: {error}
        <button
          onClick={fetchRequests}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-6 px-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center mb-6">
        <Package size={28} className="text-emerald-500 mr-3" />
        <h2 className="text-2xl font-bold">Latest Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          No requests available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <motion.div
              key={req.postId}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <RecyclerRequestCard request={req} onUpdate={fetchRequests} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}