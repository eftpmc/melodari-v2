"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, setGoogleTokens } from '@/utils/redux/authSlice';
import { Tokens } from '@/types';
import { googleApi } from '@/utils/google/api';

interface GoogleAuthContextType {
    isGoogleAuth: boolean;
    googleUserId: string | null;
    googleTokens: Tokens | null;
    logoutGoogle: () => void;
    checkIfGoogleAuthenticated: () => Promise<boolean>;
    refreshGoogleTokens: () => Promise<boolean>;
    fetchGoogleUserId: () => Promise<string | null>;
}

interface GoogleAuthProviderProps {
    children: React.ReactNode;
}

export const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

export const GoogleAuthProvider = ({ children }: GoogleAuthProviderProps) => {
    const dispatch = useDispatch();
    const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
    const isGoogleAuthenticated = !!googleTokens?.access_token;

    const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(isGoogleAuthenticated);
    const [googleUserId, setGoogleUserId] = useState<string | null>(null);

    useEffect(() => {
        setIsGoogleAuth(isGoogleAuthenticated);
    }, [isGoogleAuthenticated]);

    useEffect(() => {
        if (isGoogleAuth && googleTokens) {
            fetchGoogleUserId();
        }
    }, [isGoogleAuth, googleTokens]);

    const fetchGoogleUserId = async (): Promise<string | null> => {
        if (googleTokens?.access_token) {
            try {
                const userInfo = await googleApi.getCurrentUserProfile(googleTokens.access_token);
                setGoogleUserId(userInfo.id);
                return userInfo.id;
            } catch (error) {
                console.error('Error fetching Google user ID:', error);
                return null;
            }
        }
        return null;
    };

    const handleLogoutGoogle = async () => {
        dispatch(clearGoogleTokens());

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
                const newTokens = await googleApi.refreshToken(googleTokens.refresh_token);
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
                await googleApi.getCurrentUserProfile(googleTokens.access_token);
                return true;
            } catch (error) {
                if (error instanceof Error && error.message.includes('401')) {
                    console.log('Access token expired, attempting to refresh...');
                    const refreshed = await refreshGoogleTokens();
                    if (refreshed) {
                        return await checkIfGoogleAuthenticated(); // Retry after refreshing tokens
                    }
                }
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
                googleUserId,
                googleTokens,
                logoutGoogle: handleLogoutGoogle,
                checkIfGoogleAuthenticated,
                refreshGoogleTokens,
                fetchGoogleUserId,
            }}
        >
            {children}
        </GoogleAuthContext.Provider>
    );
};

export const useGoogleAuthContext = () => useContext(GoogleAuthContext) as GoogleAuthContextType;