"use client"

import React from 'react';
import FriendList from '@/app/components/friends/FriendList';
import FriendRequestList from '@/app/components/friends/FriendRequestList';
import AddFriendButton from '@/app/components/friends/AddFriendButton';

const FriendsPage: React.FC = () => {
    return (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-base-content">Friends</h2>
                    <AddFriendButton />
                </div>
                <FriendList />
                <FriendRequestList />
            </div>
    );
};

export default FriendsPage;
