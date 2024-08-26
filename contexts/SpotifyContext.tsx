"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearSpotifyTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { clearSpotifyPlaylists, setSpotifyPlaylists, setPlaylistSongs } from '@/utils/redux/playlistSlice';
import { Playlist, Song, Tokens } from '@/types';

interface PlaylistsResponse {
    items: any[];
}

interface SongsResponse {
    items: any[];
}

interface SpotifyContextType {
    isSpotifyAuth: boolean;
    spotifyTokens: Tokens | null;
    playlists: Playlist[];
    fetchSongsForPlaylist: (playlistId: string) => Promise<Song[]>;
    logoutSpotify: () => void;
    checkIfSpotifyAuthenticated: () => Promise<boolean>;
    refreshSpotifyTokens: () => Promise<boolean>;
}

interface SpotifyProviderProps {
    children: React.ReactNode;
}

export const SpotifyContext = createContext<SpotifyContextType | null>(null);

export const SpotifyProvider = ({ children }: SpotifyProviderProps) => {
    const dispatch = useDispatch();
    const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
    const storedSpotifyPlaylists = useSelector((state: RootState) => state.playlists.spotify);
    const isSpotifyAuthenticated = !!spotifyTokens?.access_token;

    const [isSpotifyAuth, setIsSpotifyAuth] = useState<boolean>(isSpotifyAuthenticated);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        setIsSpotifyAuth(isSpotifyAuthenticated);
    }, [isSpotifyAuthenticated]);

    useEffect(() => {
        if (isSpotifyAuth) {
            loadPlaylists();
        }
    }, [isSpotifyAuth]);

    const handleLogoutSpotify = async () => {
        dispatch(clearSpotifyTokens());
        dispatch(clearSpotifyPlaylists());

        console.log("Successfully signed out from Spotify account");
        setIsSpotifyAuth(false);
    };

    const refreshSpotifyTokens = async (): Promise<boolean> => {
        if (spotifyTokens?.refresh_token) {
            try {
                const response = await fetch('/api/auth/spotify/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: spotifyTokens.refresh_token }),
                });

                if (!response.ok) {
                    throw new Error('Failed to refresh Spotify tokens');
                }

                const newTokens = await response.json();
                dispatch(setSpotifyTokens(newTokens));
                return true;
            } catch (error) {
                console.error('Error refreshing Spotify tokens:', error);
                return false;
            }
        }
        return false;
    };

    const checkIfSpotifyAuthenticated = async (): Promise<boolean> => {
        if (spotifyTokens?.access_token) {
            try {
                const res = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${spotifyTokens.access_token}`,
                    },
                });

                if (!res.ok) {
                    const refreshed = await refreshSpotifyTokens();
                    if (refreshed) {
                        return true;
                    } else {
                        throw new Error('Spotify token refresh failed');
                    }
                }

                return res.ok; // If response is OK, the token is still valid
            } catch (error) {
                console.error('Error checking Spotify authentication:', error);
                return false;
            }
        }
        return false;
    };

    const loadPlaylists = async () => {
        if (Object.keys(storedSpotifyPlaylists).length > 0) {
            setPlaylists(Object.values(storedSpotifyPlaylists));
            return;
        }

        if (spotifyTokens?.access_token) {
            try {
                const res = await fetch('https://api.spotify.com/v1/me/playlists', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${spotifyTokens.access_token}`,
                        Accept: 'application/json',
                    },
                });

                if (res.ok) {
                    const data: PlaylistsResponse = await res.json();
                    const transformedPlaylists = data.items.map((playlist) => ({
                        id: playlist.id,
                        title: playlist.name,
                        source: "spotify",
                        description: playlist.description,
                        thumbnails: {
                            default: playlist.images[0]?.url || '',
                            medium: playlist.images[0]?.url || '',
                            high: playlist.images[0]?.url || '',
                        },
                        songs: [], // songs will be loaded separately
                    }));
                    dispatch(setSpotifyPlaylists(transformedPlaylists));
                    setPlaylists(transformedPlaylists);
                } else if (res.status === 401) { // Unauthorized
                    const refreshed = await refreshSpotifyTokens();
                    if (refreshed) {
                        await loadPlaylists(); // Retry with the new token
                    }
                } else {
                    console.error('Failed to fetch Spotify playlists:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching Spotify playlists:', error);
            }
        }
    };

    const fetchSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length > 0) {
            return playlist?.songs || [];
        }

        if (spotifyTokens?.access_token) {
            try {
                const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${spotifyTokens.access_token}`,
                        Accept: 'application/json',
                    },
                });

                if (res.ok) {
                    const data: SongsResponse = await res.json();
                    const fetchedSongs: Song[] = data.items.map((item: any) => ({
                        id: item.track.id,
                        title: item.track.name,
                        artist: item.track.artists[0].name,
                        thumbnails: {
                            default: item.track.album.images[0]?.url || '',
                            medium: item.track.album.images[0]?.url || '',
                            high: item.track.album.images[0]?.url || '',
                        },
                        artists: item.track.artists.map((artist: any) => artist.name),
                    }));
                    dispatch(setPlaylistSongs({ playlistId, songs: fetchedSongs }));

                    setPlaylists(prevPlaylists => prevPlaylists.map(p =>
                        p.id === playlistId ? { ...p, songs: fetchedSongs } : p
                    ));

                    return fetchedSongs;
                } else if (res.status === 401) { // Unauthorized
                    const refreshed = await refreshSpotifyTokens();
                    if (refreshed) {
                        return await fetchSongsForPlaylist(playlistId); // Retry with the new token
                    }
                } else {
                    console.error('Failed to fetch Spotify playlist songs:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching Spotify playlist songs:', error);
            }
        }

        return [];
    };

    return (
        <SpotifyContext.Provider
            value={{
                isSpotifyAuth,
                spotifyTokens,
                playlists,
                fetchSongsForPlaylist,
                logoutSpotify: handleLogoutSpotify,
                checkIfSpotifyAuthenticated,
                refreshSpotifyTokens,
            }}
        >
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotifyContext = () => useContext(SpotifyContext) as SpotifyContextType;
