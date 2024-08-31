"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FriendRequest, User } from '@/types';
import { supabaseOperations } from '@/utils/supabase/operations';
import { useProfile } from '@/contexts/ProfileContext';
import toast from 'react-hot-toast';

interface FriendContextType {
    friendsList: User[];
    friendRequests: FriendRequest[];
    outgoingFriendRequests: FriendRequest[];
    sendFriendRequest: (username: string) => Promise<boolean>;
    handleAcceptFriendRequest: (requestId: string, senderId: string) => Promise<void>;
    handleDeclineFriendRequest: (requestId: string) => Promise<void>;
    loading: boolean;
}

const FriendContext = createContext<FriendContextType | null>(null);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { supabaseUserId } = useProfile();
    const [friendsList, setFriendsList] = useState<User[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supabaseUserId) {
            initializeData();
        }
    }, [supabaseUserId]);

    const initializeData = async () => {
        if (!supabaseUserId) return;
        setLoading(true);
        try {
            const [friends, incomingRequests, outgoingRequests] = await Promise.all([
                supabaseOperations.getFriends(supabaseUserId),
                supabaseOperations.getFriendRequests(supabaseUserId),
                supabaseOperations.getOutgoingFriendRequests(supabaseUserId)
            ]);
            setFriendsList(friends);
            setFriendRequests(incomingRequests);
            setOutgoingFriendRequests(outgoingRequests);
        } catch (error) {
            console.error('Error initializing friend data:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (username: string) => {
        if (!supabaseUserId) return false;
        try {
            await supabaseOperations.sendFriendRequest(supabaseUserId, username);
            await initializeData(); // Refresh all data
            toast.success('Friend request sent successfully!');
            return true;
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast.error('Failed to send friend request. Please try again.');
            return false;
        }
    };

    const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
        if (!supabaseUserId) return;
        try {
            await supabaseOperations.acceptFriendRequest(supabaseUserId, requestId, senderId);
            await initializeData(); // Refresh all data
            toast.success('Friend request accepted.');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            toast.error('Failed to accept friend request. Please try again.');
        }
    };

    const handleDeclineFriendRequest = async (requestId: string) => {
        try {
            await supabaseOperations.declineFriendRequest(requestId);
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