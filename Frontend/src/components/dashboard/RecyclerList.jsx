// // src/components/dashboard/RecyclerList.jsx
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { postAPI } from "../../services/authService";

// export default function RecyclerList() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const currentPost = location.state?.currentPost || null;
//   const initialRecyclers = location.state?.recyclers || [];

//   const [recyclers, setRecyclers] = useState(initialRecyclers);
//   const [loading, setLoading] = useState(false);

//   // ✅ Log recyclers received from SellProduct
//   useEffect(() => {
//     console.log("♻️ Received recyclers from SellProduct:", initialRecyclers);
//     if (initialRecyclers.length === 0) {
//       console.warn("No recyclers passed from SellProduct, fetching manually...");
//       fetchRecyclers();
//     }
//   }, []);

//   // ✅ Fetch recyclers if not passed from SellProduct
//   const fetchRecyclers = async () => {
//     try {
//       setLoading(true);
//       const user = JSON.parse(localStorage.getItem("user"));
//       const city = user?.city;
//       if (!city) {
//         console.error("⚠️ User city missing, cannot fetch recyclers.");
//         return;
//       }
//       console.log("Fetching recyclers for city:", city);
//       const res = await postAPI.getNearbyRecyclers(city);
//       console.log("Recyclers response:", res);
//       setRecyclers(res?.data || []);
//     } catch (err) {
//       console.error("Error fetching recyclers:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ When recycler selected → go to RecyclerDetails page
//   const handleSelectRecycler = async (recycler) => {
//     if (!currentPost || !currentPost._id) {
//       console.error("No valid post found.");
//       return;
//     }

//     try {
//       setLoading(true);
//       // Optionally call backend API to mark recycler as selected
//       const res = await postAPI.selectRecycler(currentPost._id, recycler._id);
//       console.log("✅ Recycler selected successfully:", res);

//       // 👉 Navigate to details page (no alert)
//       navigate(`/dashboard/recycler-details/${recycler._id}`, {
//         state: { recycler, post: currentPost },
//       });
//     } catch (err) {
//       console.error("Error selecting recycler:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = (recycler) => {
//     navigate(`/recycler-details/${recycler._id}`, {
//       state: { recycler, post: currentPost },
//     });
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           ♻️ Recyclers in Your City
//         </h1>
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//         >
//           ← Back
//         </button>
//       </div>

//       {!currentPost ? (
//         <p className="text-center text-gray-500">No post found.</p>
//       ) : loading ? (
//         <p className="text-center text-gray-500">Loading recyclers...</p>
//       ) : recyclers.length === 0 ? (
//         <p className="text-center text-gray-500">No recyclers found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {recyclers.map((rec) => (
//             <div
//               key={rec._id}
//               className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
//             >
//               <h2 className="text-xl font-bold text-gray-800">
//                 {rec.fullName || rec.name || "Unnamed Recycler"}
//               </h2>
//               <p className="text-gray-600 text-sm mt-1">
//                 📍 {rec.city || "Unknown City"}, {rec.state || "Unknown State"}
//               </p>
//               <p className="text-gray-700 mt-2">
//                 <span className="font-semibold">Email:</span> {rec.email || "N/A"}
//               </p>
//               <p className="text-gray-700 mt-1">
//                 <span className="font-semibold">Phone:</span> {rec.phone || "N/A"}
//               </p>

//               <div className="flex gap-2 mt-4">
//                 <button
//                   className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
//                   onClick={() => handleSelectRecycler(rec)}
//                   disabled={loading}
//                 >
//                   {loading ? "Selecting..." : "Select Recycler"}
//                 </button>

//                 <button
//                   className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
//                   onClick={() => handleViewDetails(rec)}
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }












import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { postAPI } from "../../services/authService";

export default function RecyclerList() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPost = location.state?.currentPost || null;
  const initialRecyclers = location.state?.recyclers || [];

  const [recyclers, setRecyclers] = useState(initialRecyclers);
  const [loading, setLoading] = useState(false);

  // Log recyclers received from SellProduct
  useEffect(() => {
    if (initialRecyclers.length === 0) fetchRecyclers();
  }, []);

  // Fetch recyclers if not passed from SellProduct
  const fetchRecyclers = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const city = user?.city;
      if (!city) return;
      const res = await postAPI.getNearbyRecyclers(city);
      setRecyclers(res?.data || []);
    } catch (err) {
      // You can add error UI here
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecycler = async (recycler) => {
    if (!currentPost || !currentPost._id) return;
    try {
      setLoading(true);
      await postAPI.selectRecycler(currentPost._id, recycler._id);
      navigate(`/dashboard/recycler-details/${recycler._id}`, {
        state: { recycler, post: currentPost },
      });
    } catch (err) {
      // error UI optionally
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (recycler) => {
    navigate(`/recycler-details/${recycler._id}`, {
      state: { recycler, post: currentPost },
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-green-200 flex items-center justify-center px-3 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-5xl w-full bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-white/60 px-8 py-8"
        initial={{ scale: 0.96, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 130, damping: 16 }}
        style={{ overflow: "visible" }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-700 tracking-wide bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            ♻️ Recyclers in Your City
          </h1>
          <motion.button
            whileHover={{ scale: 1.06 }}
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold border border-gray-300 shadow"
          >
            ← Back
          </motion.button>
        </div>
        {!currentPost ? (
          <motion.div 
            className="text-center text-gray-500 my-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No post found.
          </motion.div>
        ) : loading ? (
          <motion.div
            className="flex flex-col items-center justify-center my-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-b-4 border-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-lg">Loading recyclers...</p>
          </motion.div>
        ) : recyclers.length === 0 ? (
          <motion.div 
            className="text-center text-gray-500 my-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No recyclers found.
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            <AnimatePresence>
              {recyclers.map((rec, idx) => (
                <motion.div
                  key={rec._id}
                  initial={{ opacity: 0, y: 28, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  layout
                  className="bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl shadow-md shadow-emerald-50 p-6 flex flex-col
                      transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <h2 className="text-xl font-bold text-green-700 mb-1">
                    {rec.shopName || rec.fullName || rec.name || "Unnamed Recycler"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-0.5 mb-3">
                    📍 {rec.city || "Unknown City"}, {rec.state || "Unknown State"}
                  </p>
                  <p className="text-gray-700 mb-0.5">
                    <span className="font-semibold">Email:</span> {rec.email || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-0.5">
                    <span className="font-semibold">Phone:</span> {rec.phone || rec.mobile || "N/A"}
                  </p>
                  {rec.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-700 font-medium">{rec.rating}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-5">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold 
                        hover:bg-green-600 shadow-sm transition"
                      onClick={() => handleSelectRecycler(rec)}
                      disabled={loading}
                    >
                      {loading ? "Selecting..." : "Select"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 shadow-sm transition"
                      onClick={() => handleViewDetails(rec)}
                    >
                      View
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}