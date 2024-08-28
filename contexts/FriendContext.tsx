"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FriendRequest } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const FriendContext = createContext<any | null>(null);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { supabaseUserId, username: currentUsername } = useAuth();
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchFriends = async () => {
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

                // Exclude the current user from their own friends list
                const filteredFriends = friendProfiles.filter(friend => friend.id !== supabaseUserId);

                setFriendsList(filteredFriends);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const { data: requests, error } = await supabase
                .from('friend_requests')
                .select(`
                    id,
                    sender_id,
                    profiles:profiles!sender_id (username, avatar_url, platforms)
                `)
                .eq('receiver_id', supabaseUserId)
                .eq('status', 'pending');

            if (error) throw error;

            setFriendRequests(requests);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const fetchOutgoingFriendRequests = async () => {
        try {
            const { data: requests, error } = await supabase
                .from('friend_requests')
                .select(`
                    id,
                    receiver_id,
                    profiles:profiles!receiver_id (username, avatar_url, platforms)
                `)
                .eq('sender_id', supabaseUserId)
                .eq('status', 'pending');
    
            if (error) throw error;
    
            setOutgoingFriendRequests(requests);
        } catch (error) {
            console.error('Error fetching outgoing friend requests:', error);
        }
    };

    useEffect(() => {
        if (!supabaseUserId) return;

        const initializeData = async () => {
            await Promise.all([fetchFriends(), fetchFriendRequests(), fetchOutgoingFriendRequests()]);
            setLoading(false);
        };        

        initializeData();
    }, [supabaseUserId, supabase]);

    const sendFriendRequest = async (username: string) => {
        try {
            if (username === currentUsername) {
                toast.error('You cannot send a friend request to yourself.');
                return false;
            }

            const { data: friendProfile, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, platforms')
                .eq('username', username)
                .single();

                if (error || !friendProfile) {
                    toast.error('Username not found. Please try again.');
                    return false;
                }

            const { error: insertError } = await supabase
                .from('friend_requests')
                .insert({ sender_id: supabaseUserId, receiver_id: friendProfile.id, status: 'pending' });

            if (insertError) throw insertError;

            fetchOutgoingFriendRequests();

            toast.success('Friend request sent successfully!');
            return true;
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast.error('Failed to send friend request. Please try again.');
            return false;
        }
    };

    const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
        try {
            // Fetch current user's friends list
            const { data: userProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('friends')
                .eq('id', supabaseUserId)
                .single();
    
            if (fetchError) throw fetchError;
    
            const currentFriends = Array.isArray(userProfile.friends) ? userProfile.friends : [];
            const updatedFriendsForReceiver = [...currentFriends, senderId];
    
            // Fetch sender's profile and friends list
            const { data: senderProfile, error: senderFetchError } = await supabase
                .from('profiles')
                .select('username, avatar_url, platforms, friends')
                .eq('id', senderId)
                .single();
    
            if (senderFetchError) throw senderFetchError;
    
            const senderFriends = Array.isArray(senderProfile.friends) ? senderProfile.friends : [];
            const updatedFriendsForSender = [...senderFriends, supabaseUserId];
    
            // Update both users' friends lists
            await supabase.from('profiles').update({ friends: updatedFriendsForReceiver }).eq('id', supabaseUserId);
            await supabase.from('profiles').update({ friends: updatedFriendsForSender }).eq('id', senderId);
    
            // Update the friend request status to accepted
            await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
    
            // Ensure senderProfile and other fields are defined before updating local state
            const senderPlatforms = senderProfile?.platforms || [];
            const newFriend = {
                id: senderId,
                username: senderProfile.username || 'Unknown',
                avatar_url: senderProfile.avatar_url || '/default-avatar.png',
                platforms: senderPlatforms
            };
    
            setFriendsList([...friendsList, newFriend]);
            setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };    

    const handleDeclineFriendRequest = async (requestId: string) => {
        try {
            // Update the friend request status to declined
            const { error } = await supabase
                .from('friend_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);
    
            if (error) throw error;
    
            // Remove the declined request from the state
            setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
            toast.success('Friend request declined.');
        } catch (error) {
            console.error('Error declining friend request:', error);
            toast.error('Failed to decline friend request. Please try again.');
        }
    };

    return (
        <FriendContext.Provider
            value={{
                friendsList,
                friendRequests,
                outgoingFriendRequests,
                sendFriendRequest,
                handleAcceptFriendRequest,
                handleDeclineFriendRequest,
                loading,
            }}
        >
            {children}
        </FriendContext.Provider>
    );
};

export const useFriendContext = () => {
    const context = useContext(FriendContext);
    if (!context) {
        throw new Error('useFriendContext must be used within a FriendProvider');
    }
    return context;
};