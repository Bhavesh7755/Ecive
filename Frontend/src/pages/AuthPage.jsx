import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Import our components
import RoleSelection from "../components/auth/RoleSelection";
import CredentialsForm from "../components/auth/CredentialsForm";
import UserDetailsForm from "../components/auth/UserDetailsForm";
import RecyclerDetailsForm from "../components/auth/RecyclerDetailsForm";
import AddressForm from "../components/auth/AddressForm";
import FileUpload from "../components/auth/FileUpload";
import AlertMessage from "../components/auth/AlertMessage";
import { userAPI, recyclerAPI } from "../services/authService";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');

  // Form data matching backend exactly
  const [formData, setFormData] = useState({
    // Common fields
    email: "",
    password: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    AddressLine1: "",
    AddressLine2: "",

    // User fields
    fullName: "",

    // Recycler fields  
    shopName: "",
  });

  // File states
  const [files, setFiles] = useState({
    avatar: null,
    shopImage: null,
    identity: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
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
    if (error) setError('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (error) setError('');
  };

  const handleFileChange = (fileType) => (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${fileType} should be less than 5MB`);
        return;
      }
      setFiles({ ...files, [fileType]: file });
      setError('');
    }
  };

  const handleFileRemove = (fileType) => () => {
    setFiles({ ...files, [fileType]: null });
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;

      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          throw { message: 'Email and password are required' };
        }

        if (selectedRole === 'recycler') {
          result = await recyclerAPI.login(formData.email, formData.password);
          setSuccess('Recycler login successful!');
          setTimeout(() => navigate('/recycler-dashboard'), 1500);
        } else {
          result = await userAPI.login(formData.email, formData.password);
          setSuccess('Login successful!');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        // Registration
        // Registration
        if (!files.avatar) {
          throw { message: 'Profile picture is required' };
        }

        if (selectedRole === 'recycler') {
          if (!files.shopImage || !files.identity) {
            throw { message: 'Shop image and identity document are required' };
          }

          // Pass formData and files separately
          result = await recyclerAPI.register(formData, files);
          setSuccess("Recycler registration successful!");
          setTimeout(() => navigate("/recycler-dashboard"), 1500);

        } else {
          // User Registration - pass formData and avatar file
          result = await userAPI.register(formData, files.avatar);
          setSuccess("Registration successful!");
          setTimeout(() => navigate("/dashboard"), 1500);
        }
        
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Validation for each step
  const isStepValid = (step) => {
    switch (step) {
      case 1: return selectedRole !== '';
      case 2: return formData.email && formData.password;
      case 3:
        if (selectedRole === 'user') {
          return formData.fullName && formData.mobile && files.avatar;
        } else if (selectedRole === 'recycler') {
          return formData.fullName && formData.mobile && formData.shopName && files.avatar;
        }
        return false;
      case 4:
        return formData.AddressLine1 && formData.city && formData.state && formData.pincode;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <AlertMessage
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}
          {success && (
            <AlertMessage
              type="success"
              message={success}
            />
          )}
        </AnimatePresence>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-2xl p-2 mb-8">
          <button
            onClick={() => {
              setIsLogin(true);
              setCurrentStep(1);
              setSelectedRole('');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${isLogin
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-green-600'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setCurrentStep(1);
              setSelectedRole('');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${!isLogin
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-green-600'
              }`}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            /* LOGIN FORM */
            <motion.form
              key="login"
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Welcome Back! 🌱
              </h3>

              <RoleSelection
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
                error={!selectedRole && error ? 'Please select your role' : ''}
              />

              <CredentialsForm
                email={formData.email}
                password={formData.password}
                onChange={handleInputChange}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                passwordStrength={passwordStrength}
              />

              <button
                type="submit"
                disabled={isLoading || !selectedRole || !formData.email || !formData.password}
                className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 ${(!selectedRole || !formData.email || !formData.password || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? 'Signing In...' : `Sign In as ${selectedRole || 'User'}`}
              </button>
            </motion.form>
          ) : (
            /* REGISTRATION FORM */
            <motion.div
              key="register"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Join Our Community! 🚀
              </h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${currentStep >= step
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-400 border-gray-300'
                        }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Role Selection */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <RoleSelection
                      selectedRole={selectedRole}
                      onRoleSelect={handleRoleSelect}
                    />
                  </motion.div>
                )}

                {/* Step 2: Credentials */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <CredentialsForm
                      email={formData.email}
                      password={formData.password}
                      onChange={handleInputChange}
                      showPassword={showPassword}
                      toggleShowPassword={() => setShowPassword(!showPassword)}
                      passwordStrength={passwordStrength}
                    />
                  </motion.div>
                )}

                {/* Step 3: Details + Profile Picture */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="space-y-6"
                  >
                    <FileUpload
                      label="Profile Picture"
                      description="Required for verification"
                      file={files.avatar}
                      onFileChange={handleFileChange('avatar')}
                      onRemove={handleFileRemove('avatar')}
                      required={true}
                    />

                    {selectedRole === 'user' && (
                      <UserDetailsForm
                        fullName={formData.fullName}
                        mobile={formData.mobile}
                        onChange={handleInputChange}
                      />
                    )}

                    {selectedRole === 'recycler' && (
                      <RecyclerDetailsForm
                        fullName={formData.fullName}
                        mobile={formData.mobile}
                        shopName={formData.shopName}
                        onChange={handleInputChange}
                      />
                    )}
                  </motion.div>
                )}

                {/* Step 4: Address + Additional Files */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="space-y-6"
                  >
                    <AddressForm
                      AddressLine1={formData.AddressLine1}
                      AddressLine2={formData.AddressLine2}
                      city={formData.city}
                      state={formData.state}
                      pincode={formData.pincode}
                      onChange={handleInputChange}
                    />

                    {selectedRole === 'recycler' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Upload Required Documents</h4>

                        <FileUpload
                          label="Shop Image"
                          description="Upload your shop/facility image"
                          file={files.shopImage}
                          onFileChange={handleFileChange('shopImage')}
                          onRemove={handleFileRemove('shopImage')}
                          required={true}
                        />

                        <FileUpload
                          label="Identity Document"
                          description="Government issued ID or business license"
                          file={files.identity}
                          onFileChange={handleFileChange('identity')}
                          onRemove={handleFileRemove('identity')}
                          accept="image/*,.pdf"
                          required={true}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 text-gray-600 hover:text-green-600 font-semibold rounded-xl hover:bg-green-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={currentStep === 4 ? handleSubmit : nextStep}
                  disabled={!isStepValid(currentStep) || isLoading}
                  className={`ml-auto flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 ${!isStepValid(currentStep) || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      {currentStep === 4 ? 'Create Account' : 'Next'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}