"use client";

import React, { useState, useEffect } from 'react';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { useGoogleContext } from '@/contexts/GoogleContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpotify, FaGoogle } from 'react-icons/fa';
import { SiYoutubemusic } from "react-icons/si";

const SettingsPage = () => {
  const { isGoogleAuth, logoutGoogle, playlists: googlePlaylists, checkIfGoogleAuthenticated } = useGoogleContext();
  const { isSpotifyAuth, logoutSpotify, playlists: spotifyPlaylists, checkIfSpotifyAuthenticated } = useSpotifyContext();
  const { username, avatarUrl, updateProfile } = useAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSpotify, setLoadingSpotify] = useState(false);
  const [googleStatus, setGoogleStatus] = useState('');
  const [spotifyStatus, setSpotifyStatus] = useState('');

  const [newUsername, setNewUsername] = useState(username || '');
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl || '');

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl;
      }
    } catch (error) {
      console.error("Error during Google authentication", error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSpotifyLogin = async () => {
    setLoadingSpotify(true);
    try {
      const res = await fetch("/api/auth/spotify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl;
      }
    } catch (error) {
      console.error("Error during Spotify authentication", error);
    } finally {
      setLoadingSpotify(false);
    }
  };

  const checkGoogleAuthStatus = async () => {
    const authenticated = await checkIfGoogleAuthenticated();
    setGoogleStatus(authenticated ? "Authenticated" : "Re-authentication required");
  };

  const checkSpotifyAuthStatus = async () => {
    const authenticated = await checkIfSpotifyAuthenticated();
    setSpotifyStatus(authenticated ? "Authenticated" : "Re-authentication required");
  };

  useEffect(() => {
    if (isGoogleAuth) {
      checkGoogleAuthStatus();
    }

    if (isSpotifyAuth) {
      checkSpotifyAuthStatus();
    }
  }, [isGoogleAuth, isSpotifyAuth]);

  const googleAccountName = googlePlaylists[0]?.accountName || "Google";
  const spotifyAccountName = spotifyPlaylists[0]?.accountName || "Spotify";

  const handleProfileUpdate = async () => {
    await updateProfile(newUsername, newAvatarUrl);
    alert('Profile updated successfully');
  };

  return (
    <div className="min-h-screen p-8 bg-base-300">
      <h2 className="text-2xl font-semibold mb-4 text-base-content">Profile Settings</h2>

      <div className="mb-8">
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

        <button onClick={handleProfileUpdate} className="btn btn-primary">Update Profile</button>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-base-content">Connections</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Google Account Connection */}
        <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
          <FaGoogle className="w-8 h-8 text-red-600 mr-4" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content">{googleAccountName}</h3>
            <p className="text-sm text-gray-500">
              {isGoogleAuth
                ? googleStatus
                : googlePlaylists.length > 0
                  ? "Not Connected (Playlists available)"
                  : "Not Connected"}
            </p>
          </div>
          <button
            onClick={
              googleStatus === "Re-authentication required"
                ? handleGoogleLogin
                : isGoogleAuth
                ? logoutGoogle
                : handleGoogleLogin
            }
            className={`btn btn-sm text-base-200 ${googleStatus === "Re-authentication required"
                ? "btn-warning"
                : isGoogleAuth
                ? "btn-error"
                : "btn-success"
              }`}
            disabled={loadingGoogle}
          >
            {loadingGoogle
              ? "Connecting..."
              : googleStatus === "Re-authentication required"
                ? "Refresh"
                : isGoogleAuth
                  ? "Disconnect"
                  : "Connect"}
          </button>
        </div>

        {/* Spotify Account Connection */}
        <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
          <FaSpotify className="w-8 h-8 text-green-600 mr-4" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content">{spotifyAccountName}</h3>
            <p className="text-sm text-gray-500">
              {isSpotifyAuth
                ? spotifyStatus
                : spotifyPlaylists.length > 0
                  ? "Not Connected (Playlists available)"
                  : "Not Connected"}
            </p>
          </div>
          <button
            onClick={
              spotifyStatus === "Re-authentication required"
                ? handleSpotifyLogin
                : isSpotifyAuth
                ? logoutSpotify
                : handleSpotifyLogin
            }
            className={`btn btn-sm text-base-200 ${spotifyStatus === "Re-authentication required"
                ? "btn-warning"
                : isSpotifyAuth
                ? "btn-error"
                : "btn-success"
              }`}
            disabled={loadingSpotify}
          >
            {loadingSpotify
              ? "Connecting..."
              : spotifyStatus === "Re-authentication required"
                ? "Refresh"
                : isSpotifyAuth
                  ? "Disconnect"
                  : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;