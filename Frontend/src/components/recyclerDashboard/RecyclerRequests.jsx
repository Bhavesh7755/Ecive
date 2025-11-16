// src/components/recyclerDashboard/RecyclerRequests.jsx
import React, { useEffect, useState } from "react";
import { recyclerAPI, postAPI } from "../../services/authService";
import { MapPin, Smartphone, Loader2, ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Recycler Requests (attractive, defensive)
 *
 * NOTE: Backend should include request._id (unique id for each request).
 * If request._id is missing, this component will FALL BACK and update the post status
 * using postAPI.updatePostStatus(postId, status). This is a best-effort fallback.
 */

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.05, type: "spring", stiffness: 120 } })
};

const safeDate = (d) => {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "Unknown";
  }
};

const FallbackImage = () => (
  // small inline svg fallback to avoid external placeholder DNS issues
  <svg viewBox="0 0 600 400" className="w-full h-40 object-cover rounded-xl mb-3 border bg-gray-50">
    <rect width="100%" height="100%" fill="#f8fafc" />
    <g fill="#d1fae5">
      <circle cx="80" cy="80" r="60" />
      <rect x="160" y="40" rx="12" ry="12" width="360" height="220" />
    </g>
  </svg>
);

export default function RecyclerRequests() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // currently processing accept/reject

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await recyclerAPI.getRecyclerRequests();
      // your service returns response.data?.data or array; ensure we have array of items
      const items = Array.isArray(res) ? res : (res?.data ?? (res?.data === undefined && res) ? res : []);
      // If your authService already returns data array (response.data.data) then res is array.
      // Normalize shape to prefer object fields like postId, sentAt etc.
      setPosts(items);
    } catch (err) {
      console.error("Error fetching requests", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // optionally you can poll every n seconds: uncomment below
    // const id = setInterval(fetchRequests, 20000);
    // return () => clearInterval(id);
  }, []);

  const handleAccept = async (item) => {
    // item may have requestId / _id or only postId
    const requestId = item._id || item.requestId || item.requestIdString;
    const postId = item.postId || item._id;

    try {
      setBusyId(requestId || postId);
      if (requestId) {
        // Preferred: update specific request
        await recyclerAPI.updateRequestStatus(requestId, "accept");
        alert("Request accepted (request API).");
      } else if (postId) {
        // Fallback: update the post status to negotiation (best-effort)
        console.warn("request._id missing in API response. Falling back to updating post status (negotiation).");
        await postAPI.updatePostStatus(postId, "negotiation");
        alert("Request accepted (fallback: post status updated).");
      } else {
        throw new Error("No requestId or postId available to accept.");
      }

      // Refresh list
      await fetchRequests();
    } catch (err) {
      console.error("Accept failed:", err);
      alert(err.message || "Failed to accept request");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (item) => {
    const requestId = item._id || item.requestId || item.requestIdString;
    const postId = item.postId || item._id;

    try {
      setBusyId(requestId || postId);
      if (requestId) {
        await recyclerAPI.updateRequestStatus(requestId, "reject");
        alert("Request rejected (request API).");
      } else if (postId) {
        console.warn("request._id missing in API response. Falling back to updating post status (set to pending).");
        // fallback: set post back to pending/waitingRecycler -> choose 'pending' so it's not considered accepted
        await postAPI.updatePostStatus(postId, "pending");
        alert("Request rejected (fallback: post status updated).");
      } else {
        throw new Error("No requestId or postId available to reject.");
      }

      // Refresh list
      await fetchRequests();
    } catch (err) {
      console.error("Reject failed:", err);
      alert(err.message || "Failed to reject request");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <motion.div className="flex flex-col items-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
        <motion.p initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-lg font-semibold text-emerald-600">
          Loading requests...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-6 sm:p-6">
      <motion.h2 className="text-3xl font-extrabold mb-6 text-emerald-700 text-center">
        🚚 Pickup Requests
      </motion.h2>

      {(!posts || posts.length === 0) ? (
        <div className="mx-auto text-center py-12 max-w-xl bg-white rounded-3xl shadow-xl border">
          <p className="text-gray-500 text-xl font-medium">No requests available right now.</p>
          <p className="text-sm text-gray-400 mt-2">Requests will appear here when users send them.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {posts.map((post, i) => {
              const uniqueKey = post._id || post.postId || `post-${i}`;
              const product = Array.isArray(post.products) ? post.products[0] : (post.product || {});
              const images = product?.images ?? []; // may be undefined
              const aiPrice = product?.aiSuggestedPrice ?? "-";
              const aiScore = product?.aiConditionScore ?? "-";
              const aiConfidence = product?.aiConfidence ?? "-";

              return (
                <motion.article
                  key={uniqueKey}
                  layout
                  custom={i}
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="relative bg-white rounded-3xl shadow-lg border-2 border-emerald-50 overflow-hidden flex flex-col p-4"
                >
                  {/* header */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="inline-flex items-center justify-center rounded-lg bg-emerald-50 p-2">
                      <Smartphone size={20} className="text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-emerald-800 truncate">
                        {product?.brand || "Unknown Brand"} {product?.model ? `— ${product.model}` : ""}
                      </h3>
                      <div className="text-sm text-gray-500 truncate">{post.postStatus ? `Status: ${post.postStatus}` : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Sent</div>
                      <div className="text-sm font-medium">{safeDate(post.sentAt || post.createdAt)}</div>
                    </div>
                  </div>

                  {/* image area */}
                  <div className="flex-shrink-0 mb-3">
                    {images && images.length > 0 ? (
                      <img src={images[0]} alt="product" className="w-full h-40 object-cover rounded-xl border" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=''; }} />
                    ) : (
                      <FallbackImage />
                    )}
                  </div>

                  {/* details */}
                  <div className="flex-1 space-y-2 text-gray-700 pb-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">AI Price</span>
                      <span className="font-semibold text-emerald-600">₹{aiPrice}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Condition Score</span>
                      <span className="inline-block px-2 py-[2px] rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs">{aiScore} / 100</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">AI Confidence</span>
                      <span className="text-sm text-gray-600">{aiConfidence}%</span>
                    </div>

                    <div className="pt-2">
                      <div className="text-sm font-semibold mb-1">Condition Details</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {product?.conditionDetails && typeof product.conditionDetails === "object" && Object.keys(product.conditionDetails).length > 0 ? (
                          Object.entries(product.conditionDetails).map(([k, v]) => (
                            <div key={k} className="bg-gray-50 rounded p-2 border">
                              <div className="text-xs text-gray-500">{k}</div>
                              <div className="font-medium text-sm">{String(v)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400">No detailed condition provided.</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                      <MapPin size={14} className="text-purple-500" />
                      <div className="truncate">{post.userAddress || "Pickup address not set"}</div>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="mt-3 pt-2 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={busyId === uniqueKey}
                      onClick={() => handleAccept({ ...post, _id: post.requestId || post._id || post.postId })}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2 rounded-lg font-semibold shadow"
                    >
                      {busyId === uniqueKey ? "Processing..." : "Accept"}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={busyId === uniqueKey}
                      onClick={() => handleReject({ ...post, _id: post.requestId || post._id || post.postId })}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow"
                    >
                      {busyId === uniqueKey ? "Processing..." : "Reject"}
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
