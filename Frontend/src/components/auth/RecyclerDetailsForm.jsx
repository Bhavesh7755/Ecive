import React from 'react';
import { motion } from 'framer-motion';
import { Building, Phone } from 'lucide-react';

export default function RecyclerDetailsForm({ 
  fullName, 
  mobile, 
  shopName,
  onChange 
}) {
  return (
    <div className="space-y-6">
      {/* Company/Full Name */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Building className="w-5 h-5 text-green-500" />
        </div>
        <input
          type="text"
          name="fullName"
          placeholder="Company/Business name"
          value={fullName}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          required
        />
      </motion.div>

      {/* Shop Name */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Building className="w-5 h-5 text-green-500" />
        </div>
        <input
          type="text"
          name="shopName"
          placeholder="Shop/Facility name"
          value={shopName}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          required
        />
      </motion.div>

      {/* Mobile */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Phone className="w-5 h-5 text-green-500" />
        </div>
        <input
          type="tel"
          name="mobile"
          placeholder="Company phone number"
          value={mobile}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          required
        />
      </motion.div>
    </div>
  );
}
