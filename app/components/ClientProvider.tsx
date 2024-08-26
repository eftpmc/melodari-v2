"use client";

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/utils/redux/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleProvider } from '@/contexts/GoogleContext';
import { SpotifyProvider } from '@/contexts/SpotifyContext';


export default function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SpotifyProvider>
                    <GoogleProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </GoogleProvider>
                </SpotifyProvider>
            </PersistGate>
        </Provider>
    );
}
