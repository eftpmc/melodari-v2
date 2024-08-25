"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

const SettingsPage = () => {
  const { isGoogleAuth, isSpotifyAuth } = useAuth();
  const savedGooglePlaylists = useSelector((state: RootState) => Object.keys(state.playlists.google).length > 0);
  const savedSpotifyPlaylists = useSelector((state: RootState) => Object.keys(state.playlists.spotify).length > 0);

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
            className={`btn btn-sm ${
              isGoogleAuth ? "btn-success" : savedGooglePlaylists ? "btn-base-content" : "btn-error"
            }`}
          >
            {isGoogleAuth ? "Connected" : savedGooglePlaylists ? "View Playlists" : "Connect"}
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
            className={`btn btn-sm ${
              isSpotifyAuth ? "btn-success" : savedSpotifyPlaylists ? "btn-base-content" : "btn-error"
            }`}
          >
            {isSpotifyAuth ? "Connected" : savedSpotifyPlaylists ? "View Playlists" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
