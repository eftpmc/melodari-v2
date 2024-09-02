"use client"

import React from 'react';
import FriendList from '@/app/components/friends/FriendList';
import FriendRequestList from '@/app/components/friends/FriendRequestList';

const FriendsPage: React.FC = () => {
    return (
        <div className="p-8">
            <FriendList />
            <FriendRequestList />
        </div>
    );
};

export default FriendsPage;