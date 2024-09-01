"use client";

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/utils/redux/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleAuthProvider } from '@/contexts/google/GoogleAuthContext';
import { GooglePlaylistProvider } from '@/contexts/google/GooglePlaylistContext';
import { SpotifyAuthProvider } from '@/contexts/spotify/SpotifyAuthContext';
import { SpotifyPlaylistProvider } from '@/contexts/spotify/SpotifyPlaylistContext';
import { FriendProvider } from '@/contexts/FriendContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from 'react-hot-toast';


export default function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SpotifyAuthProvider>
                    <GoogleAuthProvider>
                        <AuthProvider>
                            <GooglePlaylistProvider>
                                <SpotifyPlaylistProvider>
                                    <ProfileProvider>
                                        <FriendProvider>
                                            {children}
                                            <Toaster position="bottom-right" reverseOrder={false} />
                                        </FriendProvider>
                                    </ProfileProvider>
                                </SpotifyPlaylistProvider>
                            </GooglePlaylistProvider>
                        </AuthProvider>
                    </GoogleAuthProvider>
                </SpotifyAuthProvider>
            </PersistGate>
        </Provider>
    );
}
