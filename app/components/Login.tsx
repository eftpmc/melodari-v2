// components/Login.js
import { useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
    <div>
      <h1 className="text-3xl text-base-content font-bold">Login</h1>
      <button onClick={handleLogin} className="btn btn-primary mt-4" disabled={loading}>
        {loading ? "Connecting..." : "Connect with Google"}
      </button>
    </div>
  );
}
