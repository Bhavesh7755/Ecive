import React, { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Leaf, Recycle, Truck, Shield, BarChart, Store, Sparkles, Zap, Mail, Phone, MapPin, Send } from "lucide-react";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  
  // Enhanced parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  

  // Reduce loading time
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.src = "https://user-gen-media-assets.s3.amazonaws.com/gemini_images/3999aad3-e243-4565-b0d6-a077aeeb46e1.png";
  }, []);

  // Memoize static data
  const steps = useMemo(() => [
    { icon: Recycle, title: "List E-Waste", desc: "Upload details of your old devices easily." },
    { icon: Shield, title: "Get Offers", desc: "Verified recyclers bid securely for your items." },
    { icon: Truck, title: "Agent Pickup", desc: "An agent collects your e-waste and you get paid." },
  ], []);

  const features = useMemo(() => [
    { icon: Shield, title: "Verified Recyclers", desc: "Work only with trusted recyclers." },
    { icon: Truck, title: "Easy Agent Pickup", desc: "No hassle pickups from your doorstep." },
    { icon: Recycle, title: "Secure Transactions", desc: "Direct payments with transparency." },
    { icon: BarChart, title: "Analytics Dashboard", desc: "Track recycled waste and earnings." },
    { icon: Leaf, title: "Eco-Friendly", desc: "Contribute to reducing landfill waste." },
    { icon: Store, title: "Future Marketplace", desc: "Buy refurbished devices soon." },
  ], []);

  const stats = useMemo(() => [
    { num: 1000, label: "KG E-waste Collected", suffix: "+" },
    { num: 50, label: "Verified Recyclers", suffix: "+" },
    { num: 200, label: "Active Users", suffix: "+" },
  ], []);

  // Enhanced Counter Component
  const AnimatedCounter = React.memo(({ target, suffix = "" }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (shouldReduceMotion) {
        setCount(target);
        return;
      }
      
      const increment = Math.ceil(target / 30);
      const timer = setInterval(() => {
        setCount(prev => (prev < target ? prev + increment : target));
      }, 80);
      
      return () => clearInterval(timer);
    }, [target, shouldReduceMotion]);
    
    return <span>{count}{suffix}</span>;
  });

  // Enhanced Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-blue-600 flex items-center justify-center z-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 relative"
            animate={!shouldReduceMotion ? { 
              rotate: 360,
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full blur-sm"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Recycle className="w-full h-full text-white relative z-10" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-bold text-white mb-2"
            animate={!shouldReduceMotion ? { 
              textShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 20px rgba(255,255,255,0.8)", 
                "0 0 0px rgba(255,255,255,0)"
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ecive
          </motion.h2>
          <motion.p
            className="text-white/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading your green future...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 relative overflow-x-hidden">
      {/* Enhanced Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={!shouldReduceMotion ? {
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [0.5, 1.2, 0.5],
              opacity: [0.1, 0.3, 0.1],
            } : {}}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            <div className={`w-2 h-2 rounded-full ${
              i % 3 === 0 ? 'bg-green-300' : i % 3 === 1 ? 'bg-blue-300' : 'bg-emerald-300'
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Mouse Follower Effect */}
      <motion.div
        className="fixed w-8 h-8 bg-green-400 rounded-full pointer-events-none z-10 mix-blend-multiply opacity-30"
        animate={{
          x: mousePosition.x + (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) - 16,
          y: mousePosition.y + (typeof window !== 'undefined' ? window.innerHeight / 2 : 0) - 16,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* Enhanced Header */}
      <motion.header 
        className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-50 border-b border-green-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            whileHover={!shouldReduceMotion ? { 
              scale: 1.05,
              filter: "drop-shadow(0 0 10px rgba(34,197,94,0.5))"
            } : {}}
          >
            Ecive
          </motion.h1>
          
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            {["Home", "How It Works", "Features", "About Us", "Contact"].map((link, i) => (
              <motion.a
                key={i}
                href={`#${link.toLowerCase().replace(/\s/g, "")}`}
                whileHover={!shouldReduceMotion ? { 
                  scale: 1.1, 
                  color: "#16a34a",
                  y: -2 
                } : {}}
                className="cursor-pointer transition-all duration-300 relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {link}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>
          
          <motion.div 
            whileHover={!shouldReduceMotion ? { 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(34,197,94,0.3)"
            } : {}}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl px-8 py-2 font-semibold transition-all duration-300">
              Login/Register
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* ULTRA ENHANCED Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 min-h-screen flex items-center pt-24 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0"
          animate={!shouldReduceMotion ? {
            background: [
              "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.15), transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(59,130,246,0.15), transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 60%)",
              "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.15), transparent 60%)",
            ]
          } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Enhanced Floating Elements */}
        {[Sparkles, Zap, Leaf, Shield].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute opacity-30"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={!shouldReduceMotion ? {
              y: [0, -25, 0],
              rotate: [0, 360],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            } : {}}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            <Icon className="w-8 h-8 text-green-600" />
          </motion.div>
        ))}

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Enhanced Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 80 }}
            style={{ y: yText, opacity }}
          >
            {/* Ultra Enhanced Animated Title */}
            <motion.h2 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
              {["Recycle", "E-Waste.", "Protect", "the", "Future."].map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-4 bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 100, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    delay: 0.3 + i * 0.2,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 120
                  }}
                  whileHover={!shouldReduceMotion ? {
                    scale: 1.1,
                    y: -8,
                    textShadow: "0px 0px 20px rgba(5,150,105,0.8)",
                    filter: "drop-shadow(0 10px 20px rgba(34,197,94,0.3))",
                  } : {}}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h2>
            
            {/* Enhanced Description */}
            <motion.p 
              className="text-xl text-gray-700 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Connect with trusted recyclers and agents to dispose of your e-waste safely and responsibly while earning rewards.
            </motion.p>
            
            {/* Ultra Enhanced Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <motion.button
                whileHover={!shouldReduceMotion ? { 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(34,197,94,0.4)",
                  y: -5,
                } : {}}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-3xl px-10 py-4 font-bold text-lg transition-all duration-300 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center">
                  <Recycle className="w-5 h-5 mr-2" />
                  List E-Waste
                </span>
              </motion.button>
              
              <motion.button
                whileHover={!shouldReduceMotion ? { 
                  scale: 1.05,
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  y: -5,
                  boxShadow: "0 15px 30px rgba(22,163,74,0.3)"
                } : {}}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-green-600 text-green-600 rounded-3xl px-10 py-4 font-bold text-lg transition-all duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* ULTRA ENHANCED Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateY: -30 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.5, delay: 0.5, type: "spring", stiffness: 60 }}
            className="relative"
            style={{ y: yBg }}
          >
            {/* Multiple Layered Glow Effects */}
            <motion.div
              className="absolute -inset-8 bg-gradient-to-r from-green-400 via-emerald-500 via-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-3xl"
              animate={!shouldReduceMotion ? {
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Image Container with Ultra 3D Effects */}
            <motion.div
              className="relative group cursor-pointer"
              whileHover={!shouldReduceMotion ? {
                rotateY: 12,
                rotateX: 5,
                scale: 1.05,
                z: 100,
              } : {}}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              style={{ 
                transformStyle: "preserve-3d",
                perspective: 1200 
              }}
            >
              {/* Enhanced Image */}
              <motion.img
                src={imageError ? 
                  "https://illustrations.popsy.co/green/recycling.svg" : 
                  "https://user-gen-media-assets.s3.amazonaws.com/gemini_images/3999aad3-e243-4565-b0d6-a077aeeb46e1.png"
                }
                alt="E-waste Recycling - Ecive Platform"
                className="w-full relative z-10 rounded-3xl shadow-2xl border-4 border-white/50"
                loading="lazy"
                onError={() => setImageError(true)}
                whileHover={!shouldReduceMotion ? {
                  filter: "brightness(1.15) saturate(1.2) contrast(1.1)",
                } : {}}
                transition={{ duration: 0.4 }}
              />
              
              {/* Enhanced Border Effects */}
              <motion.div
                className="absolute inset-0 border-4 border-transparent rounded-3xl"
                whileHover={!shouldReduceMotion ? {
                  borderColor: "#10b981",
                  boxShadow: "0 0 50px rgba(16, 185, 129, 0.6), inset 0 0 50px rgba(16, 185, 129, 0.1)",
                } : {}}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
            
            {/* Enhanced Interactive Tooltip */}
            <motion.div
              className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-3xl text-sm font-semibold opacity-0 group-hover:opacity-100 pointer-events-none shadow-2xl border border-white/10"
              initial={{ y: 30, scale: 0.8 }}
              whileHover={{ y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-green-400" />
                </motion.div>
                <span>Sustainable Future Starts Here</span>
              </div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-gray-800 to-gray-900 rotate-45 border-l border-t border-white/10"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="howitworks" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h3 
            className="text-3xl font-bold text-gray-800 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-10 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                whileHover={!shouldReduceMotion ? { 
                  scale: 1.03,
                  boxShadow: "0px 10px 25px rgba(34,197,94,0.15)"
                } : {}}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="rounded-3xl shadow-lg bg-white relative overflow-hidden group p-6"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    whileHover={!shouldReduceMotion ? {
                      rotate: 15,
                      scale: 1.1,
                    } : {}}
                    transition={{ duration: 0.3 }}
                    className="relative mb-4"
                  >
                    <step.icon className="w-12 h-12 text-green-600 relative z-10" />
                  </motion.div>
                  
                  <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                  
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
                  >
                    {i + 1}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h3 
            className="text-3xl font-bold text-gray-800 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Features
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={!shouldReduceMotion ? { 
                  scale: 1.02,
                  boxShadow: "0px 8px 20px rgba(0,0,0,0.1)"
                } : {}}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl shadow-md bg-white relative overflow-hidden group"
              >
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"
                  initial={{ scaleX: 0 }}
                  whileHover={!shouldReduceMotion ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.3 }}
                />
                
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <motion.div
                    className="relative mb-4"
                    whileHover={!shouldReduceMotion ? { y: -3 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <feature.icon className="w-12 h-12 text-green-600 relative z-10" />
                  </motion.div>
                  
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={!shouldReduceMotion ? {
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(34,197,94,0.15)",
                y: -3,
              } : {}}
              className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl shadow-lg relative overflow-hidden group cursor-pointer"
            >
              <motion.h4
                className="text-4xl font-bold text-green-700 relative z-10"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 150 }}
              >
                <AnimatedCounter target={stat.num} suffix={stat.suffix} />
              </motion.h4>
              
              <p className="text-gray-600 mt-2 relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="aboutus" className="py-20 bg-gray-50 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h3 
            className="text-3xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            About Us
          </motion.h3>
          
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ecive is a platform dedicated to responsible e-waste disposal, bridging users, agents, and recyclers to make recycling simple and rewarding.
          </motion.p>
        </div>
      </section>

      

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-center text-white relative overflow-hidden">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6 relative z-10"
        >
          Join the movement towards a cleaner planet.
        </motion.h3>
        
        <motion.div 
          whileHover={!shouldReduceMotion ? { 
            scale: 1.05, 
            boxShadow: "0 0 25px rgba(255,255,255,0.4)",
            y: -2,
          } : {}}
          whileTap={{ scale: 0.98 }}
          className="inline-block relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button className="bg-white !text-green-700 hover:bg-green-700 hover:!text-white rounded-full px-10 py-4 text-2xl font-bold shadow-lg transition relative overflow-hidden">
            <span className="relative z-10">List Your E-Waste Now</span>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-xl font-bold text-white mb-4">Ecive</h4>
            <p className="text-gray-400">Recycle smart. Live green.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h5 className="font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2">
              {["Home", "Features", "About", "FAQ", "Privacy"].map((link, i) => (
                <motion.li 
                  key={i}
                  whileHover={!shouldReduceMotion ? { x: 3, color: "#ffffff" } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="hover:text-white transition">{link}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h5 className="font-semibold text-white mb-3">Contact</h5>
            <p>Email: support@ecive.com</p>
            <div className="flex space-x-4 mt-3">
              {["LinkedIn", "Twitter", "Instagram"].map((social, i) => (
                <motion.a 
                  key={i} 
                  href="#" 
                  className="hover:text-white transition"
                  whileHover={!shouldReduceMotion ? { 
                    scale: 1.1, 
                    y: -1,
                    color: "#ffffff",
                  } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {social}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
