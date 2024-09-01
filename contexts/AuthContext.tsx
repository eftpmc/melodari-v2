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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isGoogleAuth, fetchGoogleUserId, logoutGoogle } = useGoogleAuthContext();
    const { isSpotifyAuth, logoutSpotify } = useSpotifyAuthContext();
    const dispatch = useDispatch();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isGoogleAuth || isSpotifyAuth);
    const [googleUserId, setGoogleUserId] = useState<string | null>(null);

    useEffect(() => {
        setIsAuthenticated(isGoogleAuth || isSpotifyAuth);
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

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                googleUserId,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};