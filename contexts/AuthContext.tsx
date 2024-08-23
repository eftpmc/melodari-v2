"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextType {
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthStatus: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const tokens = useSelector((state: RootState) => state.auth.tokens);

  const checkAuthStatus = () => {
    if (tokens?.access_token) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus(); // Check user authentication status on component mount
  }, [tokens]);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
