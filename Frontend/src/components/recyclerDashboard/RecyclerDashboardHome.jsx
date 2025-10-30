import React from "react";
import { motion } from "framer-motion";
import { Package, Star, Users, Activity } from "lucide-react";

export default function RecyclerDashboardHome({ recycler }) {
  // Replace these with real stats as needed
  const stats = [
    { name: "Total Orders", value: 24, icon: Package, color: "bg-green-500" },
    { name: "Rating", value: recycler.rating ?? 4.7, icon: Star, color: "bg-yellow-400" },
    { name: "Customers Served", value: 112, icon: Users, color: "bg-blue-400" },
    { name: "Active", value: "Yes", icon: Activity, color: "bg-emerald-500" }
  ];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 110, damping: 18 }}
    >
      <motion.div
        className="rounded-2xl p-8 shadow bg-gradient-to-r from-emerald-500 to-green-400 text-white mb-7"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
      >
        <h2 className="text-3xl font-bold mb-2">Welcome, {recycler?.shopName || recycler?.fullName || "Recycler"}! 🎉</h2>
        <p className="text-lg">Manage your orders and connect with your customers efficiently.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            className="bg-white rounded-xl p-6 shadow-md border flex items-center space-x-4"
            key={stat.name}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 140 }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            <span className={`inline-flex p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="text-white" size={28} />
            </span>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.name}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}