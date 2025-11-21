import React from "react";
import { Check, XCircle, Package, ShieldCheck } from "lucide-react";

export default function UserActions({ post, onCancel, onConfirmPrice, onCollected, onCompleted }) {
  const status = post.status;

  return (
    <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-800 mb-1">Your Actions</h3>

      {/* Cancel Post */}
      {status === "pending" || status === "aiSuggested" || status === "waitingRecycler" ? (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          onClick={onCancel}
        >
          <XCircle size={16} /> Cancel Post
        </button>
      ) : null}

      {/* Confirm Final Price */}
      {status === "negotiation" && post.negotiatedPrice ? (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          onClick={onConfirmPrice}
        >
          <Check size={16} /> Confirm Final Price
        </button>
      ) : null}

      {/* Mark as Collected */}
      {status === "finalized" ? (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          onClick={onCollected}
        >
          <Package size={16} /> Mark as Collected
        </button>
      ) : null}

      {/* Mark as Completed */}
      {status === "collected" ? (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
          onClick={onCompleted}
        >
          <ShieldCheck size={16} /> Mark as Completed
        </button>
      ) : null}
    </div>
  );
}