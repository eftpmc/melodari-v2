"use client";

import React, { useState } from 'react';
import { useSpotifyAuth } from '@/contexts/SpotifyAuthContext';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

const SettingsPage = () => {
  const {isGoogleAuth, logoutGoogle} = useGoogleAuth();
  const {isSpotifyAuth, logoutSpotify} = useSpotifyAuth();
  const savedGooglePlaylists = useSelector((state: RootState) => state.playlists.google);
  const savedSpotifyPlaylists = useSelector((state: RootState) => state.playlists.spotify);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

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

  return (
    <div className="min-h-screen p-8 bg-base-300">
      <h2 className="text-2xl font-semibold mb-4 text-base-content">Connections</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* YouTube Music Connection */}
        <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
          <FaYoutube className="w-8 h-8 text-red-600 mr-4" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content">YouTube Music</h3>
            <p className="text-sm text-gray-500">
              {isGoogleAuth
                ? "Connected"
                : savedGooglePlaylists
                  ? "Not Connected (Playlists available)"
                  : "Not Connected"}
            </p>
          </div>
          <button
            onClick={isGoogleAuth ? logoutGoogle : handleGoogleLogin}
            className={`btn btn-sm ${isGoogleAuth ? "btn-error" : savedGooglePlaylists ? "btn-warning" : "btn-success"
              }`}
            disabled={loadingGoogle}
          >
            {loadingGoogle
              ? "Connecting..."
              : isGoogleAuth
                ? "Disconnect"
                : "Update Playlists"}
          </button>
        </div>

        {/* Spotify Connection */}
        <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
          <FaSpotify className="w-8 h-8 text-green-600 mr-4" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content">Spotify</h3>
            <p className="text-sm text-gray-500">
              {isSpotifyAuth
                ? "Connected"
                : savedSpotifyPlaylists
                  ? "Not Connected (Playlists available)"
                  : "Not Connected"}
            </p>
          </div>
          <button
            onClick={isSpotifyAuth ? logoutSpotify : handleSpotifyLogin}
            className={`btn btn-sm ${isSpotifyAuth ? "btn-error" : savedSpotifyPlaylists ? "btn-warning" : "btn-success"
              }`}
            disabled={loadingSpotify}
          >
            {loadingSpotify
              ? "Connecting..."
              : isSpotifyAuth
                ? "Disconnect"
                : "Update Playlists"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
