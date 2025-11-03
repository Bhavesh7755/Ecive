// // import React, { useEffect, useState } from "react";
// // import { motion } from "framer-motion";
// // import { Package, Star, Users, Activity } from "lucide-react";
// // import { recyclerAPI, postAPI } from "../../services/authService";

// // export default function RecyclerDashboardHome({ recycler }) {
// //   const [stats, setStats] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     async function fetchStats() {
// //       try {
// //         // Get recycler requests/orders
// //         const requests = await recyclerAPI.getMyRequests();

// //         // Count total orders
// //         const totalOrders = requests.length;

// //         // Count unique customers
// //         const customerSet = new Set(requests.map(req => req.userId));
// //         const customersServed = customerSet.size;

// //         // Get rating from recycler object or default
// //         const rating = recycler.rating ?? 4.7;

// //         setStats([
// //           { name: "Total Orders", value: totalOrders, icon: Package, color: "bg-green-500" },
// //           { name: "Rating", value: rating, icon: Star, color: "bg-yellow-400" },
// //           { name: "Customers Served", value: customersServed, icon: Users, color: "bg-blue-400" },
// //           { name: "Active", value: "Yes", icon: Activity, color: "bg-emerald-500" }
// //         ]);
// //       } catch (err) {
// //         console.error("Failed to fetch stats:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchStats();
// //   }, [recycler]);

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //         <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <motion.div
// //       className="space-y-8"
// //       initial={{ opacity: 0, y: 24 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ type: "spring", stiffness: 110, damping: 18 }}
// //     >
// //       <motion.div
// //         className="rounded-2xl p-8 shadow bg-gradient-to-r from-emerald-500 to-green-400 text-white mb-7"
// //         initial={{ opacity: 0, scale: 0.98 }}
// //         animate={{ opacity: 1, scale: 1 }}
// //         transition={{ delay: 0.08 }}
// //       >
// //         <h2 className="text-3xl font-bold mb-2">Welcome, {recycler?.shopName || recycler?.fullName || "Recycler"}! 🎉</h2>
// //         <p className="text-lg">Manage your orders and connect with your customers efficiently.</p>
// //       </motion.div>

// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //         {stats.map((stat, idx) => (
// //           <motion.div
// //             className="bg-white rounded-xl p-6 shadow-md border flex items-center space-x-4"
// //             key={stat.name}
// //             whileHover={{ scale: 1.04 }}
// //             transition={{ type: "spring", stiffness: 140 }}
// //             initial={{ opacity: 0, y: 22 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             style={{ transitionDelay: `${idx * 50}ms` }}
// //           >
// //             <span className={`inline-flex p-3 rounded-lg ${stat.color}`}>
// //               <stat.icon className="text-white" size={28} />
// //             </span>
// //             <div>
// //               <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
// //               <div className="text-gray-600">{stat.name}</div>
// //             </div>
// //           </motion.div>
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// // }





// // src/components/recyclerDashboard/RecyclerDashboardHome.jsx

// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Package, Star, Users, Activity } from "lucide-react";
// import { recyclerAPI } from "../../services/authService";

// export default function RecyclerDashboardHome({ recycler }) {
//   const [stats, setStats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         // Fetch recycler requests/orders
//         const requests = await recyclerAPI.getMyRequests();

//         // Total orders
//         const totalOrders = requests?.length || 0;

//         // Unique customers
//         const customerSet = new Set(requests?.map(req => req.userId) || []);
//         const customersServed = customerSet.size;

//         // Rating fallback
//         const rating = recycler?.rating ?? 4.7;

//         setStats([
//           { name: "Total Orders", value: totalOrders, icon: Package, color: "bg-green-500" },
//           { name: "Rating", value: rating, icon: Star, color: "bg-yellow-400" },
//           { name: "Customers Served", value: customersServed, icon: Users, color: "bg-blue-400" },
//           { name: "Active", value: "Yes", icon: Activity, color: "bg-emerald-500" },
//         ]);
//       } catch (err) {
//         console.error("Failed to fetch stats:", err);
//         setStats([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, [recycler]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       className="space-y-8"
//       initial={{ opacity: 0, y: 24 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ type: "spring", stiffness: 110, damping: 18 }}
//     >
//       <motion.div
//         className="rounded-2xl p-8 shadow bg-gradient-to-r from-emerald-500 to-green-400 text-white mb-7"
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.08 }}
//       >
//         <h2 className="text-3xl font-bold mb-2">
//           Welcome, {recycler?.shopName || recycler?.fullName || "Recycler"}! 🎉
//         </h2>
//         <p className="text-lg">
//           Manage your orders and connect with your customers efficiently.
//         </p>
//       </motion.div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, idx) => (
//           <motion.div
//             key={stat.name}
//             className="bg-white rounded-xl p-6 shadow-md border flex items-center space-x-4"
//             whileHover={{ scale: 1.04 }}
//             transition={{ type: "spring", stiffness: 140 }}
//             initial={{ opacity: 0, y: 22 }}
//             animate={{ opacity: 1, y: 0 }}
//             style={{ transitionDelay: `${idx * 80}ms` }}
//           >
//             <span className={`inline-flex p-3 rounded-lg ${stat.color}`}>
//               <stat.icon className="text-white" size={28} />
//             </span>
//             <div>
//               <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
//               <div className="text-gray-600">{stat.name}</div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// }






import React, { useEffect, useState } from "react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerDashboardHome({ recycler }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recycler?._id) return;

    async function fetchDashboardStats() {
      try {
        const res = await recyclerAPI.getRecyclerDashboardStats();
        
        const data = res?.data?.stats || res?.stats || {
          totalOrders: 0,
          acceptedRequests: 0,
          pendingRequests: 0,
          totalEarnings: 0,
        };

        setStats(data);
      } catch (err) {
        console.log("Dashboard Stats Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [recycler]);

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {recycler?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your orders, requests and earnings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders" value={stats.totalOrders} color="blue" />
        <StatCard title="Accepted Requests" value={stats.acceptedRequests} color="green" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} color="orange" />
        <StatCard
          title="Total Earnings (₹)"
          value={stats.totalEarnings}
          color="purple"
        />
      </div>

      {/* About Recycler Shop */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Shop & Profile Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
          <Info label="Shop Name" value={recycler?.shopName} />
          <Info label="City" value={recycler?.city} />
          <Info label="State" value={recycler?.state} />
          <Info label="Verified" value={recycler?.verified ? "✅ Yes" : "❌ No"} />
          <Info label="Rating" value={`${recycler?.rating}/5`} />
        </div>
      </div>
    </div>
  );
}

// Components used below
function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-5 text-center hover:scale-105 transition">
      <p className="text-gray-600 font-medium">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-gray-900">{value}</h2>
      <div className={`h-1 mt-4 rounded-full ${colors[color]}`}></div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}: </span>
      <span className="ml-1">{value || "N/A"}</span>
    </p>
  );
}