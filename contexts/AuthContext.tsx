"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleContext, GoogleProvider } from './GoogleContext';
import { useSpotifyContext, SpotifyProvider } from './SpotifyContext';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
    isAuth: boolean;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const { isGoogleAuth, logoutGoogle, checkIfGoogleAuthenticated } = useGoogleContext();
    const { isSpotifyAuth, logoutSpotify, checkIfSpotifyAuthenticated } = useSpotifyContext();
    const [isAuth, setIsAuth] = useState<boolean>(isGoogleAuth || isSpotifyAuth);

    useEffect(() => {
        setIsAuth(isGoogleAuth || isSpotifyAuth);
    }, [isGoogleAuth, isSpotifyAuth]);

    const handleLogout = () => {
        logoutGoogle();
        logoutSpotify();
    };

    return (
        <AuthContext.Provider value={{ isAuth, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
