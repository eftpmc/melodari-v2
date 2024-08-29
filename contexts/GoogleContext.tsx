"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, setGoogleTokens } from '@/utils/redux/authSlice';
import { clearGooglePlaylists, UpdateGooglePlaylists, UpdatePlaylistSongs } from '@/utils/redux/playlistSlice';
import { GooglePlaylist, GoogleSong, Playlist, Song, Tokens } from '@/types';

interface PlaylistsResponse {
    items: any[];
}

interface SongsResponse {
    items: any[];
}

interface GoogleContextType {
    isGoogleAuth: boolean;
    googleUserId: string | null;
    googleTokens: Tokens | null;
    playlists: Playlist[];
    fetchSongsForPlaylist: (playlistId: string) => Promise<Song[]>;
    convertPlaylistToGoogle: (playlist: Playlist) => Promise<boolean>;
    logoutGoogle: () => void;
    checkIfGoogleAuthenticated: () => Promise<boolean>;
    refreshGoogleTokens: () => Promise<boolean>;
    fetchGoogleUserId: () => Promise<string | null>;
    findGooglePlaylist: (title: string) => Promise<GooglePlaylist | null>;
    createGooglePlaylist: (title: string, description?: string) => Promise<GooglePlaylist | null>;
    matchSongsOnGoogle: (songs: Song[]) => Promise<GoogleSong[]>;
    addSongsToGooglePlaylist: (playlistId: string, songs: GoogleSong[]) => Promise<void>;
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
    const [googleUserId, setGoogleUserId] = useState<string | null>(null);

    useEffect(() => {
        setIsGoogleAuth(isGoogleAuthenticated);
    }, [isGoogleAuthenticated]);

    useEffect(() => {
        if (isGoogleAuth) {
            loadPlaylists();
        }
    }, [isGoogleAuth]);

    useEffect(() => {
        if (isGoogleAuth && googleTokens) {
            fetchGoogleUserId();
        }
    }, [isGoogleAuth, googleTokens]);

    const fetchGoogleUserId = async (): Promise<string | null> => {
        if (googleTokens?.access_token) {
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${googleTokens.access_token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch Google user ID');
                }

                const userInfo = await response.json();
                setGoogleUserId(userInfo.id); // Assuming the user ID is available under `id`
                return userInfo.id;
            } catch (error) {
                console.error('Error fetching Google user ID:', error);
                return null;
            }
        }
        return null;
    };

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
                    // Only refresh if the error is specifically related to an expired token
                    if (data.error === "invalid_token" || data.error === "token_expired") {
                        const refreshed = await refreshGoogleTokens();
                        return refreshed;
                    } else {
                        console.error('Google token error:', data.error);
                        return false;
                    }
                }

                // Ensure the token is still valid and not near expiration
                return data.expires_in > 0;
            } catch (error) {
                console.error('Error checking Google authentication:', (error as Error).message);
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
                        platforms: ['google'], // Add Google to the platforms array
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

        // Validate and add stored playlists
        if (Object.keys(storedGooglePlaylists).length > 0) {
            validatedPlaylists = validatePlaylists(Object.values(storedGooglePlaylists));
        }

        // Fetch and validate new playlists
        const fetchedPlaylists = await fetchGooglePlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);

            // Merge playlists ensuring no duplicates
            const mergedPlaylists = validatePlaylists([...validatedPlaylists, ...newValidatedPlaylists]);

            // Update state and store with the final list of unique playlists
            dispatch(UpdateGooglePlaylists(mergedPlaylists));
            setPlaylists(mergedPlaylists);
        } else {
            // If no new playlists are fetched, use the stored ones
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

    const convertPlaylistToGoogle = async (playlist: Playlist): Promise<boolean> => {
        if (!googleTokens) return false;

        try {
            // Check if the playlist already exists on YouTube Music by title
            let existingPlaylist = await findGooglePlaylist(playlist.title);

            if (!existingPlaylist) {
                // Create a new playlist on YouTube Music
                existingPlaylist = await createGooglePlaylist(playlist.title, playlist.description);
            }

            if (!existingPlaylist) return false;

            // Match songs between platforms and add them to the YouTube Music playlist
            const matchedSongs = await matchSongsOnGoogle(playlist.songs);
            await addSongsToGooglePlaylist(existingPlaylist.id, matchedSongs);

            return true;
        } catch (error) {
            console.error('Error converting playlist to Google:', error);
            return false;
        }
    };

    const findGooglePlaylist = async (title: string): Promise<GooglePlaylist | null> => {
        if (!googleTokens?.access_token) return null;

        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${googleTokens.access_token}`,
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                const data: PlaylistsResponse = await res.json();
                const playlist = data.items.find((pl) => pl.snippet.title.toLowerCase() === title.toLowerCase());

                if (playlist) {
                    return {
                        id: playlist.id,
                        title: playlist.snippet.title,
                        description: playlist.snippet.description,
                        thumbnails: {
                            default: playlist.snippet.thumbnails.default.url,
                            medium: playlist.snippet.thumbnails.medium.url,
                            high: playlist.snippet.thumbnails.high.url,
                        },
                        songs: [], // Songs will be fetched separately
                    } as GooglePlaylist;
                }
            } else {
                console.error('Failed to find Google playlist:', res.statusText);
            }
        } catch (error) {
            console.error('Error finding Google playlist:', error);
        }

        return null;
    };

    const createGooglePlaylist = async (title: string, description?: string): Promise<GooglePlaylist | null> => {
        if (!googleTokens?.access_token) return null;

        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleTokens.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    snippet: {
                        title: title,
                        description: description || '',
                    },
                }),
            });

            if (res.ok) {
                const playlist = await res.json();
                return {
                    id: playlist.id,
                    title: playlist.snippet.title,
                    description: playlist.snippet.description,
                    thumbnails: {
                        default: playlist.snippet.thumbnails.default.url,
                        medium: playlist.snippet.thumbnails.medium.url,
                        high: playlist.snippet.thumbnails.high.url,
                    },
                    songs: [],
                } as GooglePlaylist;
            } else {
                console.error('Failed to create Google playlist:', res.statusText);
            }
        } catch (error) {
            console.error('Error creating Google playlist:', error);
        }

        return null;
    };

    const matchSongsOnGoogle = async (songs: Song[]): Promise<GoogleSong[]> => {
        const matchedSongs: GoogleSong[] = [];

        for (const song of songs) {
            const matchedSong = await searchSongOnGoogle(song.title, song.artist);
            if (matchedSong) {
                matchedSongs.push(matchedSong);
            }
        }

        return matchedSongs;
    };

    const addSongsToGooglePlaylist = async (playlistId: string, songs: GoogleSong[]) => {
        if (!googleTokens?.access_token) return;

        try {
            for (const song of songs) {
                await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${googleTokens.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        snippet: {
                            playlistId: playlistId,
                            resourceId: {
                                kind: 'youtube#video',
                                videoId: song.id,
                            },
                        },
                    }),
                });
            }
        } catch (error) {
            console.error('Error adding songs to Google playlist:', error);
        }
    };

    const searchSongOnGoogle = async (title: string, artist?: string): Promise<GoogleSong | null> => {
        if (!googleTokens?.access_token) return null;

        try {
            const query = artist ? `${title} ${artist}` : title;
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${googleTokens.access_token}`,
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.items.length > 0) {
                    const video = data.items[0];
                    return {
                        id: video.id.videoId,
                        title: video.snippet.title,
                        videoId: video.id.videoId,
                        thumbnails: {
                            default: video.snippet.thumbnails.default.url,
                            medium: video.snippet.thumbnails.medium.url,
                            high: video.snippet.thumbnails.high.url,
                        },
                    } as GoogleSong;
                }
            } else {
                console.error('Failed to search for song on Google:', res.statusText);
            }
        } catch (error) {
            console.error('Error searching for song on Google:', error);
        }

        return null;
    };

    return (
        <GoogleContext.Provider
            value={{
                isGoogleAuth,
                googleUserId,
                googleTokens,
                playlists,
                fetchSongsForPlaylist,
                convertPlaylistToGoogle,
                logoutGoogle: handleLogoutGoogle,
                checkIfGoogleAuthenticated,
                refreshGoogleTokens,
                fetchGoogleUserId,
                findGooglePlaylist,
                createGooglePlaylist,
                matchSongsOnGoogle,
                addSongsToGooglePlaylist,
            }}
        >
            {children}
        </GoogleContext.Provider>
    );
};

export const useGoogleContext = () => useContext(GoogleContext) as GoogleContextType;