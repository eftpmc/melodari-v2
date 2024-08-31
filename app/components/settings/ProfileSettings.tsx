"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { FaSpotify, FaGoogle } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

const platformsData = [
  { id: 'google', name: 'Youtube Music', icon: <SiYoutubemusic className="text-red-600" /> },
  { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="text-green-600" /> },
  // Add more platforms as needed
];

const ProfileSettings: React.FC = () => {
  const { username, avatarUrl, platforms, updateProfile } = useProfile();
  const [newUsername, setNewUsername] = useState(username || '');
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms || []);

  const handleProfileUpdate = async () => {
    await updateProfile(newUsername, newAvatarUrl, selectedPlatforms);
    alert('Profile updated successfully');
  };

  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="mb-8">
      {/* Profile Preview */}
      <div className="flex items-start mb-6">
        <img
          src={newAvatarUrl || "/default-avatar.png"}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-md mr-4 object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-base-content">{newUsername || "username"}</h2>
          <div className="flex mt-2 space-x-2">
            {selectedPlatforms.map((platformId) => {
              const platform = platformsData.find((p) => p.id === platformId);
              return platform ? platform.icon : null;
            })}
          </div>
        </div>
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

      <div className="mb-4">
        <h3 className="text-base-content text-sm font-bold mb-2">Select Platforms</h3>
        <div className="flex space-x-4">
          {platformsData.map((platform) => (
            <button
              key={platform.id}
              onClick={() => togglePlatformSelection(platform.id)}
              className={`btn btn-sm ${selectedPlatforms.includes(platform.id) ? 'btn-primary text-base-100' : 'btn-outline'}`}
            >
              {platform.icon}
              <span className="ml-2">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleProfileUpdate} className="btn btn-primary text-base-100">
        Update Profile
      </button>
    </div>
  );
};

export default ProfileSettings;
