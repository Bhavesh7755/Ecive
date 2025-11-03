// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Home, Package, User, Settings, LogOut, Store, Wallet, Bell } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { recyclerAPI } from "../../services/authService";

// const menuItems = [
//   { id: "dashboard", label: "Dashboard", icon: Home },
//   { id: "requests", label: "New Requests", icon: Package },
//   { id: "accepted", label: "Accepted Deals", icon: Store },
//   { id: "earnings", label: "Earnings", icon: Wallet },
//   { id: "notifications", label: "Notifications", icon: Bell },
//   { id: "profile", label: "Profile", icon: User },
//   { id: "settings", label: "Settings", icon: Settings },
// ];


// export default function RecyclerDashboardLayout({ children, activeTab, onTabChange, recycler }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await recyclerAPI.logout();
//       localStorage.clear();
//       navigate('/auth');
//     } catch (error) {
//       // Optionally show error
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-200">
//       <div className="flex">
//         {/* Sidebar */}
//         <motion.aside
//           className={`transition-all duration-200 fixed lg:static inset-y-0 left-0 w-60 bg-white shadow-lg z-30 ${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
//           }`}
//         >
//           <div className="p-6">
//             <h1 className="text-2xl font-extrabold text-emerald-600 mb-8 flex items-center">
//               <Store size={28} className="mr-3" />
//               Recycler Panel
//             </h1>
//             <div className="bg-emerald-50 rounded-xl p-4 mb-6 flex items-center space-x-3">
//               <img
//                 src={recycler?.avatar || "/default-avatar.png"}
//                 alt={recycler?.fullName}
//                 className="w-12 h-12 object-cover rounded-full border"
//               />
//               <div className="truncate hower:whitespace-normal hover:overflow-visible hover:text-clip">
//                 <h2 className="font-bold text-emerald-800 truncate">{recycler?.fullName || recycler?.shopName}</h2>
//                 <div className="text-sm text-emerald-600 truncate">{recycler?.email}</div>
//               </div>
//             </div>
//             <nav className="space-y-2">
//               {menuItems.map((item) => (
//                 <motion.button
//                   key={item.id}
//                   onClick={() => {
//                     onTabChange(item.id);
//                     setSidebarOpen(false);
//                   }}
//                   whileHover={{ scale: 1.03 }}
//                   className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition 
//                     ${activeTab === item.id
//                       ? "bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500"
//                       : "text-gray-700 hover:bg-emerald-50"
//                     }`}
//                 >
//                   <item.icon size={20} />
//                   <span className="font-medium">{item.label}</span>
//                 </motion.button>
//               ))}
//             </nav>
//             <div className="mt-8 pt-8 border-t">
//               <motion.button
//                 onClick={handleLogout}
//                 whileHover={{ scale: 1.03 }}
//                 className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
//               >
//                 <LogOut size={20} />
//                 <span className="font-medium">Logout</span>
//               </motion.button>
//             </div>
//           </div>
//         </motion.aside>
//         {/* Main Content */}
//         <main className="flex-1 lg:ml-60 min-h-screen">
//           <div className="p-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }








// src/components/recyclerDashboard/RecyclerDashboardLayout.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Package, User, Settings, LogOut, Store, Wallet, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recyclerAPI } from "../../services/authService";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "requests", label: "New Requests", icon: Package },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function RecyclerDashboardLayout({ children, activeTab, onTabChange, recycler }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await recyclerAPI.logout();
      localStorage.clear();
      navigate("/auth");
    } catch (err) {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-200">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          className={`fixed lg:static inset-y-0 left-0 w-60 bg-white shadow-lg z-30 transform transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6">
            <h1 className="text-2xl font-extrabold text-emerald-600 mb-8 flex items-center">
              <Store size={28} className="mr-3" /> Recycler Panel
            </h1>

            {/* Profile Info */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 flex items-center space-x-3">
              <img
                src={recycler?.avatar || "/default-avatar.png"}
                alt={recycler?.fullName}
                className="w-12 h-12 object-cover rounded-full border"
              />
              <div className="truncate hover:whitespace-normal hover:overflow-visible">
                <h2 className="font-bold text-emerald-800 truncate">
                  {recycler?.fullName || recycler?.shopName}
                </h2>
                <div className="text-sm text-emerald-600 truncate">{recycler?.email}</div>
              </div>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  whileHover={{ scale: 1.03 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition 
                    ${activeTab === item.id
                      ? "bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500"
                      : "text-gray-700 hover:bg-emerald-50"
                    }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-8 pt-8 border-t">
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.03 }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-60 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
