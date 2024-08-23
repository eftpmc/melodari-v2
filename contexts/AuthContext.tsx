"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const tokens = useSelector((state: RootState) => state.auth.googleTokens);

  const isAuthenticated = tokens && tokens.access_token ? true : false;

  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated);

  useEffect(() => {
    setIsAuth(isAuthenticated); // Update isAuth whenever tokens change
  }, [tokens, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
