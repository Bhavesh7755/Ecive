import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function RecyclerOrders() {
  // Replace with order fetching logic if needed
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8"
    >
      <div className="flex items-center mb-6">
        <Package size={28} className="text-emerald-500 mr-3" />
        <h2 className="text-2xl font-bold">My Orders</h2>
      </div>
      <div className="text-gray-600 text-lg text-center py-8">
        No orders yet.
      </div>
    </motion.div>
  );
}