"use client";

import { Menu, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

const MenuButton = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/settings'); // Adjust the path to your settings page
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-square bg-base-100">
        <Menu className="w-6 h-6" />
      </label>
      <ul tabIndex={0} className="dropdown-content bg-base-100 menu p-2 m-2 shadow rounded-box w-52">
        <li>
          <a onClick={handleSettings} className="flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </a>
        </li>
        <li>
          <a onClick={handleSignOut} className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </a>
        </li>
      </ul>
    </div>
  );
};

export default MenuButton;
