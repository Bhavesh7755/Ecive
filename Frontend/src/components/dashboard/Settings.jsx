import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <SettingsIcon className="mr-2 text-gray-600" /> Settings
      </h2>
      <div className="bg-white border p-8 rounded-lg text-gray-600 shadow">
        <p>
          Settings page is under construction.<br />
          Customize your account and dashboard settings here in the future.
        </p>
      </div>
    </div>
  );
}