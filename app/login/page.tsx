"use client";

import { useState } from "react";
import { FaGoogle } from "react-icons/fa"; // Import the Google icon

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.authorizeUrl) {
        // Redirect the user to Google's OAuth 2.0 authorization page
        window.location.href = data.authorizeUrl;
      }
    } catch (error) {
      console.error("Error during authentication", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center pb-24">
      <h1 className="text-3xl font-bold mb-4 text-base-content">
        A{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Universal
        </span>{" "}
        Approach to Music
      </h1>
      <p className="text-base-content mb-8">
        Discover and connect with the best music services all in one place.
      </p>
      <button
        onClick={handleLogin}
        className="btn btn-error flex items-center text-base-200 py-3 px-6 rounded-lg shadow-lg" // Apply base-content color
        disabled={loading}
      >
        {loading ? (
          "Connecting..."
        ) : (
          <>
            <FaGoogle className="mr-2 w-5 h-5 text-base-200" /> {/* Apply base-content color to icon */}
            Connect with Google
          </>
        )}
      </button>
    </div>
  );
}
