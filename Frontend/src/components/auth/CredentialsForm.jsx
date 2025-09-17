import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function CredentialsForm({ 
  email, 
  password, 
  onChange, 
  showPassword, 
  toggleShowPassword,
  passwordStrength = 0 
}) {
  
  const PasswordStrengthIndicator = () => (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: password ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < passwordStrength 
                ? passwordStrength <= 2 ? 'bg-red-400' : passwordStrength <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                : 'bg-gray-200'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < passwordStrength ? 1 : 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
      <p className={`text-xs ${
        passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {passwordStrength === 0 && 'Enter a password'}
        {passwordStrength === 1 && 'Weak password'}
        {passwordStrength === 2 && 'Fair password'}
        {passwordStrength === 3 && 'Good password'}
        {passwordStrength === 4 && 'Strong password'}
        {passwordStrength === 5 && 'Very strong password'}
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Mail className="w-5 h-5 text-green-500" />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          value={email}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          required
        />
        <motion.div
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: email ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
        </motion.div>
      </motion.div>

      {/* Password Input */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Lock className="w-5 h-5 text-green-500" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a strong password"
          value={password}
          onChange={onChange}
          className="w-full pl-12 pr-12 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          required
        />
        <motion.button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </motion.button>
        <PasswordStrengthIndicator />
      </motion.div>
    </div>
  );
}
