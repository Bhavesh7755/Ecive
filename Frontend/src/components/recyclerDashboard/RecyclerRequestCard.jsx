// src/components/recyclerDashboard/RecyclerRequestCard.jsx
import React, { useState } from "react";
import { Button } from "../ui/Button"; // Assuming you have a button component, else use normal button
import { recyclerAPI } from "../../services/authService";

export default function RecyclerRequestCard({ request, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request.status || "pending");

  const handleAction = async (action) => {
    if (status !== "pending") return; // Only allow action if pending
    setLoading(true);
    try {
      await recyclerAPI.updateRequestStatus(request.requestId, action); // accept or reject
      setStatus(action === "accept" ? "accepted" : "rejected");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Post ID: {request.postId}</h3>
        {request.products && request.products.length > 0 && (
          <p className="text-gray-600 text-sm mb-1">
            Total Products: {request.products.length}
          </p>
        )}
        {request.user && (
          <p className="text-gray-600 text-sm mb-1">
            Requested by: {request.user.fullName || request.user.email}
          </p>
        )}
        {request.sentAt && (
          <p className="text-gray-500 text-xs">
            Sent At: {new Date(request.sentAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        {status === "pending" ? (
          <>
            <button
              onClick={() => handleAction("accept")}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
            >
              Reject
            </button>
          </>
        ) : (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
