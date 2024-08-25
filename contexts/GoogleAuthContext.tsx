"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, setGoogleTokens } from '@/utils/redux/authSlice';
import { clearGooglePlaylists } from '@/utils/redux/playlistSlice';

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

interface GoogleAuthContextType {
    isGoogleAuth: boolean;
    logoutGoogle: () => void;
    checkIfGoogleAuthenticated: () => Promise<boolean>;
}

interface GoogleAuthProviderProps {
    children: React.ReactNode;
}

export const GoogleAuthProvider = ({ children }: GoogleAuthProviderProps) => {
    const dispatch = useDispatch();
    const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
    const isGoogleAuthenticated = !!googleTokens?.access_token;

    const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(isGoogleAuthenticated);

    useEffect(() => {
        setIsGoogleAuth(isGoogleAuthenticated);
    }, [isGoogleAuthenticated]);

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

    return (
        <GoogleAuthContext.Provider
            value={{
                isGoogleAuth,
                logoutGoogle: handleLogoutGoogle,
                checkIfGoogleAuthenticated,
            }}
        >
            {children}
        </GoogleAuthContext.Provider>
    );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext) as GoogleAuthContextType;
