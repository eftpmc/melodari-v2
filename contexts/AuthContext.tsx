"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  isAuth: boolean;
  isGoogleAuth: boolean;
  isSpotifyAuth: boolean; // Example for Facebook auth
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens); // Example for Facebook tokens

  const isGoogleAuthenticated = !!googleTokens?.access_token;
  const isSpotifyAuthenticated = !!spotifyTokens?.access_token; // Example for Facebook authentication

  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(isGoogleAuthenticated);
  const [isSpotifyAuth, setIsSpotifyAuth] = useState<boolean>(isSpotifyAuthenticated); // Example for Facebook auth
  const [isAuth, setIsAuth] = useState<boolean>(isGoogleAuthenticated || isSpotifyAuthenticated);

  useEffect(() => {
    setIsGoogleAuth(isGoogleAuthenticated);
    setIsSpotifyAuth(isSpotifyAuthenticated); // Update Facebook auth status
    setIsAuth(isGoogleAuthenticated || isSpotifyAuthenticated); // Set isAuth based on any provider being authenticated
  }, [isGoogleAuthenticated, isSpotifyAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuth, isGoogleAuth, isSpotifyAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
