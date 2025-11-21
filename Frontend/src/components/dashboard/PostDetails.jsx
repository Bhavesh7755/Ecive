// src/components/dashboard/PostDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, userAPI } from "../../services/authService";
import {
  ArrowLeft,
  Package,
  MapPin,
  User as UserIcon,
  Store,
  IndianRupee,
  MessageCircle,
  Clock,
  X,
  ZoomIn,
  Check,
  XCircle,
  Package as PackageIcon,
  ShieldCheck,
} from "lucide-react";
import Timeline from "./Timeline.jsx";

function formatConditionKey(key) {
  if (!key) return "";
  const withSpaces = key.replace(/([A-Z])/g, " $1");
  return withSpaces
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- User Actions Sidebar Component ----------
function UserActions({ post, onCancel, onConfirmPrice, onCollected, onCompleted }) {
  const status = post.status;

  return (
    <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-800 mb-1">Your Actions</h3>
      <p className="text-xs text-gray-500">
        These actions update the status of your post in the system.
      </p>

      {/* Cancel Post */}
      {(status === "pending" ||
        status === "aiSuggested" ||
        status === "waitingRecycler") && (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          onClick={onCancel}
        >
          <XCircle size={16} /> Cancel Post
        </button>
      )}

      {/* Confirm Final Price */}
      {status === "negotiation" && post.negotiatedPrice && (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          onClick={onConfirmPrice}
        >
          <Check size={16} /> Confirm Final Price
        </button>
      )}

      {/* Mark as Collected */}
      {status === "finalized" && (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          onClick={onCollected}
        >
          <PackageIcon size={16} /> Mark as Collected
        </button>
      )}

      {/* Mark as Completed */}
      {status === "collected" && (
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
          onClick={onCompleted}
        >
          <ShieldCheck size={16} /> Mark as Completed
        </button>
      )}

      {!(status === "pending" ||
        status === "aiSuggested" ||
        status === "waitingRecycler" ||
        (status === "negotiation" && post.negotiatedPrice) ||
        status === "finalized" ||
        status === "collected") && (
        <p className="text-xs text-gray-400">
          No actions available in the current status.
        </p>
      )}
    </div>
  );
}

// ---------- MAIN COMPONENT ----------
export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // For chat scroll
  const messagesEndRef = useRef(null);

  // For per-product selected image index
  const [selectedImages, setSelectedImages] = useState({});
  // For per-product condition collapse
  const [expandedConditions, setExpandedConditions] = useState({});
  // For lightbox (full-screen image)
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await postAPI.getPostDetails(id);
      setPost(resp); // resp is already the post object
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const resp = await userAPI.getCurrentUser();
      // your userAPI either returns resp.data or full object – adjust if needed
      setCurrentUser(resp.data || resp);
    } catch (err) {
      console.error("Failed to load current user:", err);
    }
  };

  useEffect(() => {
    loadPost();
    loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [post?.negotiationHistory]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      setSending(true);
      setError("");
      await postAPI.addMessage(id, messageText.trim()); // you already had this
      setMessageText("");
      await loadPost(); // refresh chat
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ---------- ACTION HANDLERS (user) ----------
  const handleCancelPost = async () => {
    if (!window.confirm("Are you sure you want to cancel this post?")) return;
    try {
      setActionLoading(true);
      setError("");
      await postAPI.updatePostStatus(id, "cancelled");
      await loadPost();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to cancel post");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmFinalPrice = async () => {
    if (!window.confirm("Confirm this final negotiated price?")) return;
    try {
      setActionLoading(true);
      setError("");
      await postAPI.updatePostStatus(id, "finalized");
      await loadPost();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to confirm final price");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!window.confirm("Has the recycler collected the items?")) return;
    try {
      setActionLoading(true);
      setError("");
      await postAPI.updatePostStatus(id, "collected");
      await loadPost();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to mark as collected");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm("Is the transaction fully completed and paid?")) return;
    try {
      setActionLoading(true);
      setError("");
      await postAPI.updatePostStatus(id, "completed");
      await loadPost();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to mark as completed");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "negotiation":
        return "bg-orange-100 text-orange-700";
      case "waitingRecycler":
        return "bg-blue-100 text-blue-700";
      case "finalized":
        return "bg-purple-100 text-purple-700";
      case "collected":
        return "bg-indigo-100 text-indigo-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const calculateAiTotal = () =>
    (post?.products || []).reduce(
      (sum, p) => sum + (Number(p.aiSuggestedPrice) || 0),
      0
    );

  const handleThumbClick = (productIndex, imgIndex) => {
    setSelectedImages((prev) => ({
      ...prev,
      [productIndex]: imgIndex,
    }));
  };

  const getSelectedImage = (product, index) => {
    if (!product.images || product.images.length === 0) return null;
    const idx = selectedImages[index] ?? 0;
    return product.images[idx] || product.images[0];
  };

  const toggleCondition = (productIndex) => {
    setExpandedConditions((prev) => ({
      ...prev,
      [productIndex]: !prev[productIndex],
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading post details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <p className="text-red-600">Post not found.</p>
      </div>
    );
  }

  const aiTotal = calculateAiTotal();

  // Is the current user the owner of this post?
  const isOwner =
    currentUser &&
    post.user &&
    String(currentUser._id) === String(post.user._id);

  return (
    <>
      {/* Lightbox overlay */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="relative max-w-3xl w-full px-4">
            <button
              className="absolute -top-8 right-0 text-white hover:text-gray-200"
              onClick={() => setLightboxUrl(null)}
            >
              <X size={24} />
            </button>
            <img
              src={lightboxUrl}
              alt="Full view"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>

          <span
            className={
              "text-xs px-3 py-1 rounded-full capitalize " +
              getStatusBadgeClasses(post.status)
            }
          >
            {post.status}
          </span>
        </div>

        <Timeline status={post.status} />

        {/* MAIN LAYOUT: left content + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT: main info, products, chat */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main info card */}
            <div className="bg-white border rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Package className="text-green-600" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {post.products?.[0]?.brand ||
                        post.products?.[0]?.wasteType ||
                        "E-waste item"}
                      {post.products?.[0]?.model
                        ? " " + post.products[0].model
                        : ""}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {post.products?.[0]?.category ||
                        post.products?.[0]?.wasteType ||
                        "General e-waste"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created at: {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Post ID: {post._id}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">AI Total Price: </span>
                    <span className="font-semibold text-green-700">
                      {aiTotal > 0 ? `₹${aiTotal.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                  {post.negotiatedPrice && (
                    <div className="text-sm">
                      <span className="text-gray-500">Final Price: </span>
                      <span className="font-semibold text-indigo-700">
                        ₹{Number(post.negotiatedPrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address + User + Recycler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-red-500" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Pickup Address
                    </p>
                    <p className="text-sm text-gray-800">
                      {post.userAddress}
                    </p>
                    {post.user?.city && (
                      <p className="text-xs text-gray-500 mt-1">
                        City: {post.user.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserIcon className="mt-1 text-blue-500" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">You</p>
                    <p className="text-sm text-gray-800">
                      {post.user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.user?.email} · {post.user?.mobile}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Store className="mt-1 text-green-600" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Recycler
                    </p>
                    {post.recycler ? (
                      <>
                        <p className="text-sm text-gray-800">
                          {post.recycler.shopName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.recycler.email} · {post.recycler.mobile}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          City: {post.recycler.city}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No recycler selected yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PREMIUM PRODUCT CARDS */}
            <div className="bg-white border rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <IndianRupee size={18} className="text-green-600" />
                Product Details
              </h3>

              <div className="space-y-4">
                {(post.products || []).map((p, index) => {
                  const mainImage = getSelectedImage(p, index);
                  const conditionEntries = p.conditionDetails
                    ? Object.entries(p.conditionDetails)
                    : [];

                  return (
                    <div
                      key={index}
                      className="border rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            Product #{index + 1}
                          </p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {p.brand || p.wasteType || "E-waste item"}{" "}
                            {p.model || ""}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {p.category || p.wasteType || "General e-waste"} ·
                            Qty: {p.quantity || 1}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">AI Suggested</p>
                          <p className="font-semibold text-green-700">
                            {p.aiSuggestedPrice
                              ? `₹${Number(
                                  p.aiSuggestedPrice
                                ).toLocaleString()}`
                              : "N/A"}
                          </p>
                          {p.aiConditionScore !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Condition Score: {p.aiConditionScore}/100
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Image gallery */}
                        <div>
                          {mainImage ? (
                            <div className="space-y-2">
                              <div
                                className="relative w-full rounded-xl overflow-hidden border bg-gray-100 cursor-pointer group"
                                onClick={() => setLightboxUrl(mainImage)}
                              >
                                <img
                                  src={mainImage}
                                  alt="Product"
                                  className="w-full h-56 md:h-64 object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs inline-flex items-center gap-1">
                                    <ZoomIn size={14} />
                                    View full
                                  </div>
                                </div>
                              </div>

                              {p.images && p.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                  {p.images.map((img, imgIndex) => (
                                    <button
                                      key={imgIndex}
                                      type="button"
                                      onClick={() =>
                                        handleThumbClick(index, imgIndex)
                                      }
                                      className={`w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0 ${
                                        (selectedImages[index] ?? 0) ===
                                        imgIndex
                                          ? "border-green-500 ring-2 ring-green-200"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      <img
                                        src={img}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-40 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                              No images uploaded for this product.
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="space-y-3 text-sm">
                          {p.description && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">
                                Description
                              </p>
                              <p className="text-gray-800">
                                {p.description}
                              </p>
                            </div>
                          )}

                          {/* Condition details (collapsible) */}
                          {conditionEntries.length > 0 && (
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <button
                                type="button"
                                onClick={() => toggleCondition(index)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-gray-700"
                              >
                                <span>View full condition details</span>
                                <span>
                                  {expandedConditions[index] ? "▲" : "▼"}
                                </span>
                              </button>

                              {expandedConditions[index] && (
                                <div className="mt-2 space-y-1">
                                  {conditionEntries.map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex items-start justify-between text-xs"
                                    >
                                      <span className="text-gray-500 mr-2">
                                        {formatConditionKey(key)}:
                                      </span>
                                      <span className="text-gray-800 text-right">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            AI Confidence:{" "}
                            {p.aiConfidence != null
                              ? `${p.aiConfidence}%`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat / Negotiation */}
            <div className="bg-white border rounded-xl p-4 md:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MessageCircle size={18} className="text-blue-600" />
                  Negotiation / Chat
                </h3>
                <p className="text-xs text-gray-500">
                  Only you and the assigned recycler can see these messages.
                </p>
              </div>

              <div className="border rounded-lg h-64 overflow-y-auto p-3 bg-gray-50 space-y-2">
                {(post.negotiationHistory || []).length === 0 && (
                  <p className="text-xs text-gray-500">
                    No messages yet. Start the negotiation below.
                  </p>
                )}

                {(post.negotiationHistory || []).map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  const isRecycler = msg.sender === "recycler";
                  const isSystem = msg.sender === "system";

                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-xs shadow-sm ${
                          isSystem
                            ? "bg-yellow-100 text-yellow-800"
                            : isUser
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 border rounded-bl-none"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {isUser
                              ? "You"
                              : isRecycler
                              ? "Recycler"
                              : "System"}
                          </span>
                          {msg.priceOffer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                              <IndianRupee size={10} />
                              {Number(msg.priceOffer).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {msg.message && (
                          <p className="leading-snug">{msg.message}</p>
                        )}
                        <p className="mt-1 text-[10px] opacity-70">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}

              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <button
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                  onClick={handleSendMessage}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: actions */}
          <div className="space-y-4">
            {isOwner && (
              <UserActions
                post={post}
                onCancel={handleCancelPost}
                onConfirmPrice={handleConfirmFinalPrice}
                onCollected={handleMarkCollected}
                onCompleted={handleMarkCompleted}
              />
            )}

            {actionLoading && (
              <p className="text-xs text-gray-500">
                Updating status...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}