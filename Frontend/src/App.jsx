import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recycler-dashboard" element={<Dashboard />} /> */}
        </Routes>
      </AnimatePresence>
    </Router>
  );
} 

export default App;