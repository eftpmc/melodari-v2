"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseOperations } from '@/utils/supabase/operations';
import { User, FriendRequest } from '@/types';
import { useAuth } from './AuthContext';

interface ProfileContextType {
    supabaseUserId: string | null;
    avatarUrl: string | null;
    username: string | null;
    googlePlaylists: any;
    spotifyPlaylists: any;
    updateGooglePlaylists: (newGooglePlaylists: any) => Promise<void>;
    updateSpotifyPlaylists: (newSpotifyPlaylists: any) => Promise<void>;
    platforms: string[];
    playCount: { [key: string]: number };
    friendsList: User[];
    friendRequests: FriendRequest[];
    updateProfile: (newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => Promise<void>;
    getPlayCount: (playlistId: string) => Promise<number>;
    incrementPlayCount: (playlistId: string) => Promise<void>;
    sendFriendRequest: (username: string) => Promise<boolean>;
    handleAcceptFriendRequest: (requestId: string, senderId: string) => Promise<void>;
    handleDeclineFriendRequest: (requestId: string) => Promise<void>;
    fetchUserProfile: (googleUserId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, googleUserId } = useAuth();
    const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [googlePlaylists, setGooglePlaylists] = useState<any>({});
    const [spotifyPlaylists, setSpotifyPlaylists] = useState<any>({});
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [playCount, setPlayCount] = useState<{ [key: string]: number }>({});
    const [friendsList, setFriendsList] = useState<User[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        if (isAuthenticated && googleUserId) {
            fetchUserProfile(googleUserId);
        }
    }, [isAuthenticated, googleUserId]);

    const fetchUserProfile = async (googleUserId: string) => {
        try {
            let data = await supabaseOperations.getUserProfile(googleUserId);

            console.log(data)

            if (!data) {
                data = await supabaseOperations.createUserProfile(googleUserId);
            }

            setSupabaseUserId(data.id);
            setAvatarUrl(data.avatar_url);
            setUsername(data.username);
            setPlatforms(data.platforms || []);
            setPlayCount(data.play_count || {});
            setGooglePlaylists(data.google_playlists || {});
            setSpotifyPlaylists(data.spotify_playlists || {});


            await fetchFriends(data.id);
            await fetchFriendRequests(data.id);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };


    const updateGooglePlaylists = async (newGooglePlaylists: any) => {
        if (!supabaseUserId) return;

        try {
            const updatedGooglePlaylists = await supabaseOperations.updateGooglePlaylists(supabaseUserId, newGooglePlaylists);
            setGooglePlaylists(updatedGooglePlaylists);
        } catch (error) {
            console.error('Error updating Google playlists:', error);
        }
    };

    const updateSpotifyPlaylists = async (newSpotifyPlaylists: any) => {
        if (!supabaseUserId) return;

        try {
            const updatedSpotifyPlaylists = await supabaseOperations.updateSpotifyPlaylists(supabaseUserId, newSpotifyPlaylists);
            setSpotifyPlaylists(updatedSpotifyPlaylists);
        } catch (error) {
            console.error('Error updating Spotify playlists:', error);
        }
    };

    const fetchFriends = async (userId: string) => {
        try {
            const friends = await supabaseOperations.getFriends(userId);
            setFriendsList(friends);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async (userId: string) => {
        try {
            const requests = await supabaseOperations.getFriendRequests(userId);
            setFriendRequests(requests);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const updateProfile = async (newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => {
        try {
            if (!supabaseUserId) throw new Error('No Supabase user ID');

            const updatedProfile = await supabaseOperations.updateProfile(supabaseUserId, newUsername, newAvatarUrl, newPlatforms);

            setUsername(updatedProfile.username);
            setAvatarUrl(updatedProfile.avatar_url);
            setPlatforms(updatedProfile.platforms);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const getPlayCount = async (playlistId: string): Promise<number> => {
        if (!supabaseUserId) return 0;
        return supabaseOperations.getPlayCount(supabaseUserId, playlistId);
    };

    const incrementPlayCount = async (playlistId: string): Promise<void> => {
        if (!supabaseUserId) return;
        try {
            const updatedCount = await supabaseOperations.incrementPlayCount(supabaseUserId, playlistId);
            setPlayCount(prev => ({
                ...prev,
                [playlistId]: updatedCount,
            }));
        } catch (error) {
            console.error('Error incrementing play count:', error);
        }
    };

    const sendFriendRequest = async (username: string) => {
        if (!supabaseUserId) return false;
        try {
            return await supabaseOperations.sendFriendRequest(supabaseUserId, username);
        } catch (error) {
            console.error('Error sending friend request:', error);
            return false;
        }
    };

    const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
        if (!supabaseUserId) return;
        try {
            const result = await supabaseOperations.acceptFriendRequest(supabaseUserId, requestId, senderId);

            if (result && result.senderProfile) {
                const newFriend: User = {
                    id: senderId,
                    username: result.senderProfile.username || 'Unknown',
                    avatar_url: result.senderProfile.avatar_url || '/default-avatar.png',
                    platforms: result.senderProfile.platforms || []
                };

                setFriendsList([...friendsList, newFriend]);
                setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDeclineFriendRequest = async (requestId: string) => {
        try {
            await supabaseOperations.declineFriendRequest(requestId);
            setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
        } catch (error) {
            console.error('Error declining friend request:', error);
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                supabaseUserId,
                avatarUrl,
                username,
                googlePlaylists,
                spotifyPlaylists,
                updateGooglePlaylists,
                updateSpotifyPlaylists,
                platforms,
                playCount,
                friendsList,
                friendRequests,
                updateProfile,
                getPlayCount,
                incrementPlayCount,
                sendFriendRequest,
                handleAcceptFriendRequest,
                handleDeclineFriendRequest,
                fetchUserProfile,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};