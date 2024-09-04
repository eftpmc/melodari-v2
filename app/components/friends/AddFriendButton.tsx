"use client";

import React, { useState } from 'react';
import { Send, LucideLoader2, LucideX } from 'lucide-react';
import { useFriendContext } from '@/contexts/FriendContext';

interface AddFriendButtonProps {
    children: React.ReactNode;
}

const AddFriendButton: React.FC<AddFriendButtonProps> = ({ children }) => {
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
            <div onClick={() => setShowAddFriendModal(true)}>
                {children}
            </div>
            {showAddFriendModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-base-content">Add a Friend</h3>
                        <p className="py-4 text-base-content">Enter your friend&apos;s username to add them.</p>
                        
                        <div className="flex items-center border border-base-content rounded-full overflow-hidden">
                            <input
                                type="text"
                                placeholder="Friend's username"
                                className="input flex-1 border-none text-base-content focus:outline-none px-4"
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                            />
                            <button
                                className="bg-base-content hover:bg-primary text-base-100 px-6 py-2 mr-2 rounded-full flex items-center justify-center group"
                                onClick={handleSendRequest}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LucideLoader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <Send className="w-5 h-5 transform transition-transform duration-300 group-hover:rotate-12" />
                                )}
                            </button>
                        </div>

                        {warning && <p className="text-red-600 mt-4">{warning}</p>}

                        <div className="modal-action">
                            <button
                                className="btn flex items-center space-x-2 group"
                                onClick={() => setShowAddFriendModal(false)}
                            >
                                <LucideX
                                    className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
                                />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddFriendButton;
