"use client";

import { Menu, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearGoogleTokens, clearSpotifyTokens } from "@/utils/redux/authSlice"; // Ensure this path is correct

const MenuButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      // Clear the tokens from Redux state
      dispatch(clearGoogleTokens());
      dispatch(clearSpotifyTokens());

      // Sign out the user from their Google account by revoking the token
      const googleTokens = JSON.parse(localStorage.getItem('google_tokens') || '{}');
      if (googleTokens.access_token) {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleTokens.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        console.log("Successfully signed out from Google account");
      }

      // Clear Spotify tokens from local storage
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');

      console.log("Successfully signed out from Spotify account");

      // Redirect to the home or login page after sign-out
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSettings = () => {
    router.push('/settings'); // Adjust the path to your settings page
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-square">
        <Menu className="w-6 h-6" />
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 m-2 shadow bg-base-200 rounded-box w-52">
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
