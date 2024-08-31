"use client";

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/utils/redux/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleProvider } from '@/contexts/GoogleContext';
import { SpotifyProvider } from '@/contexts/SpotifyContext';
import { FriendProvider } from '@/contexts/FriendContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from 'react-hot-toast';


export default function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SpotifyProvider>
                    <GoogleProvider>
                        <AuthProvider>
                            <ProfileProvider>
                            <FriendProvider>
                                {children}
                                <Toaster position="bottom-right" reverseOrder={false} />
                            </FriendProvider>
                            </ProfileProvider>
                        </AuthProvider>
                    </GoogleProvider>
                </SpotifyProvider>
            </PersistGate>
        </Provider>
    );
}
