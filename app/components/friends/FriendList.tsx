import React from 'react';
import FriendCard from './FriendCard';
import { useFriendContext } from '@/contexts/FriendContext';
import { User } from '@/types';
import AddFriendButton from './AddFriendButton';
import { Plus } from 'lucide-react';

const FriendList: React.FC = () => {
    const { friendsList } = useFriendContext();

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-base-content mb-4">Your Friends</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendsList.map((user: User) => (
                    <FriendCard key={user.id} user={user} />
                ))}
                <AddFriendCard />
            </div>
        </div>
    );
};

const AddFriendCard: React.FC = () => {
    return (
        <AddFriendButton>
            <div className="bg-base-100 p-2 rounded-lg shadow-md w-full h-20 flex items-center justify-center cursor-pointer hover:bg-base-200 transition-colors border border-base-300 group">
                <div className="flex flex-col items-center justify-center text-base-content">
                    <Plus className="w-6 h-6 transition-transform duration-300 transform group-hover:scale-125" />
                </div>
            </div>
        </AddFriendButton>
    );
};




export default FriendList;