import React from 'react';
import { Package } from 'lucide-react';

export default function MyPosts() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Package className="mr-2 text-blue-600" /> My Posts
      </h2>
      <div className="bg-white border p-8 rounded-lg text-gray-600 shadow">
        {/* Insert your post listing logic here! */}
        <p>
          You have not implemented the post list yet.<br />
          This is where your posted products will appear in the dashboard.
        </p>
      </div>
    </div>
  );
}