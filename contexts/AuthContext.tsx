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
    getPlayCount: (playlistId: string) => Promise<number>;
    incrementPlayCount: (playlistId: string) => Promise<void>;
    friendsList: any[];
    friendRequests: any[];
    sendFriendRequest: (username: string) => Promise<boolean>;
    handleAcceptFriendRequest: (requestId: string, senderId: string) => Promise<void>;
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
    const [playCount, setPlayCount] = useState<{ [key: string]: number }>({});
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);

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
            await handleSupabaseUser(googleUserId);
            await fetchFriends();
            await fetchFriendRequests();
        }
    };

    const handleSupabaseUser = async (googleUserId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, avatar_url, username, platforms, play_count, friends')
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
                setPlayCount(data.play_count || {});
                setFriendsList(data.friends || []);
            } else {
                const { data: newUser, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ google_user_id: googleUserId })
                    .select('id, avatar_url, username, platforms, play_count, friends')
                    .single();

                if (insertError) {
                    throw insertError;
                }

                setSupabaseUserId(newUser.id);
                setAvatarUrl(newUser.avatar_url);
                setUsername(newUser.username);
                setPlatforms(newUser.platforms || []);
                setPlayCount(newUser.play_count || {});
                setFriendsList(newUser.friends || []);
            }
        } catch (error) {
            console.error('Error handling Supabase user:', error);
        }
    };

    const fetchFriends = async () => {
        if (!supabaseUserId) return;

        try {
            const { data: userProfile, error } = await supabase
                .from('profiles')
                .select('friends')
                .eq('id', supabaseUserId)
                .single();

            if (error) throw error;

            if (userProfile && userProfile.friends.length > 0) {
                const { data: friendProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, platforms')
                    .in('id', userProfile.friends);

                if (profilesError) throw profilesError;

                setFriendsList(friendProfiles);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async () => {
        if (!supabaseUserId) return;

        try {
            const { data: requests, error } = await supabase
                .from('friend_requests')
                .select(`
                    id,
                    sender_id,
                    profiles:profiles!sender_id (username, avatar_url)
                `)
                .eq('receiver_id', supabaseUserId)
                .eq('status', 'pending');

            if (error) throw error;

            setFriendRequests(requests);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const sendFriendRequest = async (username: string) => {
        try {
            const { data: friendProfile, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, platforms')
                .eq('username', username)
                .single();

            if (error || !friendProfile) {
                return false;
            }

            const { error: insertError } = await supabase
                .from('friend_requests')
                .insert({ sender_id: supabaseUserId, receiver_id: friendProfile.id, status: 'pending' });

            if (insertError) throw insertError;

            return true;
        } catch (error) {
            console.error('Error sending friend request:', error);
            return false;
        }
    };

    const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
        try {
            const { data: userProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('friends')
                .eq('id', supabaseUserId)
                .single();

            if (fetchError) throw fetchError;

            const currentFriends = Array.isArray(userProfile.friends) ? userProfile.friends : [];
            const updatedFriends = [...currentFriends, senderId];

            await supabase.from('profiles').update({ friends: updatedFriends }).eq('id', supabaseUserId);
            await supabase.from('profiles').update({ friends: updatedFriends }).eq('id', senderId);

            await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);

            setFriendsList([...friendsList, { id: senderId, ...userProfile }]);
            setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const updateProfile = async (newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => {
        try {
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
    
            const updatedProfile = data[0];
            setUsername(updatedProfile.username);
            setAvatarUrl(updatedProfile.avatar_url);
            setPlatforms(updatedProfile.platforms);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };    

    const getPlayCount = async (playlistId: string): Promise<number> => {
        return playCount[playlistId] || 0;
    };

    const incrementPlayCount = async (playlistId: string): Promise<void> => {
        try {
            const updatedPlayCounts = {
                ...playCount,
                [playlistId]: (playCount[playlistId] || 0) + 1,
            };
            const { error } = await supabase
                .from('profiles')
                .update({ play_count: updatedPlayCounts })
                .eq('id', supabaseUserId);

            if (error) {
                throw error;
            }

            setPlayCount(updatedPlayCounts);
        } catch (error) {
            console.error('Error incrementing play count:', error);
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
        setPlayCount({});
        setFriendsList([]);
        setFriendRequests([]);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuth,
                logout: handleLogout,
                supabaseUserId,
                avatarUrl,
                username,
                platforms,
                updateProfile,
                getPlayCount,
                incrementPlayCount,
                friendsList,
                friendRequests,
                sendFriendRequest,
                handleAcceptFriendRequest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;