// src/components/dashboard/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { User, Edit2, Save, X, Upload, Lock } from "lucide-react";
import { userAPI } from "../../services/authService";

export default function UserProfile({ user }) {
  const [localUser, setLocalUser] = useState(user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🔐 Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    AddressLine1: "",
    AddressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Sync data when user prop changes
  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        AddressLine1: user.AddressLine1 || "",
        AddressLine2: user.AddressLine2 || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode?.toString() || "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      setSaving(true);

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        AddressLine1: formData.AddressLine1.trim(),
        AddressLine2: formData.AddressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode,
      };

      const resp = await userAPI.updateAccount(payload);
      const updatedUser = resp.data || resp.user || resp;
      setLocalUser(updatedUser);
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSuccessMsg("");
    setError("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError("Please select an image first.");
      return;
    }
    setError("");
    setSuccessMsg("");

    try {
      setAvatarUploading(true);
      const resp = await userAPI.updateAvatar(avatarFile);
      const updatedUser = resp.data || resp.user || resp;
      setLocalUser(updatedUser);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccessMsg("Avatar updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  // 🔐 Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await userAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const currentAvatar =
    avatarPreview || localUser?.avatar || "/default-avatar.png";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <User className="mr-2 text-green-600" /> My Profile
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Edit2 size={16} /> Edit
          </button>
        ) : (
          <button
            onClick={() => {
              setFormData({
                fullName: localUser.fullName || "",
                email: localUser.email || "",
                AddressLine1: localUser.AddressLine1 || "",
                AddressLine2: localUser.AddressLine2 || "",
                city: localUser.city || "",
                state: localUser.state || "",
                pincode: localUser.pincode?.toString() || "",
              });
              setIsEditing(false);
              setError("");
              setSuccessMsg("");
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      {/* Global Messages */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {successMsg}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white border rounded-xl p-6 shadow text-gray-700 space-y-6">

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div className="flex items-center space-x-4">
            <img
              className="w-16 h-16 rounded-full border object-cover"
              src={currentAvatar}
              alt={localUser?.fullName || "User avatar"}
            />
            <div>
              <div className="font-semibold text-lg">
                {localUser?.fullName || "-"}
              </div>
              <div className="text-gray-500 text-sm">
                {localUser?.email || "-"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Username: {localUser?.username || "-"}
              </div>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-start gap-2">
            <label className="text-xs font-semibold text-gray-500">
              Change avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="text-xs"
            />
            <button
              type="button"
              onClick={handleAvatarUpload}
              disabled={avatarUploading || !avatarFile}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Upload size={14} />
              {avatarUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><strong>Full Name:</strong> {localUser?.fullName || "-"}</div>
            <div><strong>Email:</strong> {localUser?.email || "-"}</div>
            <div><strong>Mobile:</strong> {localUser?.mobile || "-"}</div>
            <div><strong>City:</strong> {localUser?.city || "-"}</div>
            <div><strong>State:</strong> {localUser?.state || "-"}</div>
            <div><strong>Pincode:</strong> {localUser?.pincode || "-"}</div>
            <div className="sm:col-span-2">
              <strong>Address Line 1:</strong> {localUser?.AddressLine1 || "-"}
            </div>
            <div className="sm:col-span-2">
              <strong>Address Line 2:</strong> {localUser?.AddressLine2 || "-"}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Mobile (not editable)
                </label>
                <input
                  type="text"
                  value={localUser?.mobile || ""}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="AddressLine1"
                  value={formData.AddressLine1}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="AddressLine2"
                  value={formData.AddressLine2}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  setSuccessMsg("");
                  setFormData({
                    fullName: localUser.fullName || "",
                    email: localUser.email || "",
                    AddressLine1: localUser.AddressLine1 || "",
                    AddressLine2: localUser.AddressLine2 || "",
                    city: localUser.city || "",
                    state: localUser.state || "",
                    pincode: localUser.pincode?.toString() || "",
                  });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <X size={16} /> Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* Change Password Section */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Lock size={20} className="text-green-600" /> Change Password
          </h3>

          {passwordError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded mb-2">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded mb-2">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}