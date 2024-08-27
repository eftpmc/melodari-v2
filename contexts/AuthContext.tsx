"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleContext } from './GoogleContext';
import { useSpotifyContext } from './SpotifyContext';
import { createClient } from '@/utils/supabase/client';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
    isAuth: boolean;
    logout: () => void;
    supabaseUserId: string | null;
    avatarUrl: string | null;
    username: string | null;
    updateProfile: (newUsername: string, newAvatarUrl: string) => Promise<void>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const { isGoogleAuth, fetchGoogleUserId } = useGoogleContext();
    const { isSpotifyAuth, logoutSpotify } = useSpotifyContext();
    const supabase = createClient();
    const [isAuth, setIsAuth] = useState<boolean>(isGoogleAuth || isSpotifyAuth);
    const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

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
                .select('id, avatar_url, username')
                .eq('google_user_id', googleUserId)
                .single();

            if (error && error.code !== 'PGRST116') { 
                throw error;
            }

            if (data) {
                setSupabaseUserId(data.id);
                setAvatarUrl(data.avatar_url);
                setUsername(data.username);
            } else {
                const { data: newUser, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ google_user_id: googleUserId })
                    .select('id, avatar_url, username')
                    .single();

                if (insertError) {
                    throw insertError;
                }

                setSupabaseUserId(newUser.id);
                setAvatarUrl(newUser.avatar_url);
                setUsername(newUser.username);
            }
        } catch (error) {
            console.error('Error handling Supabase user:', error);
        }
    };

    const updateProfile = async (newUsername: string, newAvatarUrl: string) => {
        try {
            console.log('Updating profile with:', {
                newUsername,
                newAvatarUrl,
                supabaseUserId,
            });
    
            const { data, error } = await supabase
                .from('profiles')
                .update({ username: newUsername, avatar_url: newAvatarUrl })
                .eq('id', supabaseUserId)
                .select('username, avatar_url');
    
            if (error) {
                console.error('Supabase error during update:', error);
                throw error;
            }
    
            if (!data || data.length === 0) {
                console.error('No data returned from Supabase update.');
                return; // Early return if no data is available
            }
    
            console.log('Updated profile data:', data);
    
            // Assuming the data structure is an array with one object
            const updatedProfile = data[0];
            setUsername(updatedProfile.username);
            setAvatarUrl(updatedProfile.avatar_url);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };    

    const handleLogout = () => {
        logoutSpotify();
        setSupabaseUserId(null);
        setAvatarUrl(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ isAuth, logout: handleLogout, supabaseUserId, avatarUrl, username, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;