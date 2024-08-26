"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, setGoogleTokens } from '@/utils/redux/authSlice';
import { clearGooglePlaylists, UpdateGooglePlaylists, UpdatePlaylistSongs } from '@/utils/redux/playlistSlice';
import { Playlist, Song, Tokens } from '@/types';

interface PlaylistsResponse {
    items: any[];
}

interface SongsResponse {
    items: any[];
}

interface GoogleContextType {
    isGoogleAuth: boolean;
    googleTokens: Tokens | null;
    playlists: Playlist[];
    fetchSongsForPlaylist: (playlistId: string) => Promise<Song[]>;
    logoutGoogle: () => void;
    checkIfGoogleAuthenticated: () => Promise<boolean>;
    refreshGoogleTokens: () => Promise<boolean>;
}

interface GoogleProviderProps {
    children: React.ReactNode;
}

export const GoogleContext = createContext<GoogleContextType | null>(null);

export const GoogleProvider = ({ children }: GoogleProviderProps) => {
    const dispatch = useDispatch();
    const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
    const storedGooglePlaylists = useSelector((state: RootState) => state.playlists.google);
    const isGoogleAuthenticated = !!googleTokens?.access_token;

    const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(isGoogleAuthenticated);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        setIsGoogleAuth(isGoogleAuthenticated);
    }, [isGoogleAuthenticated]);

    useEffect(() => {
        if (isGoogleAuth) {
            loadPlaylists();
        }
    }, [isGoogleAuth]);

    const handleLogoutGoogle = async () => {
        dispatch(clearGoogleTokens());
        dispatch(clearGooglePlaylists());

        if (googleTokens?.access_token) {
            try {
                await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleTokens.access_token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                console.log("Successfully signed out from Google account");
            } catch (error) {
                console.error("Error revoking Google token:", error);
            }
        }

        setIsGoogleAuth(false);
    };

    const refreshGoogleTokens = async (): Promise<boolean> => {
        if (googleTokens?.refresh_token) {
            try {
                const response = await fetch('/api/auth/google/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: googleTokens.refresh_token }),
                });

                if (!response.ok) {
                    throw new Error('Failed to refresh Google tokens');
                }

                const newTokens = await response.json();
                dispatch(setGoogleTokens(newTokens));
                return true;
            } catch (error) {
                console.error('Error refreshing Google tokens:', error);
                return false;
            }
        }
        return false;
    };

    const checkIfGoogleAuthenticated = async (): Promise<boolean> => {
        if (googleTokens?.access_token) {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleTokens.access_token);
                const data = await res.json();

                if (data.error) {
                    const refreshed = await refreshGoogleTokens();
                    if (refreshed) {
                        return true;
                    } else {
                        throw new Error('Google token refresh failed');
                    }
                }

                return data.expires_in > 0; // Check if the token is still valid
            } catch (error) {
                console.error('Error checking Google authentication:', error);
                return false;
            }
        }
        return false;
    };

    const fetchGooglePlaylists = async (): Promise<Playlist[] | null> => {
        if (googleTokens?.access_token) {
            try {
                const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${googleTokens.access_token}`,
                        Accept: 'application/json',
                    },
                });

                if (res.ok) {
                    const data: PlaylistsResponse = await res.json();
                    const transformedPlaylists: Playlist[] = data.items.map((playlist) => ({
                        id: playlist.id,
                        title: playlist.snippet.title,
                        accountName: playlist.snippet.channelTitle,
                        source: "google",
                        description: playlist.snippet.description,
                        thumbnails: {
                            default: playlist.snippet.thumbnails.default.url,
                            medium: playlist.snippet.thumbnails.medium.url,
                            high: playlist.snippet.thumbnails.high.url,
                        },
                        songs: [], // songs will be loaded separately
                    }));
                    return transformedPlaylists;
                } else if (res.status === 401) { // Unauthorized
                    const refreshed = await refreshGoogleTokens();
                    if (refreshed) {
                        return await fetchGooglePlaylists(); // Retry with the new token
                    }
                } else {
                    console.error('Failed to fetch Google playlists:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching Google playlists:', error);
            }
        }
        return null;
    };

    const validatePlaylists = (playlists: Playlist[]): Playlist[] => {
        const uniquePlaylists: { [id: string]: Playlist } = {};

        playlists.forEach((playlist) => {
            if (!uniquePlaylists[playlist.id]) {
                uniquePlaylists[playlist.id] = playlist;
            } else {
                console.warn(`Duplicate playlist found: ${playlist.title}`);
            }

            // Ensure all necessary information is present
            if (!playlist.title || !playlist.id || !playlist.source) {
                console.error(`Playlist is missing essential information: ${playlist.id}`);
            }
        });

        return Object.values(uniquePlaylists);
    };

    const loadPlaylists = async () => {
        let validatedPlaylists: Playlist[] = [];

        // Validate stored playlists
        if (Object.keys(storedGooglePlaylists).length > 0) {
            validatedPlaylists = validatePlaylists(Object.values(storedGooglePlaylists));
            setPlaylists(validatedPlaylists);
        }

        // Fetch new playlists if necessary and validate them
        const fetchedPlaylists = await fetchGooglePlaylists();

        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);
            validatedPlaylists = [...validatedPlaylists, ...newValidatedPlaylists];
            dispatch(UpdateGooglePlaylists(validatedPlaylists));
            setPlaylists(validatedPlaylists);
        }
    };

    const fetchSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length > 0) {
            return playlist?.songs || [];
        }

        if (googleTokens?.access_token) {
            try {
                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${googleTokens.access_token}`,
                            Accept: 'application/json',
                        },
                    }
                );

                if (res.ok) {
                    const data: SongsResponse = await res.json();
                    const fetchedSongs: Song[] = data.items.map((item: any) => ({
                        id: item.snippet.resourceId.videoId,
                        title: item.snippet.title,
                        artist: item.snippet.videoOwnerChannelTitle,
                        thumbnails: {
                            default: item.snippet.thumbnails.default.url,
                            medium: item.snippet.thumbnails.medium.url,
                            high: item.snippet.thumbnails.high.url,
                        },
                    }));
                    dispatch(UpdatePlaylistSongs({ playlistId, songs: fetchedSongs }));

                    setPlaylists(prevPlaylists => prevPlaylists.map(p => 
                        p.id === playlistId ? { ...p, songs: fetchedSongs } : p
                    ));

                    return fetchedSongs;
                } else if (res.status === 401) { // Unauthorized
                    const refreshed = await refreshGoogleTokens();
                    if (refreshed) {
                        return await fetchSongsForPlaylist(playlistId); // Retry with the new token
                    }
                } else {
                    console.error('Failed to fetch Google playlist songs:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching Google playlist songs:', error);
            }
        }

        return [];
    };

    return (
        <GoogleContext.Provider
            value={{
                isGoogleAuth,
                googleTokens,
                playlists,
                fetchSongsForPlaylist,
                logoutGoogle: handleLogoutGoogle,
                checkIfGoogleAuthenticated,
                refreshGoogleTokens,
            }}
        >
            {children}
        </GoogleContext.Provider>
    );
};

export const useGoogleContext = () => useContext(GoogleContext) as GoogleContextType;
