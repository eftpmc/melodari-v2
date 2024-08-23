"use client";

import { useState } from "react";

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(false); // Local state to manage connecting state

  const handleLogin = async () => {
    setIsConnecting(true); // Set state to show "Connecting..."
    try {
      const res = await fetch('/api/auth/google', {
        method: 'GET',
      });
      const data = await res.json();
      if (data.authorizeUrl) {
        window.location.href = data.authorizeUrl; // Redirect to Google's OAuth2 login
      } else {
        console.error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error during login process:', error);
    } finally {
      setIsConnecting(false); // Reset the state after login attempt
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center pb-24">
      <h1 className="text-3xl text-base-content font-bold">Login</h1>
      <button onClick={handleLogin} className="btn btn-primary mt-4" disabled={isConnecting}>
        {isConnecting ? "Connecting..." : "Connect with Google"} {/* Show "Connecting..." during the process */}
      </button>
    </main>
  );
}
