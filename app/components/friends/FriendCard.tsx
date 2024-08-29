import React from 'react';
import { User } from '@/types';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

interface FriendCardProps {
    user: User;
}

const platformsData = [
    { id: 'google', name: 'YouTube Music', icon: <SiYoutubemusic className="text-red-600 w-6 h-6" /> },
    { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="text-green-600 w-6 h-6" /> },
];

const FriendCard: React.FC<FriendCardProps> = ({ user }) => {
    return (
        <div className="bg-base-100 p-2 rounded-lg shadow-md w-contain flex items-center cursor-pointer">
            <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={`${user.username}'s avatar`}
                className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="ml-4 flex-1">
                <div className="text-base-content font-semibold">{user.username}</div>
                <div className="flex mt-2 space-x-2">
                    {user.platforms.map((platformId: string) => {
                        const platform = platformsData.find((p) => p.id === platformId);
                        return platform ? platform.icon : null;
                    })}
                </div>
            </div>
        </div>
    );
};

export default FriendCard;