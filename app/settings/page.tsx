"use client";

import React, { useState } from 'react';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { useGoogleContext } from '@/contexts/GoogleContext';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from "react-icons/si";

const SettingsPage = () => {
  const { isGoogleAuth, logoutGoogle, playlists: googlePlaylists, checkIfGoogleAuthenticated } = useGoogleContext();
  const { isSpotifyAuth, logoutSpotify, playlists: spotifyPlaylists, checkIfSpotifyAuthenticated } = useSpotifyContext();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSpotify, setLoadingSpotify] = useState(false);
  const [googleStatus, setGoogleStatus] = useState('');
  const [spotifyStatus, setSpotifyStatus] = useState('');

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

  React.useEffect(() => {
    if (isGoogleAuth) {
      checkGoogleAuthStatus();
    }

    if (isSpotifyAuth) {
      checkSpotifyAuthStatus();
    }
  }, [isGoogleAuth, isSpotifyAuth]);

  const googleAccountName = googlePlaylists[0]?.accountName || "YouTube Music";
  const spotifyAccountName = spotifyPlaylists[0]?.accountName || "Spotify";

  return (
    <div className="min-h-screen p-8 bg-base-300">
      <h2 className="text-2xl font-semibold mb-4 text-base-content">Connections</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Google Account Connection */}
        <div className="flex items-center p-4 bg-base-100 rounded-lg shadow">
          <SiYoutubemusic className="w-8 h-8 text-red-600 mr-4" />
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
            onClick={isGoogleAuth ? logoutGoogle : handleGoogleLogin}
            className={`btn btn-sm text-base-200 ${isGoogleAuth ? "btn-error" : googlePlaylists.length > 0 ? "btn-base-content" : "btn-success"
              }`}
            disabled={loadingGoogle}
          >
            {loadingGoogle
              ? "Connecting..."
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
            onClick={isSpotifyAuth ? logoutSpotify : handleSpotifyLogin}
            className={`btn btn-sm text-base-200 ${isSpotifyAuth ? "btn-error" : spotifyPlaylists.length > 0 ? "btn-warning" : "btn-success"
              }`}
            disabled={loadingSpotify}
          >
            {loadingSpotify
              ? "Connecting..."
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