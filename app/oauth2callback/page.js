"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setGoogleTokens, setTokens } from '@/utils/redux/authSlice';

export default function OAuth2Callback() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const exchangeCodeForTokens = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (data.tokens) {
            // Dispatch the tokens to Redux
            dispatch(setGoogleTokens(data.tokens));
            router.push('/'); // Redirect to the home page
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-semibold">Processing...</h1>
      </div>
    );
  }

  return null; // Render nothing once processing is complete
}
