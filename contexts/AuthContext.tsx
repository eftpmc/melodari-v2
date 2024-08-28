"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleContext } from './GoogleContext';
import { useSpotifyContext } from './SpotifyContext';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/utils/redux/authSlice';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
    isAuth: boolean;
    logout: () => void;
    supabaseUserId: string | null;
    avatarUrl: string | null;
    username: string | null;
    platforms: string[] | null;
    updateProfile: (newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => Promise<void>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const { isGoogleAuth, fetchGoogleUserId, logoutGoogle } = useGoogleContext();
    const { isSpotifyAuth, logoutSpotify } = useSpotifyContext();
    const supabase = createClient();
    const [isAuth, setIsAuth] = useState<boolean>(isGoogleAuth || isSpotifyAuth);
    const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [platforms, setPlatforms] = useState<string[] | null>(null);

    useEffect(() => {
        setIsAuth(isGoogleAuth || isSpotifyAuth);
    }, [isGoogleAuth, isSpotifyAuth]);

    useEffect(() => {
        if (isGoogleAuth) {
            fetchAndHandleSupabaseUser();
        }
    }, [isGoogleAuth]);

    const fetchAndHandleSupabaseUser = async () => {
        const googleUserId = await fetchGoogleUserId();
        if (googleUserId) {
            handleSupabaseUser(googleUserId);
        }
    };

    const handleSupabaseUser = async (googleUserId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, avatar_url, username, platforms')
                .eq('google_user_id', googleUserId)
                .single();

            if (error && error.code !== 'PGRST116') { 
                throw error;
            }

            if (data) {
                setSupabaseUserId(data.id);
                setAvatarUrl(data.avatar_url);
                setUsername(data.username);
                setPlatforms(data.platforms || []);
            } else {
                const { data: newUser, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ google_user_id: googleUserId })
                    .select('id, avatar_url, username, platforms')
                    .single();

                if (insertError) {
                    throw insertError;
                }

                setSupabaseUserId(newUser.id);
                setAvatarUrl(newUser.avatar_url);
                setUsername(newUser.username);
                setPlatforms(newUser.platforms || []);
            }
        } catch (error) {
            console.error('Error handling Supabase user:', error);
        }
    };

    const updateProfile = async (newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => {
        try {
            console.log('Updating profile with:', {
                newUsername,
                newAvatarUrl,
                newPlatforms,
                supabaseUserId,
            });
    
            const { data, error } = await supabase
                .from('profiles')
                .update({ username: newUsername, avatar_url: newAvatarUrl, platforms: newPlatforms })
                .eq('id', supabaseUserId)
                .select('username, avatar_url, platforms');
    
            if (error) {
                console.error('Supabase error during update:', error);
                throw error;
            }
    
            if (!data || data.length === 0) {
                console.error('No data returned from Supabase update.');
                return; // Early return if no data is available
            }
    
            console.log('Updated profile data:', data);
    
            const updatedProfile = data[0];
            setUsername(updatedProfile.username);
            setAvatarUrl(updatedProfile.avatar_url);
            setPlatforms(updatedProfile.platforms);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };    

    const handleLogout = () => {
        logoutSpotify();
        logoutGoogle();
        logout();
        setSupabaseUserId(null);
        setAvatarUrl(null);
        setUsername(null);
        setPlatforms(null);
    };

    return (
        <AuthContext.Provider value={{ isAuth, logout: handleLogout, supabaseUserId, avatarUrl, username, platforms, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;