import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { postAPI } from "../../services/authService";
import toast from "react-hot-toast";

export default function RecyclerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const recyclerFromState = location.state?.recycler || null;
  const currentPost = location.state?.post || null;

  const [recycler, setRecycler] = useState(recyclerFromState);
  const [loading, setLoading] = useState(!recycler);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch recycler details if not passed from previous page
  useEffect(() => {
    if (recycler) return;

    const fetchRecycler = async () => {
      try {
        setLoading(true);
        const res = await postAPI.getRecyclerById(id);
        setRecycler(res.data);
      } catch (err) {
        console.error("Error fetching recycler details:", err);
        toast.error("Failed to load recycler details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecycler();
  }, [id, recycler]);

  // Send request to recycler
  const handleSendRequest = async () => {
    if (!currentPost) {
      toast.error("Post data missing!");
      return;
    }

    try {
      setSendingRequest(true);
      const products = currentPost.products || [];

      const res = await postAPI.sendRequestToRecycler(
        currentPost._id,
        recycler._id,
        products
      );

      console.log("Request sent successfully:", res);
      setShowConfirmModal(false);
      toast.success("Request sent to recycler successfully! ✅");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Failed to send request:", err);
      toast.error("Failed to send request. Try again.");
    } finally {
      setSendingRequest(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">
          {recycler.fullName || recycler.name}
        </h2>
        <p className="text-gray-600 mt-2">
          {recycler.description || "No description available."}
        </p>

        <div className="mt-4 space-y-2">
          <p>
            <strong>Email:</strong> {recycler.email}
          </p>
          <p>
            <strong>Phone:</strong> {recycler.phone}
          </p>
          <p>
            <strong>City:</strong> {recycler.city}
          </p>
          <p>
            <strong>State:</strong> {recycler.state}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {recycler.rating || "N/A"}
          </p>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={sendingRequest}
          className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          {sendingRequest ? "Sending..." : "Send Request to Recycler"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Send Request</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send a request to{" "}
              <span className="font-bold text-gray-800">
                {recycler.fullName || recycler.name}
              </span>
              ?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={sendingRequest}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {sendingRequest ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}