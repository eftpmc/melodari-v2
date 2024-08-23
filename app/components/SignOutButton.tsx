"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearGoogleTokens } from "@/utils/redux/authSlice"; // Ensure this path is correct

const SignOutButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      // Clear the tokens from Redux state
      dispatch(clearGoogleTokens());

      // Sign out the user from their Google account by revoking the token
      const tokens = JSON.parse(localStorage.getItem('google_tokens') || '{}');
      if (tokens.access_token) {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${tokens.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log("Successfully signed out from Google account");
      }

      // Remove tokens from local storage
      localStorage.removeItem('google_tokens');

      // Redirect to the home or login page after sign-out
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="btn btn-square"
    >
      <LogOut className="w-6 h-6" />
    </button>
  );
};

export default SignOutButton;
