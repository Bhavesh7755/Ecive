import React, { useEffect, useState } from "react";
import { recyclerAPI } from "../../services/authService";
import {
  MapPin,
  ListOrdered,
  Loader2,
  ArrowRightCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Image as ImageIcon,
  Check,
  Trash2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------- fallback "No image" SVG (data URI) ---------- */
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='#f3f4f6'/>
    <g fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='34'>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
    </g>
  </svg>`
);

function Toast({ msg, type = "info", onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm
        ${type === "success" ? "bg-emerald-600 text-white" : ""}
        ${type === "error" ? "bg-rose-600 text-white" : ""}
        ${type === "info" ? "bg-gray-800 text-white" : ""}`}
      role="alert"
    >
      <span>{msg}</span>
      <button onClick={onClose} className="opacity-80 ml-2">✕</button>
    </motion.div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 34, scale: 0.95 },
  visible: i => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.045, type: "spring", stiffness: 105, damping: 17 }
  })
};

export default function RecyclerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, request: null });
  const [modalIndex, setModalIndex] = useState(0);
  const [actionStatus, setActionStatus] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchRequests() {
      setLoading(true);
      try {
        const data = await recyclerAPI.getRecyclerRequests();
        if (!mounted) return;
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setRequests([]);
        setToast({ msg: "Failed to load requests", type: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRequests();
    return () => { mounted = false; };
  }, []);

  const openModalFor = (r) => {
    setModal({ open: true, request: r });
    setModalIndex(0);
  };
  const closeModal = () => {
    setModal({ open: false, request: null });
    setModalIndex(0);
  };
  const nextProduct = () => {
    const len = modal.request?.products?.length || 0;
    setModalIndex(i => Math.min(i + 1, Math.max(0, len - 1)));
  };
  const prevProduct = () => setModalIndex(i => Math.max(i - 1, 0));
  
  const handleAction = async (requestId, action) => {
    if (!requestId) return;
    setActionStatus("loading");
    try {
      await recyclerAPI.updateRequestStatus(requestId, action);
      setRequests(prev => prev.filter(r => (r.requestId ?? r.postId) !== requestId));
      setActionStatus("success");
      setToast({ msg: `Request ${action}ed`, type: "success" });
      closeModal();
    } catch (err) {
      setActionStatus("error");
      setToast({ msg: `Failed to ${action} request`, type: "error" }); 
    } finally {
      setTimeout(() => setActionStatus(""), 900);
    }
  };
  const formattedDate = (d) => {
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-2 sm:px-4 lg:px-6 py-6 min-h-screen bg-gradient-to-br from-green-50 to-sky-50"
      style={{ paddingBottom: 104 }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-800 mb-6 text-center select-none">
          <span className="inline-block bg-gradient-to-l from-emerald-400 via-green-500 to-blue-500 bg-clip-text text-transparent animate-gradient-x">
            🚚 Incoming Pickup Requests
          </span>
        </h2>
        {/* Toast notification (top right, mobile bottom-center) */}
        <div className="fixed z-50 top-6 right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-auto sm:bottom-6">
          <AnimatePresence>
            {toast && (
              <motion.div key="toast" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* loading */}
        {loading ? (
          <div className="flex flex-col items-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            <p className="mt-6 text-lg text-emerald-700 font-bold">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            layout
            className="mx-auto text-center py-24 max-w-2xl bg-white rounded-2xl shadow-xl border flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ListOrdered className="h-16 w-16 text-gray-300 mb-2" />
            <p className="text-gray-500 text-2xl font-medium">No requests right now</p>
            <p className="text-sm text-gray-400">You’ll see requests here when users send them.</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-6"
          >
            <AnimatePresence>
              {requests.map((r, idx) => {
                const key = r.requestId ?? r.postId ?? `req_${idx}`;
                const p0 = r.products?.[0] || {};
                return (
                  <motion.div
                    key={key}
                    layout
                    custom={idx}
                    variants={cardVariant}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.98, y: 20 }}
                    transition={{ type: "spring" }}
                    className="relative rounded-3xl bg-white border-2 border-emerald-100 shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition hover:-translate-y-2 flex flex-col"
                    onClick={() => openModalFor(r)}
                    whileHover={{ scale: 1.025, borderColor: "#34d399" }}
                  >
                    {/* card header */}
                    <motion.div
                      className="flex items-center gap-4 px-5 py-4 bg-emerald-50/60 border-b"
                      initial={false}
                      whileHover={{ background: "linear-gradient(90deg, #a7f3d0 0%, #f0fdfa 100%)" }}
                      transition={{ type: "spring", duration: 0.15 }}
                    >
                      <div className="w-14 h-14 rounded-full border overflow-hidden flex items-center justify-center bg-white">
                        <img
                          src={r.user?.avatar || FALLBACK_IMG}
                          alt={r.user?.fullName || "User"}
                          onError={e => (e.currentTarget.src = FALLBACK_IMG)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-900">{r.user?.fullName || "User"}</div>
                        <div className="text-sm text-gray-500">{r.user?.city || r.user?.address || "Unknown location"}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-xs text-gray-400">{formattedDate(r.sentAt ?? r.createdAt)}</div>
                        <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          {r.products?.length ?? 0} item{(r.products?.length ?? 0) > 1 ? "s" : ""}
                        </div>
                      </div>
                    </motion.div>
                    {/* body */}
                    <div className="p-6 flex gap-6 flex-col sm:flex-row">
                      <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden bg-gray-100 border flex items-center justify-center flex-shrink-0">
                        <img
                          src={p0.images?.[0] || FALLBACK_IMG}
                          alt={p0.brand || p0.wasteType || "product"}
                          onError={e => (e.currentTarget.src = FALLBACK_IMG)}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="text-lg font-bold text-emerald-800 truncate">{p0.brand || p0.wasteType || "Product"}</div>
                          <div className="text-sm text-gray-600">{p0.model || ""}</div>
                          <div className="ml-auto text-sm text-gray-500">AI: <span className="font-semibold text-emerald-700">{p0.aiConditionScore ?? "N/A"}</span></div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 truncate">
                          <MapPin size={14} className="inline-block mr-1 text-purple-500" />{r.userAddress}
                        </div>
                        {r.products?.length > 1 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {r.products.map((p, i) => (
                              <div key={`${key}_prod_${i}`} className="px-3 py-1 rounded-full bg-gray-50 border text-sm text-gray-700">
                                {p.brand || p.wasteType} <span className="text-xs text-gray-400">×{p.quantity ?? 1}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-3">
                          <ArrowRightCircle className="text-emerald-500" />
                          <div className="text-sm text-emerald-700 font-semibold">Tap to view full request</div>
                        </div>
                      </div>
                    </div>
                    {/* footer actions -- always inside border, fully responsive */}
                    <motion.div
                      className="w-full px-5 pb-4 pt-2 flex flex-col m-auto sm:flex-row items-stretch gap-2 sm:gap-4 border-t bg-gradient-to-br from-emerald-50 via-white to-emerald-50"
                      style={{ paddingTop: 10 }}
                      initial={false}
                      whileHover={{ backgroundColor: "#f8fffdff" }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="text-[0.94rem] text-gray-500 flex items-center justify-between flex-1 sm:flex-initial">
                        <span>
                          Status:
                          <span className="font-bold text-emerald-700 ml-2">{r.postStatus ?? r.requestStatus ?? "pending"}</span>
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap justify-end items-center">
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          tabIndex={0}
                          onClick={e => { e.stopPropagation(); handleAction(r.requestId , "accept"); }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow font-semibold hover:from-green-600 transition-all"
                        >
                          <Check size={16} /> Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          tabIndex={0}
                          onClick={e => { e.stopPropagation(); handleAction(r.requestId , "reject"); }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 text-white shadow font-semibold hover:from-red-700 transition-all"
                        >
                          <Trash2 size={16} /> Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      {/* ------- Modal for full request details ------ */}
      <AnimatePresence>
        {modal.open && modal.request && (
          <motion.div
            key="modal-root"
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.57)" }}
          >
            <motion.div
              className="bg-white w-full max-w-4xl rounded-2xl p-6 md:p-8 shadow-2xl border-2 flex flex-col"
              initial={{ scale: 0.97, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 28 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border bg-white flex-shrink-0">
                  <img src={modal.request.user?.avatar || FALLBACK_IMG} onError={e => (e.currentTarget.src = FALLBACK_IMG)} alt="user" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-emerald-900 pr-4">
                    {modal.request.user?.fullName || "User"}{" "}
                    <span className="text-xs text-gray-500">
                      {formattedDate(modal.request.sentAt ?? modal.request.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={14} className="text-purple-400" />{modal.request.userAddress}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100" onClick={closeModal}><X /></button>
                </div>
              </div>
              {/* product navigation if multiple */}
              {modal.request.products?.length > 1 && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button onClick={prevProduct} disabled={modalIndex === 0} className="p-2 rounded-full border-2 disabled:opacity-40"><ArrowLeft /></button>
                  <div className="text-sm text-gray-600">Product {modalIndex + 1} of {modal.request.products.length}</div>
                  <button onClick={nextProduct} disabled={modalIndex === (modal.request.products.length - 1)} className="p-2 rounded-full border-2 disabled:opacity-40"><ArrowRight /></button>
                </div>
              )}
              {(() => {
                const p = modal.request.products?.[modalIndex] ?? {};
                return (
                  <motion.div
                    className="flex flex-col md:flex-row gap-6"
                    initial={{ x: 44, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="md:w-80 w-full rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={p.images?.[0] || FALLBACK_IMG}
                        onError={e => (e.currentTarget.src = FALLBACK_IMG)}
                        alt={p.brand || p.wasteType}
                        className="w-full h-60 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 uppercase font-semibold pb-1">{p.wasteType}</div>
                      <div className="text-2xl font-bold text-emerald-800">{p.brand} <span className="text-gray-700">{p.model}</span></div>
                      <div className="text-md mb-2"><span className="font-semibold">AI Price:</span> ₹{p.aiSuggestedPrice ?? "N/A"} <span className="text-sm text-gray-400 ml-2">({p.aiConfidence ?? 0}% conf.)</span></div>
                      <div className="text-md mb-2"><span className="font-semibold">AI Score:</span> {p.aiConditionScore ?? "N/A"}/100</div>
                      <div className="text-md mb-3"><span className="font-semibold">Description:</span> {p.description || "—"}</div>
                      <div className="font-semibold text-gray-800 mb-2">Condition Details</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {p.conditionDetails && Object.keys(p.conditionDetails).length > 0 ? (
                          Object.entries(p.conditionDetails).map(([k, v]) => (
                            <div key={k} className="px-3 py-2 rounded-lg bg-gray-50 border text-gray-700">
                              <div className="text-xs text-gray-500">{k.replace(/([A-Z])/g, " $1")}</div>
                              <div className="font-medium">{String(v)}</div>
                            </div>
                          ))
                        ) : <div className="text-gray-400">No condition details</div>}
                      </div>
                      {p.images?.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto py-2">
                          {p.images.map((img, i) => (
                            <button
                              key={`thumb_${i}`}
                              className="w-24 h-16 rounded-lg bg-gray-50 border cursor-pointer"
                              tabIndex={0}
                              aria-label={`Show image ${i + 1}`}
                              onClick={() => {
                                // move clicked img to front in-place
                                if (i !== 0) {
                                  const arr = [...(modal.request.products[modalIndex].images || [])];
                                  const clicked = arr.splice(i, 1)[0];
                                  arr.unshift(clicked);
                                  const copy = { ...modal.request };
                                  copy.products = copy.products.map((prod, pi) => pi === modalIndex ? { ...prod, images: arr } : prod);
                                  setModal(m => ({ ...m, request: copy }));
                                }
                              }}
                            >
                              <img src={img || FALLBACK_IMG} onError={e => (e.currentTarget.src = FALLBACK_IMG)} className="w-full h-full object-cover" alt={`img ${i + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
              {/* Footer actions: always visible */}
              <motion.div
                className="mt-10 flex flex-wrap items-center justify-between gap-4"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border">
                    <img src={modal.request.user?.avatar || FALLBACK_IMG} onError={e => (e.currentTarget.src = FALLBACK_IMG)} alt="user" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">{modal.request.user?.fullName}</div>
                    <div className="text-gray-500 text-xs">{modal.request.user?.email} · {modal.request.user?.mobile}</div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(modal.request.requestId, "accept")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow hover:from-green-600"
                    disabled={actionStatus === "loading"}
                  >
                    {actionStatus === "loading" ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Accept</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(modal.request.requestId , "reject")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow hover:from-red-700"
                    disabled={actionStatus === "loading"}
                  >
                    {actionStatus === "loading" ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Reject</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                  >Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}