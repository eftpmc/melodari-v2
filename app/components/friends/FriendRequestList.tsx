import React from 'react';
import { useFriendContext } from '@/contexts/FriendContext';
import { FriendRequest } from '@/types';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

const platformsData = [
    { id: 'google', name: 'YouTube Music', icon: <SiYoutubemusic className="text-red-600 w-6 h-6" /> },
    { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="text-green-600 w-6 h-6" /> },
];

const FriendRequestList: React.FC = () => {
    const {
        friendRequests,
        outgoingFriendRequests,
        handleAcceptFriendRequest,
        handleDeclineFriendRequest,
    } = useFriendContext();

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-base-content mb-4">Incoming</h3>
            {friendRequests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friendRequests.map((request: FriendRequest) => (
                        <div key={request.id} className="flex flex-col sm:flex-row items-center p-4 bg-base-100 rounded-md shadow-md">
                            <div className="flex items-center">
                                <img
                                    src={request.profiles?.avatar_url || "/default-avatar.png"}
                                    alt={`${request.profiles?.username || 'User'}'s avatar`}
                                    className="w-16 h-16 object-cover rounded-lg mr-4"
                                />
                                <div className="flex flex-col">
                                    <div className="text-base-content font-semibold">{request.profiles?.username || 'Unknown User'}</div>
                                    <div className="flex mt-2 space-x-2">
                                        {(request.profiles?.platforms || []).map((platformId: string) => {
                                            const platform = platformsData.find((p) => p.id === platformId);
                                            return platform ? platform.icon : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="ml-auto flex space-x-2 mt-4 sm:mt-0">
                                <button
                                    className="btn btn-primary text-base-100"
                                    onClick={() => handleAcceptFriendRequest(request.id, request.sender_id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleDeclineFriendRequest(request.id)}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-32 bg-base-100 rounded-md shadow-md p-2">
                    <p className="text-lg font-semibold text-base-content text-center">No Incoming Friend Requests</p>
                    <p className="text-sm text-gray-500 text-center">You have no pending friend requests at the moment.</p>
                </div>
            )}

            <h3 className="text-xl font-semibold text-base-content mb-4 mt-8">Outgoing</h3>
            {outgoingFriendRequests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {outgoingFriendRequests.map((request: FriendRequest) => (
                        <div key={request.id} className="flex flex-col sm:flex-row items-center p-4 bg-base-100 rounded-md shadow-md">
                            <div className="flex items-center">
                                <img
                                    src={request.profiles?.avatar_url || "/default-avatar.png"}
                                    alt={`${request.profiles?.username || 'User'}'s avatar`}
                                    className="w-16 h-16 object-cover rounded-lg mr-4"
                                />
                                <div className="flex flex-col">
                                    <div className="text-base-content font-semibold">{request.profiles?.username || 'Unknown User'}</div>
                                    <div className="flex mt-2 space-x-2">
                                        {(request.profiles?.platforms || []).map((platformId: string) => {
                                            const platform = platformsData.find((p) => p.id === platformId);
                                            return platform ? platform.icon : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="ml-auto flex space-x-2 mt-4 sm:mt-0">
                                <button className="btn btn-outline" onClick={() => handleDeclineFriendRequest(request.id)}>
                                    Cancel Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-32 bg-base-100 rounded-md shadow-md p-2">
                    <p className="text-lg font-semibold text-base-content text-center">No Outgoing Friend Requests</p>
                    <p className="text-sm text-gray-500 text-center">You have no pending outgoing requests.</p>
                </div>
            )}
        </div>
    );
};

export default FriendRequestList;