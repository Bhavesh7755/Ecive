import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function AddressForm({ 
  AddressLine1, 
  AddressLine2, 
  city, 
  state, 
  pincode, 
  onChange 
}) {
  return (
    <div className="space-y-6">
      {/* Address Line 1 */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-4">
          <MapPin className="w-5 h-5 text-green-500" />
        </div>
        <textarea
          name="AddressLine1"
          placeholder="Address Line 1 (Street, Building, Apartment)"
          value={AddressLine1}
          onChange={onChange}
          rows={2}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
          required
        />
      </motion.div>

      {/* Address Line 2 */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-4">
          <MapPin className="w-5 h-5 text-green-500" />
        </div>
        <textarea
          name="AddressLine2"
          placeholder="Address Line 2 (Landmark, Area, Locality)"
          value={AddressLine2}
          onChange={onChange}
          rows={2}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
          required
        />
      </motion.div>

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
        >
          <input
            type="text"
            name="city"
            placeholder="City"
            value={city}
            onChange={onChange}
            className="w-full p-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
            required
          />
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <input
            type="text"
            name="state"
            placeholder="State"
            value={state}
            onChange={onChange}
            className="w-full p-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
            required
          />
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={pincode}
            onChange={onChange}
            className="w-full p-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
            required
          />
        </motion.div>
      </div>
    </div>
  );
}
