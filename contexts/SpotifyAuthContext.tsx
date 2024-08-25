"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearSpotifyTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { clearSpotifyPlaylists } from '@/utils/redux/playlistSlice';

const SpotifyAuthContext = createContext<SpotifyAuthContextType | null>(null);

interface SpotifyAuthContextType {
    isSpotifyAuth: boolean;
    logoutSpotify: () => void;
    checkIfSpotifyAuthenticated: () => Promise<boolean>;
}

interface SpotifyAuthProviderProps {
    children: React.ReactNode;
}

export const SpotifyAuthProvider = ({ children }: SpotifyAuthProviderProps) => {
    const dispatch = useDispatch();
    const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
    const isSpotifyAuthenticated = !!spotifyTokens?.access_token;

    const [isSpotifyAuth, setIsSpotifyAuth] = useState<boolean>(isSpotifyAuthenticated);

    useEffect(() => {
        setIsSpotifyAuth(isSpotifyAuthenticated);
    }, [isSpotifyAuthenticated]);

    const handleLogoutSpotify = async () => {
        dispatch(clearSpotifyTokens());
        dispatch(clearSpotifyPlaylists());

        console.log("Successfully signed out from Spotify account");
        setIsSpotifyAuth(false);
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
        <SpotifyAuthContext.Provider
            value={{
                isSpotifyAuth,
                logoutSpotify: handleLogoutSpotify,
                checkIfSpotifyAuthenticated,
            }}
        >
            {children}
        </SpotifyAuthContext.Provider>
    );
};

export const useSpotifyAuth = () => useContext(SpotifyAuthContext) as SpotifyAuthContextType;