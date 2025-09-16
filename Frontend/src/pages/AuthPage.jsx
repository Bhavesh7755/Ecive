// @/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, 
  Sparkles, Leaf, Shield, ArrowRight, ArrowLeft,
  CheckCircle, AlertCircle, Star, Building, Truck,
  Upload, FileText, Camera, CreditCard, Award, X
} from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "", 
    address: "", role: "", companyName: "", businessLicense: "", 
    vehicleInfo: "", experience: ""
  });
  
  // Enhanced state for profile image and password matching
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({
    profileImage: null,
    identityDocument: null,
    businessLicense: null,
    vehicleDocument: null
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Role definitions with profile image requirements
  const userRoles = [
    {
      id: 'user',
      name: 'Individual User',
      description: 'List your personal e-waste items for recycling',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      image: '👤',
      identityRequired: ['Government ID', 'Profile Photo'],
      features: ['List e-waste items', 'Get price quotes', 'Schedule pickups', 'Track earnings']
    },
    {
      id: 'recycler',
      name: 'Recycler Company',
      description: 'Bid on e-waste items and process materials',
      icon: Building,
      color: 'from-green-500 to-emerald-500',
      image: '🏢',
      identityRequired: ['Business License', 'Tax Certificate', 'Company Logo', 'Facility Photos'],
      features: ['Bid on items', 'Bulk processing', 'Certified disposal', 'Business analytics']
    },
    {
      id: 'agent',
      name: 'Pickup Agent',
      description: 'Provide pickup and delivery services',
      icon: Truck,
      color: 'from-purple-500 to-pink-500',
      image: '🚚',
      identityRequired: ['Driver License', 'Vehicle Registration', 'Profile Photo', 'Insurance Certificate'],
      features: ['Accept pickup jobs', 'Route optimization', 'Real-time tracking', 'Flexible schedule']
    },
    {
      id: 'admin',
      name: 'Platform Admin',
      description: 'Manage platform operations and users',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      image: '🛡️',
      identityRequired: ['Admin Credentials', 'Security Clearance', 'Official Photo'],
      features: ['User management', 'Platform analytics', 'Quality control', 'System settings']
    }
  ];

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 30,
        y: (e.clientY - window.innerHeight / 2) / 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Real-time password confirmation validation
  useEffect(() => {
    if (formData.confirmPassword === '') {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setFormData({ ...formData, role: roleId });
  };

  // Enhanced profile image upload handler
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setProfileImageFile(file);
      setUploadedFiles({ ...uploadedFiles, profileImage: file });
    }
  };

  const removeProfileImage = () => {
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }
    setProfileImage(null);
    setProfileImageFile(null);
    setUploadedFiles({ ...uploadedFiles, profileImage: null });
  };

  const handleFileUpload = (fileType, file) => {
    setUploadedFiles({ ...uploadedFiles, [fileType]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordMatch) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with role-based logic
    setTimeout(() => {
      setIsLoading(false);
      console.log("Authentication submitted:", formData);
      console.log("Profile image:", profileImageFile);
      console.log("Uploaded files:", uploadedFiles);
      
      // Role-based redirect logic
      if (formData.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (formData.role === 'recycler') {
        window.location.href = '/recycler-dashboard';
      } else if (formData.role === 'agent') {
        window.location.href = '/agent-dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }, 2000);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Enhanced form validation with profile image requirement
  const isStepValid = (step) => {
    switch(step) {
      case 1: return selectedRole !== '';
      case 2: return formData.email && formData.password && passwordMatch && formData.confirmPassword;
      case 3: return formData.name && formData.phone && profileImage; // Profile image required
      case 4: 
        if (selectedRole === 'recycler') {
          return formData.address && formData.companyName && formData.businessLicense;
        } else if (selectedRole === 'agent') {
          return formData.address && formData.vehicleInfo;
        } else {
          return formData.address;
        }
      default: return false;
    }
  };

  // Enhanced Profile Image Upload Component
  const ProfileImageUpload = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Profile Picture * 
        <span className="text-xs text-gray-500 ml-2">(Required for verification)</span>
      </label>
      
      <div className="flex items-center space-x-6">
        {/* Profile Image Preview */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          {profileImage ? (
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img
                src={profileImage}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
              />
              <motion.button
                type="button"
                onClick={removeProfileImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-dashed border-gray-400"
              whileHover={{ borderColor: "#10b981" }}
            >
              <Camera className="w-8 h-8 text-gray-500" />
            </motion.div>
          )}
        </motion.div>

        {/* Upload Button */}
        <div className="flex-1">
          <motion.div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition-all duration-300 cursor-pointer relative overflow-hidden group"
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(34,197,94,0.05)",
              borderColor: "#10b981"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <motion.div
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2 transition-colors" />
            </motion.div>
            <p className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">
              {profileImage ? 'Change Photo' : 'Upload Profile Photo'}
            </p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  // Password Strength Indicator
  const PasswordStrengthIndicator = () => (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: formData.password ? 1 : 0 }}
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

  // Enhanced Password Confirmation with Visual Feedback
  const PasswordConfirmationField = () => (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <Lock className="w-5 h-5 text-green-500" />
      </div>
      <input
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        className={`w-full pl-12 pr-12 py-4 bg-white/70 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 ${
          formData.confirmPassword === '' 
            ? 'border-gray-200 focus:border-green-500' 
            : passwordMatch 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
        }`}
        required
      />
      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: formData.confirmPassword ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {passwordMatch ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </motion.div>
      </div>
      <motion.button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </motion.button>
      
      {/* Real-time password match feedback */}
      <AnimatePresence>
        {formData.confirmPassword && !passwordMatch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Passwords do not match
          </motion.div>
        )}
        {formData.confirmPassword && passwordMatch && formData.confirmPassword !== '' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center text-green-600 text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Passwords match perfectly!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // File Upload Component (same as before)
  const FileUploadCard = ({ fileType, icon: Icon, label, description, file }) => (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => handleFileUpload(fileType, e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <motion.div
        animate={file ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
      </motion.div>
      <p className="font-medium text-gray-800 mb-1">{label}</p>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      {file ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center text-green-600 bg-green-50 rounded-lg py-2"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{file.name}</span>
        </motion.div>
      ) : (
        <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements and mouse follower (same as before) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            <div className={`w-3 h-3 rounded-full ${
              i % 4 === 0 ? 'bg-green-400' : 
              i % 4 === 1 ? 'bg-blue-400' : 
              i % 4 === 2 ? 'bg-emerald-400' : 'bg-cyan-400'
            }`} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="fixed w-6 h-6 bg-green-400 rounded-full pointer-events-none z-10 mix-blend-multiply opacity-30"
        animate={{
          x: mousePosition.x + (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) - 12,
          y: mousePosition.y + (typeof window !== 'undefined' ? window.innerHeight / 2 : 0) - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="w-full max-w-7xl grid md:grid-cols-2 gap-8 items-start relative z-20"
      >
        {/* Left Side - Same as before with role information */}
        <motion.div
          className="hidden md:flex flex-col items-center justify-center p-8 sticky top-8"
          style={{
            x: mousePosition.x * 0.3,
            y: mousePosition.y * 0.3,
          }}
        >
          {!isLogin && selectedRole ? (
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {(() => {
                const role = userRoles.find(r => r.id === selectedRole);
                return (
                  <motion.div
                    className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-r ${role?.color} flex items-center justify-center text-4xl`}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        {role?.image}
                      </motion.div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">{role?.name}</h3>
                      <p className="text-gray-600 mb-6">{role?.description}</p>
                    </div>

                    {/* Identity Requirements */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        Required Documents
                      </h4>
                      <div className="space-y-2">
                        {role?.identityRequired.map((doc, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Shield className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {doc}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-green-600" />
                        Features
                      </h4>
                      <div className="space-y-2">
                        {role?.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </motion.div>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="relative mb-8"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                {[Leaf, Sparkles, Shield, Star].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${-20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 360],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <Icon className="w-8 h-8 text-green-500 opacity-60" />
                  </motion.div>
                ))}
                
                <img
                  src="https://user-gen-media-assets.s3.amazonaws.com/gemini_images/3999aad3-e243-4565-b0d6-a077aeeb46e1.png"
                  alt="Eco Authentication"
                  className="w-full max-w-md rounded-3xl shadow-2xl"
                />
              </motion.div>
              
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                {isLogin ? 'Welcome Back!' : 'Join the Green Revolution'}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {isLogin 
                  ? 'Sign in to continue your sustainable journey'
                  : 'Start your journey towards sustainable e-waste management today.'
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Right Side - Enhanced Forms with Profile Picture and Password Confirmation */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20 rounded-3xl"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(59,130,246,0.05))",
                "linear-gradient(225deg, rgba(59,130,246,0.05), rgba(34,197,94,0.05))",
                "linear-gradient(315deg, rgba(34,197,94,0.05), rgba(59,130,246,0.05))",
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative z-10">
            {/* Toggle Buttons (same as before) */}
            <div className="flex bg-gray-100 rounded-2xl p-2 mb-8">
              <motion.button
                onClick={() => {
                  setIsLogin(true);
                  setCurrentStep(1);
                  setSelectedRole('');
                  setFormData({
                    name: "", email: "", phone: "", password: "", confirmPassword: "", 
                    address: "", role: "", companyName: "", businessLicense: "", 
                    vehicleInfo: "", experience: ""
                  });
                  removeProfileImage();
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsLogin(false);
                  setCurrentStep(1);
                  setSelectedRole('');
                  removeProfileImage();
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Register
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                /* LOGIN FORM (same as before) */
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <motion.h3 
                    className="text-3xl font-bold text-gray-800 mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome Back! 🌱
                  </motion.h3>

                  {/* Role Selection for Login */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Login as</label>
                    <div className="grid grid-cols-2 gap-3">
                      {userRoles.map((role, i) => {
                        const IconComponent = role.icon;
                        return (
                          <motion.button
                            key={role.id}
                            type="button"
                            onClick={() => handleRoleSelect(role.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                              selectedRole === role.id
                                ? 'border-green-500 bg-green-50 shadow-lg'
                                : 'border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-25'
                            }`}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 + 0.4 }}
                          >
                            <motion.div
                              animate={selectedRole === role.id ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{role.name}</p>
                              <div className="text-2xl mt-1">{role.image}</div>
                            </motion.div>
                            {selectedRole === role.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2"
                              >
                                <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Email and Password inputs (same as before) */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <motion.div 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{ rotate: formData.email ? [0, 15, -15, 0] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mail className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-800 placeholder-gray-500"
                      required
                    />
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: formData.email ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-5 h-5 text-green-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-800 placeholder-gray-500"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: showPassword ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </motion.div>
                    </motion.button>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !selectedRole}
                    className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={selectedRole ? { 
                      scale: 1.02, 
                      boxShadow: "0 20px 40px rgba(34,197,94,0.3)",
                      y: -2
                    } : {}}
                    whileTap={selectedRole ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center relative z-10"
                        >
                          <motion.div
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Signing In...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="signin"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center relative z-10"
                        >
                          Sign In as {selectedRole && userRoles.find(r => r.id === selectedRole)?.name}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.form>
              ) : (
                /* ENHANCED MULTI-STEP REGISTER FORM WITH PROFILE PICTURE AND PASSWORD CONFIRMATION */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h3 
                    className="text-3xl font-bold text-gray-800 mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Join Our Community! 🚀
                  </motion.h3>

                  {/* Enhanced Progress Bar (same as before) */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      {[1, 2, 3, 4].map((step) => (
                        <motion.div
                          key={step}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                            currentStep >= step 
                              ? 'bg-green-500 text-white border-green-500' 
                              : 'bg-white text-gray-400 border-gray-300'
                          }`}
                          animate={{
                            scale: currentStep === step ? 1.1 : 1,
                            boxShadow: currentStep === step ? "0 0 20px rgba(34,197,94,0.5)" : "none"
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {currentStep > step ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle className="w-6 h-6" />
                            </motion.div>
                          ) : (
                            step
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full relative"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStep / 4) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span className={currentStep >= 1 ? 'text-green-600 font-medium' : ''}>Role</span>
                      <span className={currentStep >= 2 ? 'text-green-600 font-medium' : ''}>Account</span>
                      <span className={currentStep >= 3 ? 'text-green-600 font-medium' : ''}>Profile</span>
                      <span className={currentStep >= 4 ? 'text-green-600 font-medium' : ''}>Details</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1: Role Selection (same as before) */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                      >
                        <p className="text-center text-gray-600 mb-6">Choose your role on the platform</p>
                        <div className="grid grid-cols-1 gap-4">
                          {userRoles.map((role, i) => {
                            const IconComponent = role.icon;
                            return (
                              <motion.button
                                key={role.id}
                                type="button"
                                onClick={() => handleRoleSelect(role.id)}
                                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                                  selectedRole === role.id
                                    ? 'border-green-500 bg-green-50 shadow-lg'
                                    : 'border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-25'
                                }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-blue-100/50 opacity-0 transition-opacity duration-300"
                                  animate={{ opacity: selectedRole === role.id ? 1 : 0 }}
                                />
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
                                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {role.features.slice(0, 2).map((feature, i) => (
                                        <span key={i} className="text-xs bg-white/80 text-gray-600 px-3 py-1 rounded-full border">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
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
                      </motion.div>
                    )}

                    {/* Step 2: Email & Enhanced Password with Confirmation */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                      >
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
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                            required
                          />
                        </motion.div>

                        {/* Enhanced Password Field with Strength Indicator */}
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
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-12 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                            required
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </motion.button>
                          <PasswordStrengthIndicator />
                        </motion.div>

                        {/* Enhanced Password Confirmation with Real-time Feedback */}
                        <PasswordConfirmationField />
                      </motion.div>
                    )}

                    {/* Step 3: Personal Info + PROFILE PICTURE */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                      >
                        {/* PROFILE PICTURE UPLOAD - NOW REQUIRED */}
                        <ProfileImageUpload />

                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <User className="w-5 h-5 text-green-500" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Phone className="w-5 h-5 text-green-500" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Your phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                            required
                          />
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Step 4: Address & Role-specific Details (same as before with document uploads) */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                      >
                        {/* Address */}
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
                            name="address"
                            placeholder="Your complete address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
                            required
                          />
                        </motion.div>

                        {/* Role-specific fields and documents (same as before) */}
                        {selectedRole === 'recycler' && (
                          <>
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
                                name="companyName"
                                placeholder="Company name"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                required
                              />
                            </motion.div>

                            <motion.div
                              className="relative"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <CreditCard className="w-5 h-5 text-green-500" />
                              </div>
                              <input
                                type="text"
                                name="businessLicense"
                                placeholder="Business license number"
                                value={formData.businessLicense}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                required
                              />
                            </motion.div>

                            {/* Document Upload for Recyclers */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <h4 className="font-semibold text-gray-800 mb-4">Upload Required Documents</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FileUploadCard
                                  fileType="businessLicense"
                                  icon={FileText}
                                  label="Business License"
                                  description="Upload your business license"
                                  file={uploadedFiles.businessLicense}
                                />
                                <FileUploadCard
                                  fileType="identityDocument"
                                  icon={Shield}
                                  label="Identity Document"
                                  description="Government issued ID"
                                  file={uploadedFiles.identityDocument}
                                />
                              </div>
                            </motion.div>
                          </>
                        )}

                        {selectedRole === 'agent' && (
                          <>
                            <motion.div
                              className="relative"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <Truck className="w-5 h-5 text-green-500" />
                              </div>
                              <input
                                type="text"
                                name="vehicleInfo"
                                placeholder="Vehicle details (type, capacity, license)"
                                value={formData.vehicleInfo}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                required
                              />
                            </motion.div>

                            <motion.div
                              className="relative"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="absolute left-4 top-4">
                                <Award className="w-5 h-5 text-green-500" />
                              </div>
                              <textarea
                                name="experience"
                                placeholder="Previous delivery/transport experience (optional)"
                                value={formData.experience}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
                              />
                            </motion.div>

                            {/* Document Upload for Agents */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <h4 className="font-semibold text-gray-800 mb-4">Upload Required Documents</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FileUploadCard
                                  fileType="identityDocument"
                                  icon={Shield}
                                  label="Driver License"
                                  description="Valid driver's license"
                                  file={uploadedFiles.identityDocument}
                                />
                                <FileUploadCard
                                  fileType="vehicleDocument"
                                  icon={Truck}
                                  label="Vehicle Documents"
                                  description="Registration & insurance"
                                  file={uploadedFiles.vehicleDocument}
                                />
                              </div>
                            </motion.div>
                          </>
                        )}

                        {(selectedRole === 'user' || selectedRole === 'admin') && (
                          /* Document Upload for Users and Admins */
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <h4 className="font-semibold text-gray-800 mb-4">Upload Identity Documents</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <FileUploadCard
                                fileType="identityDocument"
                                icon={Shield}
                                label="Government ID"
                                description="Valid government issued ID (passport, driver's license, etc.)"
                                file={uploadedFiles.identityDocument}
                              />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Navigation Buttons */}
                  <motion.div 
                    className="flex justify-between mt-8 pt-6 border-t border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {currentStep > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center px-6 py-3 text-gray-600 hover:text-green-600 font-semibold transition-colors duration-300 rounded-xl hover:bg-green-50"
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </motion.button>
                    )}
                    
                    <motion.button
                      type="button"
                      onClick={currentStep === 4 ? handleSubmit : nextStep}
                      disabled={!isStepValid(currentStep) || isLoading}
                      className={`ml-auto flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${
                        !isStepValid(currentStep) || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      whileHover={isStepValid(currentStep) && !isLoading ? { 
                        scale: 1.05, 
                        x: 5,
                        boxShadow: "0 15px 30px rgba(34,197,94,0.3)"
                      } : {}}
                      whileTap={isStepValid(currentStep) && !isLoading ? { scale: 0.95 } : {}}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center">
                        {isLoading ? (
                          <>
                            <motion.div
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            {currentStep === 4 ? 'Create Account' : 'Next'}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
