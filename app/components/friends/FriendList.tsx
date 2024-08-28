import React from 'react';
import FriendCard from './FriendCard';
import { useFriendContext } from '@/contexts/FriendContext';
import { User } from '@/types';

const FriendList: React.FC = () => {
    const { friendsList } = useFriendContext();

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-base-content mb-4">Your Friends</h3>
            {friendsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendsList.map((user: User) => (
                        <FriendCard key={user.id} user={user} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-32 bg-base-100 rounded-md shadow-md">
                    <p className="text-lg font-semibold text-base-content">No Friends Found</p>
                    <p className="text-sm text-gray-500">You haven&apos;t added any friends yet.</p>
                </div>
            )}
        </div>
    );
};

export default FriendList;