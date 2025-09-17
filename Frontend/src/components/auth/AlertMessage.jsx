import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function AlertMessage({ type, message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-6 p-4 rounded-2xl flex items-center justify-between ${
        type === 'error' 
          ? 'bg-red-50 border border-red-200 text-red-800' 
          : 'bg-green-50 border border-green-200 text-green-800'
      }`}
    >
      <div className="flex items-center">
        {type === 'error' ? (
          <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
        )}
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <motion.button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
