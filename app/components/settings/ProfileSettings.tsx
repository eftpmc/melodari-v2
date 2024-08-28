"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSettings: React.FC = () => {
  const { username, avatarUrl, updateProfile } = useAuth();
  const [newUsername, setNewUsername] = useState(username || '');
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl || '');

  const handleProfileUpdate = async () => {
    await updateProfile(newUsername, newAvatarUrl);
    alert('Profile updated successfully');
  };

  return (
    <div className="mb-8">
      {/* Profile Preview */}
      <div className="flex items-start mb-6">
        <img
          src={newAvatarUrl || "/default-avatar.png"} // Use a default avatar if the URL is empty
          alt="Profile Avatar"
          className="w-24 h-24 rounded-md mr-4 object-cover"
        />
        <h2 className="text-xl font-semibold text-base-content">{newUsername || "Your Username"}</h2>
      </div>

      <label className="block text-base-content text-sm font-bold mb-2" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        type="text"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        className="input input-bordered w-full mb-4 text-base-content"
      />

      <label className="block text-base-content text-sm font-bold mb-2" htmlFor="avatarUrl">
        Avatar URL
      </label>
      <input
        id="avatarUrl"
        type="text"
        value={newAvatarUrl}
        onChange={(e) => setNewAvatarUrl(e.target.value)}
        className="input input-bordered w-full mb-4 text-base-content"
      />

      <button onClick={handleProfileUpdate} className="btn btn-primary text-base-100">
        Update Profile
      </button>
    </div>
  );
};

export default ProfileSettings;