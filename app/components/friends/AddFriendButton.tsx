"use client"

import React, { useState } from 'react';
import { useFriendContext } from '@/contexts/FriendContext';

const AddFriendButton: React.FC = () => {
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [searchUsername, setSearchUsername] = useState('');
    const [warning, setWarning] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { sendFriendRequest } = useFriendContext();

    const handleSendRequest = async () => {
        setIsLoading(true);
        const success = await sendFriendRequest(searchUsername);
        setIsLoading(false);
        if (success) {
            setShowAddFriendModal(false);
        } else {
            setWarning('An error occurred while sending the friend request. Please try again.');
        }
    };

    return (
        <>
            <button className="btn btn-primary text-base-100" onClick={() => setShowAddFriendModal(true)}>
                Add Friend
            </button>
            {showAddFriendModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-base-content">Add a Friend</h3>
                        <p className="py-4 text-base-content">Enter your friend's username to add them.</p>
                        <input
                            type="text"
                            placeholder="Friend's username"
                            className="input input-bordered w-full mb-4 text-base-content"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                        />
                        {warning && <p className="text-red-600 mb-4">{warning}</p>}
                        <button className="btn btn-primary text-base-100 w-full" onClick={handleSendRequest} disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Request'}
                        </button>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowAddFriendModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddFriendButton;