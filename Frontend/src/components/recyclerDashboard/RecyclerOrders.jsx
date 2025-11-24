// src/components/recyclerDashboard/RecyclerOrders.jsx

import React, { useEffect, useState } from "react";
import {
  Package,
  MapPin,
  Clock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  X,
} from "lucide-react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [lightboxImg, setLightboxImg] = useState(null);

  // Chat modal states
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");

  // Finalize price states
  const [finalPrice, setFinalPrice] = useState("");
  const [loadingFinalize, setLoadingFinalize] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await recyclerAPI.getRecyclerOrders();
      setOrders(res || []);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalAiPrice = (products = []) =>
    products.reduce((sum, p) => sum + (Number(p.aiSuggestedPrice) || 0), 0);

  const statusClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "collected":
        return "bg-indigo-100 text-indigo-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "negotiation":
        return "bg-yellow-100 text-yellow-700";
      case "finalized":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const openChat = (order) => {
    setChatOrder(order);
    setChatMessage("");
    setChatError("");
    setFinalPrice("");
  };

  const closeChat = () => {
    setChatOrder(null);
    setChatMessage("");
    setChatError("");
    setChatSending(false);
    setFinalPrice("");
  };

  const handleSendChat = async () => {
    if (!chatOrder || !chatMessage.trim()) return;

    try {
      setChatSending(true);
      const updatedPost = await recyclerAPI.addOrderMessage(
        chatOrder._id,
        chatMessage.trim()
      );

      setChatOrder(updatedPost);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedPost._id ? updatedPost : o))
      );
      setChatMessage("");
    } catch (err) {
      setChatError(err.message || "Failed to send message");
    } finally {
      setChatSending(false);
    }
  };

  const handleFinalizePrice = async () => {
    if (!chatOrder || !finalPrice.trim()) return;

    try {
      setLoadingFinalize(true);
      const updatedPost = await recyclerAPI.finalizeOrderPrice(
        chatOrder._id,
        Number(finalPrice)
      );

      setChatOrder(updatedPost);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedPost._id ? updatedPost : o))
      );
      setFinalPrice("");
    } catch (err) {
      alert(err.message || "Failed to finalize price");
    } finally {
      setLoadingFinalize(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-6">
        {error}
        <button
          onClick={fetchOrders}
          className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            className="max-w-[90%] max-h-[85vh] rounded-xl shadow-2xl border"
            alt="Preview"
          />
        </div>
      )}

      {/* Chat Modal */}
      {chatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <p className="text-xs text-gray-400">Order ID: {chatOrder._id}</p>
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  <MessageCircle size={18} className="text-blue-600" />
                  Chat with {chatOrder.user?.fullName || "User"}
                </p>
              </div>
              <button
                onClick={closeChat}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 py-3 border-b flex-1 overflow-y-auto bg-gray-50 space-y-2">
              {(chatOrder.negotiationHistory || []).map((msg, idx) => {
                const isRecycler = msg.sender === "recycler";
                const isSystem = msg.sender === "system";

                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isRecycler ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-xs shadow-sm ${
                        isSystem
                          ? "bg-yellow-100 text-yellow-800"
                          : isRecycler
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border rounded-bl-none"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {isRecycler
                            ? "You (Recycler)"
                            : msg.sender === "user"
                            ? "User"
                            : "System"}
                        </span>

                        {msg.priceOffer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                            <IndianRupee size={10} />
                            {msg.priceOffer}
                          </span>
                        )}
                      </div>

                      {msg.message && <p>{msg.message}</p>}
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input + Finalize Price */}
            <div className="px-4 py-3 border-b flex flex-col gap-3">

              {/* Chat Input */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  onClick={handleSendChat}
                  disabled={chatSending || !chatMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60"
                >
                  {chatSending ? "Sending..." : "Send"}
                </button>
              </div>

              {/* Finalize Price */}
              <div className="flex gap-2 items-center mt-2">
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="Enter final amount"
                  className="border rounded-lg px-3 py-2 text-sm w-40"
                />

                <button
                  onClick={handleFinalizePrice}
                  disabled={loadingFinalize || !finalPrice.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-60"
                >
                  {loadingFinalize ? "Finalizing..." : "Finalize"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            {/* Orders List */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700 flex items-center">
          <Package className="mr-2" /> All Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No orders found.
          </p>
        ) : (
          orders.map((order) => {
            const expandedState = expanded[order._id] || false;

            return (
              <div
                key={order._id}
                className="bg-white shadow-lg p-5 rounded-xl border border-emerald-200 hover:shadow-xl transition-all"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  {/* LEFT */}
                  <div>
                    <p className="text-xs text-gray-400">
                      Order ID: {order._id}
                    </p>

                    <p className="font-semibold text-gray-800 text-lg">
                      {order.user?.fullName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.user?.email} • {order.user?.mobile}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-red-500" />
                      <span>{order.userAddress}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleString()}
                    </div>

                    {/* Open Chat */}
                    <button
                      onClick={() => openChat(order)}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <MessageCircle size={14} />
                      Open Chat
                    </button>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClasses(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <div className="mt-2 text-sm font-semibold text-green-700 flex items-center gap-1 justify-end">
                      <IndianRupee size={14} />
                      {totalAiPrice(order.products).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* EXPAND BUTTON */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => toggleExpanded(order._id)}
                    className="text-sm flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                  >
                    {expandedState ? (
                      <>
                        Hide Details <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* PRODUCT DETAILS */}
                {expandedState && (
                  <div className="mt-4 border-t pt-3 space-y-4 animate-fadeIn">
                    {order.products.map((p, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.brand || p.wasteType} {p.model}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {p.quantity} • {p.category}
                            </p>
                          </div>

                          <p className="font-semibold text-green-700 flex items-center gap-1">
                            <IndianRupee size={12} />
                            {p.aiSuggestedPrice}
                          </p>
                        </div>

                        {/* CONDITION DETAILS */}
                        {p.conditionDetails && (
                          <div className="mt-3 text-xs space-y-1">
                            <p className="font-semibold text-gray-700">
                              Condition Details:
                            </p>
                            {Object.entries(p.conditionDetails).map(
                              ([key, val]) => (
                                <p key={key} className="text-gray-600">
                                  <span className="font-medium">
                                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                                    :
                                  </span>{" "}
                                  {String(val)}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
