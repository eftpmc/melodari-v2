"use client";

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/utils/redux/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleAuthProvider } from '@/contexts/GoogleAuthContext';
import { SpotifyAuthProvider } from '@/contexts/SpotifyAuthContext';


export default function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SpotifyAuthProvider>
                    <GoogleAuthProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </GoogleAuthProvider>
                </SpotifyAuthProvider>
            </PersistGate>
        </Provider>
    );
}
