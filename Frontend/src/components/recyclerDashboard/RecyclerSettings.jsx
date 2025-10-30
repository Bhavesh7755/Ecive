import React from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

export default function RecyclerSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 38 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow"
    >
      <div className="flex items-center mb-5">
        <SettingsIcon size={28} className="text-gray-700 mr-3" />
        <h2 className="text-2xl font-extrabold">Settings</h2>
      </div>
      <div className="text-gray-600 text-lg py-10 text-center">
        Settings/Preferences page is under development.
      </div>
    </motion.div>
  );
}