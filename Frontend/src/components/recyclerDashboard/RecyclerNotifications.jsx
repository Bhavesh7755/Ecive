// import React, { useEffect, useState } from "react";
// import { Bell } from "lucide-react";
// import { recyclerAPI } from "../../services/authService";

// export default function RecyclerNotifications() {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     async function fetchNotifications() {
//       try {
//         const res = await recyclerAPI.getNotifications();
//         setNotifications(res.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchNotifications();
//   }, []);

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center">
//         <Bell className="mr-2" /> Notifications
//       </h2>
//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications right now.</p>
//       ) : (
//         <ul className="space-y-3">
//           {notifications.map((n) => (
//             <li key={n._id} className="bg-white shadow p-4 rounded-xl border-l-4 border-emerald-500">
//               <p className="font-medium text-gray-800">{n.message}</p>
//               <p className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }











// src/components/recyclerDashboard/RecyclerNotifications.jsx
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await recyclerAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
          onClick={fetchNotifications}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center">
        <Bell className="mr-2" /> Notifications
      </h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No notifications available.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n._id}
              className="bg-white shadow p-4 rounded-xl border-l-4 border-emerald-500"
            >
              <p className="font-medium text-gray-800">{n.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}