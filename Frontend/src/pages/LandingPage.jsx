import React from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Leaf, Recycle, Truck, Shield, BarChart, Store } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-600">Ecive</h1>
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <a href="#" className="hover:text-green-600 cursor-pointer transition-colors duration-200">Home</a>
            <a href="#how" className="hover:text-green-600 cursor-pointer transition-colors duration-200">How It Works</a>
            <a href="#features" className="hover:text-green-600 cursor-pointer transition-colors duration-200">Features</a>
            <a href="#about" className="hover:text-green-600 cursor-pointer transition-colors duration-200">About Us</a>
            <a href="#contact" className="hover:text-green-600 cursor-pointer transition-colors duration-200">Contact</a>
          </nav>
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 cursor-pointer transition-colors duration-200">
            Login/Register
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 min-h-screen flex items-center pt-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-green-700">
              Recycle E-Waste. Protect the Future.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect with trusted recyclers and agents to dispose of your e-waste safely and responsibly.
            </p>
            <div className="mt-6 flex space-x-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 cursor-pointer transition-colors duration-200">
                List E-Waste
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 cursor-pointer transition-colors duration-200">
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <img src="https://illustrations.popsy.co/green/recycling.svg" alt="Hero Illustration" className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Recycle, title: "List E-Waste", desc: "Upload details of your old devices easily." },
              { icon: Shield, title: "Get Offers", desc: "Verified recyclers bid securely for your items." },
              { icon: Truck, title: "Agent Pickup", desc: "An agent collects your e-waste and you get paid." },
            ].map((step, i) => (
              <Card key={i} className="rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <step.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Recyclers", desc: "Work only with trusted recyclers." },
              { icon: Truck, title: "Easy Agent Pickup", desc: "No hassle pickups from your doorstep." },
              { icon: Recycle, title: "Secure Transactions", desc: "Direct payments with transparency." },
              { icon: BarChart, title: "Analytics Dashboard", desc: "Track recycled waste and earnings." },
              { icon: Leaf, title: "Eco-Friendly", desc: "Contribute to reducing landfill waste." },
              { icon: Store, title: "Future Marketplace", desc: "Buy refurbished devices soon." },
            ].map((feature, i) => (
              <Card key={i} className="rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            { num: "1000+ KG", label: "E-waste Collected" },
            { num: "50+", label: "Verified Recyclers" },
            { num: "200+", label: "Active Users" },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-green-50 rounded-2xl shadow-sm cursor-pointer transition">
              <h4 className="text-3xl font-bold text-green-700">{stat.num}</h4>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">About Us</h3>
          <p className="text-lg text-gray-600">
            Ecive is a platform dedicated to responsible e-waste disposal, bridging users, agents, and recyclers to make recycling simple and rewarding.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-green-600 py-16 text-center text-white">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">
          Join the movement towards a cleaner planet.
        </h3>
        <Button className="bg-white !text-green-700 hover:bg-green-700 hover:!text-white rounded-2xl px-8 text-lg font-semibold cursor-pointer transition-colors duration-200 border border-green-700">
          List Your E-Waste Now
        </Button>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Ecive</h4>
            <p className="text-gray-400">Recycle smart. Live green.</p>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">Home</a></li>
              <li><a href="#features" className="hover:text-white cursor-pointer transition-colors duration-200">Features</a></li>
              <li><a href="#about" className="hover:text-white cursor-pointer transition-colors duration-200">About</a></li>
              <li><a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">FAQ</a></li>
              <li><a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-3">Contact</h5>
            <p>Email: support@ecive.com</p>
            <div className="flex space-x-4 mt-3">
              <a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">LinkedIn</a>
              <a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">Twitter</a>
              <a href="#" className="hover:text-white cursor-pointer transition-colors duration-200">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}