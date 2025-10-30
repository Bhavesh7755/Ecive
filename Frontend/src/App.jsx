import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import RecyclerDashboardPage from "./pages/RecyclerDashboardPage";


function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
          <Route path="/recycler-dashboard" element={<RecyclerDashboardPage />}/>
        </Routes>
      </AnimatePresence>
    </Router>
  );
} 

export default App;