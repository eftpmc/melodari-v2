"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, clearSpotifyTokens, setGoogleTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { clearGooglePlaylists, clearSpotifyPlaylists } from '@/utils/redux/playlistSlice';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  isAuth: boolean;
  isGoogleAuth: boolean;
  isSpotifyAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  logoutGoogle: () => void;
  logoutSpotify: () => void;
  checkIfGoogleAuthenticated: () => Promise<boolean>;
  checkIfSpotifyAuthenticated: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);

  const isGoogleAuthenticated = !!googleTokens?.access_token;
  const isSpotifyAuthenticated = !!spotifyTokens?.access_token;

  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(isGoogleAuthenticated);
  const [isSpotifyAuth, setIsSpotifyAuth] = useState<boolean>(isSpotifyAuthenticated);
  const [isAuth, setIsAuth] = useState<boolean>(isGoogleAuthenticated || isSpotifyAuthenticated);

  useEffect(() => {
    setIsGoogleAuth(isGoogleAuthenticated);
    setIsSpotifyAuth(isSpotifyAuthenticated);
    setIsAuth(isGoogleAuthenticated || isSpotifyAuthenticated);
  }, [isGoogleAuthenticated, isSpotifyAuthenticated]);

  const handleLogoutGoogle = async () => {
    dispatch(clearGoogleTokens());
    dispatch(clearGooglePlaylists());

    if (googleTokens?.access_token) {
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleTokens.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        console.log("Successfully signed out from Google account");
      } catch (error) {
        console.error("Error revoking Google token:", error);
      }
    }

    setIsGoogleAuth(false);
    setIsAuth(isSpotifyAuth);
  };

  const handleLogoutSpotify = async () => {
    dispatch(clearSpotifyTokens());
    dispatch(clearSpotifyPlaylists());

    console.log("Successfully signed out from Spotify account");
    setIsSpotifyAuth(false);
    setIsAuth(isGoogleAuth);
  };

  const handleLogout = () => {
    handleLogoutGoogle();
    handleLogoutSpotify();
  };

  const refreshGoogleTokens = async (): Promise<boolean> => {
    if (googleTokens?.refresh_token) {
      try {
        const response = await fetch('/api/auth/google/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: googleTokens.refresh_token }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh Google tokens');
        }

        const newTokens = await response.json();
        dispatch(setGoogleTokens(newTokens));
        return true;
      } catch (error) {
        console.error('Error refreshing Google tokens:', error);
        return false;
      }
    }
    return false;
  };

  const refreshSpotifyTokens = async (): Promise<boolean> => {
    if (spotifyTokens?.refresh_token) {
      try {
        const response = await fetch('/api/auth/spotify/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: spotifyTokens.refresh_token }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh Spotify tokens');
        }

        const newTokens = await response.json();
        dispatch(setSpotifyTokens(newTokens));
        return true;
      } catch (error) {
        console.error('Error refreshing Spotify tokens:', error);
        return false;
      }
    }
    return false;
  };

  const checkIfGoogleAuthenticated = async (): Promise<boolean> => {
    if (googleTokens?.access_token) {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleTokens.access_token);
        const data = await res.json();

        if (data.error) {
          const refreshed = await refreshGoogleTokens();
          if (refreshed) {
            return true;
          } else {
            throw new Error('Google token refresh failed');
          }
        }

        return data.expires_in > 0; // Check if the token is still valid
      } catch (error) {
        console.error('Error checking Google authentication:', error);
        return false;
      }
    }
    return false;
  };

  const checkIfSpotifyAuthenticated = async (): Promise<boolean> => {
    if (spotifyTokens?.access_token) {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${spotifyTokens.access_token}`,
          },
        });

        if (!res.ok) {
          const refreshed = await refreshSpotifyTokens();
          if (refreshed) {
            return true;
          } else {
            throw new Error('Spotify token refresh failed');
          }
        }

        return res.ok; // If response is OK, the token is still valid
      } catch (error) {
        console.error('Error checking Spotify authentication:', error);
        return false;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        isGoogleAuth,
        isSpotifyAuth,
        setIsAuth,
        logout: handleLogout,
        logoutGoogle: handleLogoutGoogle,
        logoutSpotify: handleLogoutSpotify,
        checkIfGoogleAuthenticated,
        checkIfSpotifyAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
