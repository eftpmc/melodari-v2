// SpotifyAuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearSpotifyTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { Tokens } from '@/types';
import { spotifyApi } from '@/utils/spotify/api';

interface SpotifyAuthContextType {
    isSpotifyAuth: boolean;
    spotifyUserId: string | null;
    spotifyTokens: Tokens | null;
    logoutSpotify: () => void;
    checkIfSpotifyAuthenticated: () => Promise<boolean>;
    refreshSpotifyTokens: () => Promise<boolean>;
    fetchSpotifyUserId: () => Promise<string | null>;
}

interface SpotifyAuthProviderProps {
    children: React.ReactNode;
}

export const SpotifyAuthContext = createContext<SpotifyAuthContextType | null>(null);

export const SpotifyAuthProvider = ({ children }: SpotifyAuthProviderProps) => {
    const dispatch = useDispatch();
    const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
    const isSpotifyAuthenticated = !!spotifyTokens?.access_token;

    const [isSpotifyAuth, setIsSpotifyAuth] = useState<boolean>(isSpotifyAuthenticated);
    const [spotifyUserId, setSpotifyUserId] = useState<string | null>(null);

    useEffect(() => {
        setIsSpotifyAuth(isSpotifyAuthenticated);
    }, [isSpotifyAuthenticated]);

    useEffect(() => {
        if (isSpotifyAuth && spotifyTokens) {
            fetchSpotifyUserId();
        }
    }, [isSpotifyAuth, spotifyTokens]);

    const fetchSpotifyUserId = async (): Promise<string | null> => {
        if (spotifyTokens?.access_token) {
            try {
                const userInfo = await spotifyApi.getCurrentUserProfile(spotifyTokens.access_token);
                setSpotifyUserId(userInfo.id);
                return userInfo.id;
            } catch (error) {
                console.error('Error fetching Spotify user ID:', error);
                return null;
            }
        }
        return null;
    };

    const handleLogoutSpotify = async () => {
        dispatch(clearSpotifyTokens());

        if (spotifyTokens?.access_token) {
            try {
                await fetch(`https://accounts.spotify.com/api/token/revoke`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `token=${spotifyTokens.access_token}`,
                });
                console.log("Successfully signed out from Spotify account");
            } catch (error) {
                console.error("Error revoking Spotify token:", error);
            }
        }

        setIsSpotifyAuth(false);
    };

    const refreshSpotifyTokens = async (): Promise<boolean> => {
        if (spotifyTokens?.refresh_token) {
            try {
                const newTokens = await spotifyApi.refreshToken(spotifyTokens.refresh_token);
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
                const userInfo = await spotifyApi.getCurrentUserProfile(spotifyTokens.access_token);
                return true;
            } catch (error) {
                if (error instanceof Error && error.message.includes('401')) {
                    const refreshed = await refreshSpotifyTokens();
                    return refreshed;
                }
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
                spotifyUserId,
                spotifyTokens,
                logoutSpotify: handleLogoutSpotify,
                checkIfSpotifyAuthenticated,
                refreshSpotifyTokens,
                fetchSpotifyUserId,
            }}
        >
            {children}
        </SpotifyAuthContext.Provider>
    );
};

export const useSpotifyAuthContext = () => useContext(SpotifyAuthContext) as SpotifyAuthContextType;