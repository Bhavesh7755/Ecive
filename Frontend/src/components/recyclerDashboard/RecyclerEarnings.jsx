// import React, { useEffect, useState } from "react";
// import { recyclerAPI } from "../../services/authService";

// export default function RecyclerEarnings() {
//   const [earnings, setEarnings] = useState(null);

//   useEffect(() => {
//     async function fetchEarnings() {
//       try {
//         const res = await recyclerAPI.getEarnings();
//         setEarnings(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchEarnings();
//   }, []);

//   if (!earnings)
//     return <p className="text-gray-500">Loading earnings...</p>;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4 text-emerald-700">Earnings Summary</h2>
//       <div className="grid md:grid-cols-3 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow text-center">
//           <h3 className="font-semibold text-gray-700">Total Earnings</h3>
//           <p className="text-3xl font-bold text-emerald-600 mt-2">₹{earnings.total}</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow text-center">
//           <h3 className="font-semibold text-gray-700">Completed Deals</h3>
//           <p className="text-3xl font-bold text-emerald-600 mt-2">{earnings.deals}</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow text-center">
//           <h3 className="font-semibold text-gray-700">Commission Paid</h3>
//           <p className="text-3xl font-bold text-emerald-600 mt-2">₹{earnings.commission}</p>
//         </div>
//       </div>
//     </div>
//   );
// }














// src/components/recyclerDashboard/RecyclerEarnings.jsx
import React, { useEffect, useState } from "react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await recyclerAPI.getEarnings();
      setEarnings(res.data || { total: 0, deals: 0, commission: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-10">
        Error: {error}
        <button
          onClick={fetchEarnings}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700">Earnings Summary</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-700">Total Earnings</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{earnings.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-700">Completed Deals</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{earnings.deals}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-semibold text-gray-700">Commission Paid</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{earnings.commission}</p>
        </div>
      </div>
    </div>
  );
}