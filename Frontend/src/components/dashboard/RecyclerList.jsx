// src/components/dashboard/RecyclerList.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postAPI } from "../../services/authService";

export default function RecyclerList() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPost = location.state?.currentPost || null;
  const initialRecyclers = location.state?.recyclers || [];

  const [recyclers, setRecyclers] = useState(initialRecyclers);
  const [loading, setLoading] = useState(false);

  // ✅ Log recyclers received from SellProduct
  useEffect(() => {
    console.log("♻️ Received recyclers from SellProduct:", initialRecyclers);
    if (initialRecyclers.length === 0) {
      console.warn("No recyclers passed from SellProduct, fetching manually...");
      fetchRecyclers();
    }
  }, []);

  // ✅ Fetch recyclers if not passed from SellProduct
  const fetchRecyclers = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const city = user?.city;
      if (!city) {
        console.error("⚠️ User city missing, cannot fetch recyclers.");
        return;
      }
      console.log("Fetching recyclers for city:", city);
      const res = await postAPI.getNearbyRecyclers(city);
      console.log("Recyclers response:", res);
      setRecyclers(res?.data || []);
    } catch (err) {
      console.error("Error fetching recyclers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ When recycler selected → go to RecyclerDetails page
  const handleSelectRecycler = async (recycler) => {
    if (!currentPost || !currentPost._id) {
      console.error("No valid post found.");
      return;
    }

    try {
      setLoading(true);
      // Optionally call backend API to mark recycler as selected
      const res = await postAPI.selectRecycler(currentPost._id, recycler._id);
      console.log("✅ Recycler selected successfully:", res);

      // 👉 Navigate to details page (no alert)
      navigate(`/dashboard/recycler-details/${recycler._id}`, {
        state: { recycler, post: currentPost },
      });
    } catch (err) {
      console.error("Error selecting recycler:", err);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          ♻️ Recyclers in Your City
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>

      {!currentPost ? (
        <p className="text-center text-gray-500">No post found.</p>
      ) : loading ? (
        <p className="text-center text-gray-500">Loading recyclers...</p>
      ) : recyclers.length === 0 ? (
        <p className="text-center text-gray-500">No recyclers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recyclers.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800">
                {rec.fullName || rec.name || "Unnamed Recycler"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                📍 {rec.city || "Unknown City"}, {rec.state || "Unknown State"}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Email:</span> {rec.email || "N/A"}
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-semibold">Phone:</span> {rec.phone || "N/A"}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  onClick={() => handleSelectRecycler(rec)}
                  disabled={loading}
                >
                  {loading ? "Selecting..." : "Select Recycler"}
                </button>

                <button
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => handleViewDetails(rec)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}