import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
// import Dashboard from "@/pages/Dashboard";
// import RecyclerDashboard from "@/pages/RecyclerDashboard";
// import AgentDashboard from "@/pages/AgentDashboard";
// import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recycler-dashboard" element={<RecyclerDashboard />} /> */}
          {/* <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;