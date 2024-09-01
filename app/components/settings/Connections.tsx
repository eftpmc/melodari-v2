"use client";

import React from 'react';
import { useSpotifyAuthContext } from '@/contexts/spotify/SpotifyAuthContext';
import { useGoogleAuthContext } from '@/contexts/google/GoogleAuthContext';
import { FaSpotify, FaGoogle } from 'react-icons/fa';
import ConnectionCard from './ConnectionCard';

const Connections: React.FC<{
  onDisconnectClick: (account: "google" | "spotify") => void;
}> = ({ onDisconnectClick }) => {
  const { isGoogleAuth, checkIfGoogleAuthenticated, logoutGoogle } = useGoogleAuthContext();
  const { isSpotifyAuth, checkIfSpotifyAuthenticated, logoutSpotify } = useSpotifyAuthContext();

  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [loadingSpotify, setLoadingSpotify] = React.useState(false);
  const [googleStatus, setGoogleStatus] = React.useState('');
  const [spotifyStatus, setSpotifyStatus] = React.useState('');

  React.useEffect(() => {
    if (isGoogleAuth) {
      checkGoogleAuthStatus();
    } else {
      setGoogleStatus('Not Connected');
    }

    if (isSpotifyAuth) {
      checkSpotifyAuthStatus();
    }
  }, [isGoogleAuth, isSpotifyAuth]);

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

  const googleAccountName = "Google";
  const spotifyAccountName = "Spotify";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Google Account Connection */}
      <ConnectionCard
        icon={<FaGoogle className="w-8 h-8 text-red-600 mr-4" />}
        accountName={googleAccountName}
        isConnected={isGoogleAuth}
        status={googleStatus}
        onConnect={handleGoogleLogin}
        onDisconnect={() => onDisconnectClick("google")}
        loading={loadingGoogle}
      />

      {/* Spotify Account Connection */}
      <ConnectionCard
        icon={<FaSpotify className="w-8 h-8 text-green-600 mr-4" />}
        accountName={spotifyAccountName}
        isConnected={isSpotifyAuth}
        status={spotifyStatus}
        onConnect={handleSpotifyLogin}
        onDisconnect={() => onDisconnectClick("spotify")}
        loading={loadingSpotify}
      />
    </div>
  );
};

export default Connections;