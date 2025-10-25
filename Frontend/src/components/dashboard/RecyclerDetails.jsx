import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { postAPI } from "../../services/authService";

export default function RecyclerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [recycler, setRecycler] = useState(location.state?.recycler || null); // check if passed from previous page
  const [loading, setLoading] = useState(!recycler); // if we already have data, no need to load

  useEffect(() => {
    if (recycler) return; // already have data, no need to fetch

    const fetchRecycler = async () => {
      try {
        setLoading(true);
        const res = await postAPI.getRecyclerById(id);
        setRecycler(res.data);
      } catch (err) {
        console.error("Error fetching recycler details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecycler();
  }, [id, recycler]);

  if (loading) return <p className="text-center mt-10">Loading details...</p>;
  if (!recycler) return <p className="text-center mt-10">Recycler not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition mb-6"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        {recycler.avatar && (
          <img
            src={recycler.avatar}
            alt={recycler.name || recycler.fullName}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />
        )}
        <h2 className="text-2xl font-bold text-gray-800">{recycler.fullName || recycler.name}</h2>
        <p className="text-gray-600 mt-2">{recycler.description || "No description available."}</p>

        <div className="mt-4 space-y-2">
          <p><strong>Email:</strong> {recycler.email}</p>
          <p><strong>Phone:</strong> {recycler.phone}</p>
          <p><strong>City:</strong> {recycler.city}</p>
          <p><strong>State:</strong> {recycler.state}</p>
          <p><strong>Rating:</strong> ⭐ {recycler.rating || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
