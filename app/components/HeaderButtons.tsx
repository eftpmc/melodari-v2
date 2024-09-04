"use client"

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import MenuButton from './MenuButton';

const HeaderButtons: React.FC = () => {
  const { isAuthenticated, loading, getAuthorizeUrl } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);

  if (loading) {
    return null; // Optionally, return a loading spinner or nothing while loading
  }

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const authorizeUrl = await getAuthorizeUrl('google');
      if (authorizeUrl) {
        window.location.href = authorizeUrl;
      }
    } catch (error) {
      console.error("Error during Google authentication", error);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <ThemeSwitcher />
          <MenuButton />
        </>
      ) : (
        <>
          <ThemeSwitcher/>
          <button 
            onClick={handleLogin}
            disabled={loginLoading}
            className="btn bg-base-content hover:bg-primary rounded-full text-base-200 flex items-center space-x-2 group shadow-md border-none"
          >
            <span>{loginLoading ? "Connecting..." : "Log in"}</span>
            {!loginLoading && (
              <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                ➔
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default HeaderButtons;