import React from "react";
import { Check, Package, ShieldCheck } from "lucide-react";

export default function RecyclerActions({ post, onSendOffer, onAccept, onCollected, onCompleted }) {
  const status = post.status;

  return (
    <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-800">Recycler Actions</h3>

      {/* Send Price Offer */}
      {status === "negotiation" || status === "waitingRecycler" ? (
        <button
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          onClick={onSendOffer}
        >
          Send Price Offer
        </button>
      ) : null}

      {/* Accept User Final Price */}
      {status === "negotiation" && post.negotiatedPrice ? (
        <button
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          onClick={onAccept}
        >
          <Check size={16} /> Accept User Offer
        </button>
      ) : null}

      {/* Mark Item Collected */}
      {status === "finalized" ? (
        <button
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
          onClick={onCollected}
        >
          <Package size={16} /> Mark as Collected
        </button>
      ) : null}

      {/* Mark as Completed */}
      {status === "collected" ? (
        <button
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
          onClick={onCompleted}
        >
          <ShieldCheck size={16} /> Mark as Completed
        </button>
      ) : null}
    </div>
  );
}