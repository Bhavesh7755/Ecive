// // src/components/dashboard/RecyclerList.jsx
// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const RecyclerList = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const recyclers = location.state?.recyclers || [];

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-md">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-800">
//         ♻️ Recyclers in Your City
//       </h2>

//       {recyclers.length === 0 ? (
//         <p className="text-gray-600">No recyclers found in your city.</p>
//       ) : (
//         <ul className="space-y-3">
//           {recyclers.map((r, idx) => (
//             <li
//               key={idx}
//               className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
//             >
//               <p><strong>{r.fullName}</strong></p>
//               <p>Shop: {r.shopName || 'N/A'}</p>
//               <p>City: {r.city || 'N/A'}</p>
//               <p>Address: {r.AddressLine1 || ''}, {r.AddressLine2 || ''}</p>
//             </li>
//           ))}
//         </ul>
//       )}

//       <div className="mt-6">
//         <button
//           onClick={() => navigate('/dashboard')}
//           className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition"
//         >
//           Back to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RecyclerList;






import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RecyclerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const recyclers = location.state?.recyclers || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          ♻️ Recyclers in Your City
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {recyclers.length === 0 ? (
        <div className="text-center mt-12 text-gray-500">
          <p>No recyclers found in your city yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recyclers.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition duration-200 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800">{rec.name}</h2>
              <p className="text-gray-600 text-sm mt-1">
                📍 {rec.city}, {rec.state}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Email:</span> {rec.email || "N/A"}
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-semibold">Phone:</span> {rec.phone || "N/A"}
              </p>

              <button
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                onClick={() => console.log("Selected recycler:", rec)}
              >
                Select Recycler
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
