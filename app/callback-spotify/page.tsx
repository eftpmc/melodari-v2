"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSpotifyTokens } from '@/utils/redux/authSlice'; // Import the appropriate action
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SpotifyCallback() {
  const router = useRouter();
  const { checkIfGoogleAuthenticated, checkIfSpotifyAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const exchangeCodeForTokens = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const res = await fetch('/api/auth/spotify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (data.tokens) {
            dispatch(setSpotifyTokens(data.tokens));
          
            // Validate token or check if user is authenticated with the new token
            const isAuthenticated = await checkIfSpotifyAuthenticated(); // Implement this based on your auth logic
          
            if (isAuthenticated) {
              router.push('/'); // Redirect to the home page
            } else {
              router.push('/login'); // Redirect to login if authentication fails
            }
          } else {
            console.error('Authentication failed:', data.message);
            router.push('/login'); // Redirect to login on failure
          }          
        } catch (error) {
          console.error('Error exchanging code for tokens:', error);
          router.push('/login'); // Redirect to login on error
        }
      } else {
        console.error('No code found in URL');
        router.push('/login'); // Redirect to login if no code
      }
      setLoading(false); // End loading state
    };

    exchangeCodeForTokens();
  }, [router, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-300 text-base-content font-semibold pb-24">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing..
      </div>
    );
  }

  return null; // Render nothing once processing is complete
}
