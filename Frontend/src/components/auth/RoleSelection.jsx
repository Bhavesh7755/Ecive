import React from 'react';
import { motion } from 'framer-motion';
import { User, Building, Truck, Shield, CheckCircle } from 'lucide-react';

const userRoles = [
  {
    id: 'user',
    name: 'Individual User',
    description: 'List your personal e-waste items',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    image: '👤',
  },
  {
    id: 'recycler',
    name: 'Recycler Company', 
    description: 'Bid on e-waste items and process materials',
    icon: Building,
    color: 'from-green-500 to-emerald-500',
    image: '🏢',
  }
];

export default function RoleSelection({ selectedRole, onRoleSelect, error }) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 mb-6">Choose your role on the platform</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {userRoles.map((role, i) => {
          const IconComponent = role.icon;
          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onRoleSelect(role.id)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                selectedRole === role.id
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white/50 hover:border-green-300'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start space-x-4 relative z-10">
                <motion.div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center flex-shrink-0 text-2xl`}
                  animate={selectedRole === role.id ? { 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {role.image}
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1 text-lg">{role.name}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                {selectedRole === role.id && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-green-500"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
