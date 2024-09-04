"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuthContext } from './google/GoogleAuthContext';
import { useSpotifyAuthContext } from './spotify/SpotifyAuthContext';
import { logout as reduxLogout } from '@/utils/redux/authSlice';
import { useDispatch } from 'react-redux';

interface AuthContextType {
  isAuthenticated: boolean;
  googleUserId: string | null;
  logout: () => void;
  loading: boolean;
  getAuthorizeUrl: (service: 'google' | 'spotify') => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGoogleAuth, fetchGoogleUserId, logoutGoogle } = useGoogleAuthContext();
  const { isSpotifyAuth, logoutSpotify } = useSpotifyAuthContext();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [googleUserId, setGoogleUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsAuthenticated(isGoogleAuth || isSpotifyAuth);
    setLoading(false);
  }, [isGoogleAuth, isSpotifyAuth]);

  useEffect(() => {
    if (isGoogleAuth) {
      fetchAndSetGoogleUserId();
    }
  }, [isGoogleAuth]);

  const fetchAndSetGoogleUserId = async () => {
    const userId = await fetchGoogleUserId();
    setGoogleUserId(userId);
  };

  const handleLogout = () => {
    logoutSpotify();
    logoutGoogle();
    dispatch(reduxLogout());
    setGoogleUserId(null);
  };

  const getAuthorizeUrl = async (service: 'google' | 'spotify'): Promise<string | null> => {
    try {
      const res = await fetch(`/api/auth/${service}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      return data.authorizeUrl || null;
    } catch (error) {
      console.error(`Error getting ${service} authorize URL:`, error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        googleUserId,
        logout: handleLogout,
        loading,
        getAuthorizeUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isAuthenticated: false,
      googleUserId: null,
      logout: () => {},
      loading: true,
      getAuthorizeUrl: async () => null,
    };
  }
  return context;
};