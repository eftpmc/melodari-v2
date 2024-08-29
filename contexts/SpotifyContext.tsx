"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearSpotifyTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { clearSpotifyPlaylists, UpdateSpotifyPlaylists, UpdatePlaylistSongs } from '@/utils/redux/playlistSlice';
import { Playlist, Song, SpotifyPlaylist, SpotifyTrack, Tokens } from '@/types';

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
    findSpotifyPlaylist: (title: string) => Promise<SpotifyPlaylist | null>;
    createSpotifyPlaylist: (title: string, description?: string) => Promise<SpotifyPlaylist | null>;
    matchSongsOnSpotify: (songs: Song[]) => Promise<SpotifyTrack[]>;
    addSongsToSpotifyPlaylist: (playlistId: string, songs: SpotifyTrack[]) => Promise<void>;
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
                    // Check if the response status is 401 (Unauthorized), which indicates that the token might have expired or is invalid
                    if (res.status === 401) {
                        const refreshed = await refreshSpotifyTokens();
                        return refreshed;
                    } else {
                        console.error('Spotify token error:', res.statusText);
                        return false;
                    }
                }
    
                return res.ok; // If response is OK, the token is still valid
            } catch (error) {
                console.error('Error checking Spotify authentication:', (error as Error).message);
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
                        accountName: playlist.owner.display_name,
                        source: "spotify",
                        description: playlist.description,
                        thumbnails: {
                            default: playlist.images[0]?.url || '',
                            medium: playlist.images[0]?.url || '',
                            high: playlist.images[0]?.url || '',
                        },
                        songs: [], // songs will be loaded separately
                        platforms: ['spotify'], // Add Google to the platforms array
                    }));
                    dispatch(UpdateSpotifyPlaylists(transformedPlaylists));
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
                    dispatch(UpdatePlaylistSongs({ playlistId, songs: fetchedSongs }));

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

    const findSpotifyPlaylist = async (title: string): Promise<SpotifyPlaylist | null> => {
        if (!spotifyTokens?.access_token) return null;
    
        try {
            const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${spotifyTokens.access_token}`,
                    Accept: 'application/json',
                },
            });
    
            if (res.ok) {
                const data: PlaylistsResponse = await res.json();
                const playlist = data.items.find(pl => pl.name.toLowerCase() === title.toLowerCase());
    
                if (playlist) {
                    return {
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        images: playlist.images,
                        tracks: [], // Tracks will be fetched separately
                    } as SpotifyPlaylist;
                }
            } else {
                console.error('Failed to find Spotify playlist:', res.statusText);
            }
        } catch (error) {
            console.error('Error finding Spotify playlist:', error);
        }
    
        return null;
    };
    
    const createSpotifyPlaylist = async (title: string, description?: string): Promise<SpotifyPlaylist | null> => {
        if (!spotifyTokens?.access_token) return null;
    
        try {
            const userRes = await fetch(`https://api.spotify.com/v1/me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${spotifyTokens.access_token}`,
                    Accept: 'application/json',
                },
            });
    
            if (!userRes.ok) throw new Error('Failed to fetch Spotify user info');
    
            const user = await userRes.json();
            const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${spotifyTokens.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: title,
                    description: description || '',
                    public: false,
                }),
            });
    
            if (res.ok) {
                const playlist = await res.json();
                return {
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description,
                    images: playlist.images,
                    tracks: [],
                } as SpotifyPlaylist;
            } else {
                console.error('Failed to create Spotify playlist:', res.statusText);
            }
        } catch (error) {
            console.error('Error creating Spotify playlist:', error);
        }
    
        return null;
    };
    
    const matchSongsOnSpotify = async (songs: Song[]): Promise<SpotifyTrack[]> => {
        const matchedSongs: SpotifyTrack[] = [];
    
        for (const song of songs) {
            const matchedSong = await searchSongOnSpotify(song.title, song.artist);
            if (matchedSong) {
                matchedSongs.push(matchedSong);
            }
        }
    
        return matchedSongs;
    };
    
    const addSongsToSpotifyPlaylist = async (playlistId: string, songs: SpotifyTrack[]) => {
        if (!spotifyTokens?.access_token) return;
    
        try {
            const uris = songs.map(song => `spotify:track:${song.id}`);
            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${spotifyTokens.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uris,
                }),
            });
        } catch (error) {
            console.error('Error adding songs to Spotify playlist:', error);
        }
    };
    
    const searchSongOnSpotify = async (title: string, artist?: string): Promise<SpotifyTrack | null> => {
        if (!spotifyTokens?.access_token) return null;
    
        try {
            const query = artist ? `${title} ${artist}` : title;
            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${spotifyTokens.access_token}`,
                    Accept: 'application/json',
                },
            });
    
            if (res.ok) {
                const data = await res.json();
                if (data.tracks.items.length > 0) {
                    const track = data.tracks.items[0];
                    return {
                        id: track.id,
                        name: track.name,
                        album: track.album,
                        artists: track.artists,
                    } as SpotifyTrack;
                }
            } else {
                console.error('Failed to search for song on Spotify:', res.statusText);
            }
        } catch (error) {
            console.error('Error searching for song on Spotify:', error);
        }
    
        return null;
    };
    
    return (
        <SpotifyContext.Provider
            value={{
                isSpotifyAuth,
                spotifyTokens,
                playlists,
                fetchSongsForPlaylist,
                findSpotifyPlaylist,
                createSpotifyPlaylist,
                matchSongsOnSpotify,
                addSongsToSpotifyPlaylist,
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
