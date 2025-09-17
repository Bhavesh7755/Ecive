import React from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, X } from 'lucide-react';

export default function FileUpload({ 
  label, 
  description, 
  file, 
  onFileChange, 
  onRemove,
  accept = "image/*",
  required = false,
  icon: Icon = Upload 
}) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
        {description && <span className="text-xs text-gray-500 ml-2">({description})</span>}
      </label>
      
      <motion.div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        whileHover={{ 
          backgroundColor: "rgba(34,197,94,0.05)",
          borderColor: "#10b981"
        }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'} transition-colors`} />
        </motion.div>
        
        <p className="font-medium text-gray-800 mb-1">
          {file ? 'Change File' : `Upload ${label}`}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          Click to upload or drag and drop
        </p>
        
        {file ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center text-green-600 bg-green-50 rounded-lg py-2 px-4 relative"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{file.name}</span>
            {onRemove && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="ml-3 text-red-500 hover:text-red-700"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        )}
      </motion.div>
    </motion.div>
  );
}
