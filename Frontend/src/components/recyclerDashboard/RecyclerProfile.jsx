import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function RecyclerProfile({ recycler }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow"
    >
      <div className="flex items-center mb-5 space-x-5">
        <img
          className="w-16 h-16 rounded-full border"
          src={recycler?.avatar || "/default-avatar.png"}
          alt={recycler?.fullName}
        />
        <div>
          <div className="font-extrabold text-2xl text-emerald-700">{recycler?.fullName}</div>
          <div className="text-gray-500">{recycler?.email}</div>
        </div>
      </div>
      <ul className="space-y-2 text-lg">
        <li><strong>Shop:</strong> {recycler?.shopName}</li>
        <li><strong>Username:</strong> {recycler?.username}</li>
        <li><strong>Mobile:</strong> {recycler?.mobile}</li>
        <li><strong>City:</strong> {recycler?.city}</li>
        <li><strong>State:</strong> {recycler?.state}</li>
        <li><strong>Pincode:</strong> {recycler?.pincode}</li>
      </ul>
    </motion.div>
  );
}