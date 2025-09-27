import React from 'react';
import { User } from 'lucide-react';

export default function UserProfile({ user }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <User className="mr-2 text-green-600" /> My Profile
      </h2>
      <div className="bg-white border rounded-lg p-6 shadow text-gray-700">
        <div className="flex items-center mb-4 space-x-4">
          <img
            className="w-16 h-16 rounded-full border"
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.fullName}
          />
          <div>
            <div className="font-semibold text-lg">{user?.fullName}</div>
            <div className="text-gray-500">{user?.email}</div>
          </div>
        </div>
        <ul>
          <li><strong>Username:</strong> {user?.username || '-'}</li>
          <li><strong>Phone:</strong> {user?.mobile || '-'}</li>
          <li><strong>City:</strong> {user?.city || '-'}</li>
          <li><strong>State:</strong> {user?.state || '-'}</li>
          <li><strong>Pincode:</strong> {user?.pincode || '-'}</li>
        </ul>
        {/* Add update profile button or form here in future */}
      </div>
    </div>
  );
}