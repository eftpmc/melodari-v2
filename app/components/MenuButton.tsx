"use client";

import { Menu, LogOut, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const MenuButton = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSignOut = () => {
    setShowConfirmDialog(true);
  };

  const confirmSignOut = async () => {
    await logout();
    router.push('/');
  };

  const cancelSignOut = () => {
    setShowConfirmDialog(false);
  };

  const handleSettings = () => {
    router.push('/settings'); // Adjust the path to your settings page
  };

  const handleFriends = () => {
    router.push('/friends'); // Adjust the path to your friends page
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn bg-base-content hover:bg-primary text-base-200 rounded-full">
        <Menu className="w-6 h-6" />
        Menu
      </label>
      <ul tabIndex={0} className="dropdown-content bg-base-content text-base-200 menu p-2 m-2 shadow rounded-box w-52">
        <li>
          <a onClick={handleFriends} className="flex items-center hover:bg-primary">
            <Users className="w-4 h-4 mr-2" /> Friends
          </a>
        </li>
        <li>
          <a onClick={handleSettings} className="flex items-center hover:bg-primary">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </a>
        </li>
        <li>
          <a onClick={handleSignOut} className="flex items-center hover:bg-primary">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </a>
        </li>
      </ul>

      {/* Confirm Sign Out Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
        confirmButtonText="Sign Out"
        Icon={LogOut}
      />
    </div>
  );
};

export default MenuButton;