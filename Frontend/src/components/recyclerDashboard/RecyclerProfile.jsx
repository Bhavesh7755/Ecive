// // src/components/recyclerDashboard/RecyclerProfile.jsx
// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { User, Upload } from "lucide-react";
// import { recyclerAPI } from "../../services/authService";

// export default function RecyclerProfile({ recycler }) {
//   const [formData, setFormData] = useState({
//     fullName: recycler?.fullName || "",
//     shopName: recycler?.shopName || "",
//     mobile: recycler?.mobile || "",
//     city: recycler?.city || "",
//     state: recycler?.state || "",
//     pincode: recycler?.pincode || "",
//     email: recycler?.email || "",
//   });
//   const [avatar, setAvatar] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleAvatarChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setAvatar(e.target.files[0]);
//     }
//   };

//   const handleUpdate = async () => {
//     try {
//       setLoading(true);
//       if (avatar) {
//         await recyclerAPI.updateAvatar(avatar);
//       }
//       await recyclerAPI.updateAccount(formData);
//       alert("Profile updated successfully!");
//       // Update localStorage
//       const updated = { ...recycler, ...formData };
//       if (avatar) updated.avatar = URL.createObjectURL(avatar);
//       localStorage.setItem("user", JSON.stringify(updated));
//       window.location.reload(); // refresh dashboard
//     } catch (err) {
//       alert(err.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 32 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow space-y-6"
//     >
//       <div className="flex items-center space-x-5">
//         <img
//           className="w-16 h-16 rounded-full border object-cover"
//           src={avatar ? URL.createObjectURL(avatar) : recycler?.avatar || "/default-avatar.png"}
//           alt={recycler?.fullName}
//         />
//         <div>
//           <label className="cursor-pointer text-sm text-green-600 hover:underline flex items-center space-x-1">
//             <Upload size={16} />
//             <span>Change Avatar</span>
//             <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
//           </label>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-gray-700 font-medium">Full Name</label>
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             className="w-full border rounded px-3 py-2 mt-1"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-medium">Shop Name</label>
//           <input
//             type="text"
//             name="shopName"
//             value={formData.shopName}
//             onChange={handleChange}
//             className="w-full border rounded px-3 py-2 mt-1"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-medium">Mobile</label>
//           <input
//             type="text"
//             name="mobile"
//             value={formData.mobile}
//             onChange={handleChange}
//             className="w-full border rounded px-3 py-2 mt-1"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-medium">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full border rounded px-3 py-2 mt-1"
//           />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div>
//             <label className="block text-gray-700 font-medium">City</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-gray-700 font-medium">State</label>
//             <input
//               type="text"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-gray-700 font-medium">Pincode</label>
//             <input
//               type="text"
//               name="pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               className="w-full border rounded px-3 py-2 mt-1"
//             />
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleUpdate}
//         disabled={loading}
//         className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg w-full"
//       >
//         {loading ? "Updating..." : "Update Profile"}
//       </button>
//     </motion.div>
//   );
// }







// src/components/recyclerDashboard/RecyclerProfile.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Upload } from "lucide-react";
import { recyclerAPI } from "../../services/authService";

export default function RecyclerProfile({ recycler }) {
  const [formData, setFormData] = useState({
    fullName: recycler?.fullName || "",
    shopName: recycler?.shopName || "",
    mobile: recycler?.mobile || "",
    city: recycler?.city || "",
    state: recycler?.state || "",
    pincode: recycler?.pincode || "",
    email: recycler?.email || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Avatar update API
      if (avatar) {
        await recyclerAPI.updateAvatar(avatar);
      }

      // Profile update API
      const res = await recyclerAPI.updateAccount(formData);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify({ ...recycler, ...formData }));

      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ Update failed! " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow space-y-6"
    >
      <h2 className="text-xl font-bold text-emerald-700 flex items-center">
        <User size={22} className="mr-2" /> My Profile
      </h2>

      {/* Avatar */}
      <div className="flex items-center space-x-5">
        <img
          className="w-20 h-20 rounded-full border object-cover"
          src={avatar ? URL.createObjectURL(avatar) : recycler?.avatar || "/default-avatar.png"}
          alt="Profile Avatar"
        />
        <label className="cursor-pointer text-sm text-green-600 hover:underline flex items-center space-x-1">
          <Upload size={16} />
          <span>Change Avatar</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </label>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {[
          { label: "Full Name", name: "fullName" },
          { label: "Shop Name", name: "shopName" },
          { label: "Mobile", name: "mobile" },
          { label: "City", name: "city" },
          { label: "State", name: "state" },
          { label: "Pincode", name: "pincode" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-gray-700 font-medium">{f.label}</label>
            <input
              type="text"
              name={f.name}
              value={formData[f.name]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1 focus:border-emerald-500"
            />
          </div>
        ))}

        {/* Email Fixed */}
        <div>
          <label className="block text-gray-700 font-medium">Email (Not Editable)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 text-gray-500"
          />
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full py-3 mt-4 rounded-xl text-white font-semibold transition 
          ${loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </motion.div>
  );
}