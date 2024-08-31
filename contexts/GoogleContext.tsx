"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearGoogleTokens, setGoogleTokens } from '@/utils/redux/authSlice';
import { clearGooglePlaylists, UpdateGooglePlaylists, UpdatePlaylistSongs } from '@/utils/redux/playlistSlice';
import { GooglePlaylist, GoogleSong, Playlist, Song, Tokens } from '@/types';
import { googleApi } from '@/utils/google/api';

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
    refreshPlaylists: () => Promise<void>;
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
                const userInfo = await googleApi.getCurrentUserProfile(googleTokens.access_token);
                setGoogleUserId(userInfo.id);
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
                const newTokens = await googleApi.refreshToken(googleTokens.refresh_token);
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
                const userInfo = await googleApi.getCurrentUserProfile(googleTokens.access_token);
                return true;
            } catch (error) {
                if (error instanceof Error && error.message.includes('401')) {
                    const refreshed = await refreshGoogleTokens();
                    return refreshed;
                }
                console.error('Error checking Google authentication:', error);
                return false;
            }
        }
        return false;
    };

    const fetchGooglePlaylists = async (): Promise<Playlist[] | null> => {
        if (googleTokens?.access_token) {
            try {
                const data = await googleApi.getUserPlaylists(googleTokens.access_token);
                const transformedPlaylists: Playlist[] = data.items.map((playlist: any) => ({
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
                    songs: [],
                    platforms: ['google'],
                }));
                return transformedPlaylists;
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

            if (!playlist.title || !playlist.id || !playlist.source) {
                console.error(`Playlist is missing essential information: ${playlist.id}`);
            }
        });

        return Object.values(uniquePlaylists);
    };

    const loadPlaylists = async () => {
        let validatedPlaylists: Playlist[] = [];

        if (Object.keys(storedGooglePlaylists).length > 0) {
            validatedPlaylists = validatePlaylists(Object.values(storedGooglePlaylists));
        }

        const fetchedPlaylists = await fetchGooglePlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);

            const mergedPlaylists = validatePlaylists([...validatedPlaylists, ...newValidatedPlaylists]);

            dispatch(UpdateGooglePlaylists(mergedPlaylists));
            setPlaylists(mergedPlaylists);
        } else {
            setPlaylists(validatedPlaylists);
        }
    };

    const refreshPlaylists = async () => {
        const fetchedPlaylists = await fetchGooglePlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);
            dispatch(UpdateGooglePlaylists(newValidatedPlaylists));
            setPlaylists(newValidatedPlaylists);
        }
    };

    const fetchSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length > 0) {
            return playlist?.songs || [];
        }

        if (googleTokens?.access_token) {
            try {
                const data = await googleApi.getPlaylistItems(googleTokens.access_token, playlistId);
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
            } catch (error) {
                console.error('Error fetching Google playlist songs:', error);
            }
        }

        return [];
    };

    const convertPlaylistToGoogle = async (playlist: Playlist): Promise<boolean> => {
        if (!googleTokens) return false;

        try {
            let existingPlaylist = await findGooglePlaylist(playlist.title);

            if (!existingPlaylist) {
                existingPlaylist = await createGooglePlaylist(playlist.title, playlist.description);
            }

            if (!existingPlaylist) return false;

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
            const data = await googleApi.getUserPlaylists(googleTokens.access_token);
            const playlist = data.items.find((pl: any) => pl.snippet.title.toLowerCase() === title.toLowerCase());

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
                    songs: [],
                } as GooglePlaylist;
            }
        } catch (error) {
            console.error('Error finding Google playlist:', error);
        }

        return null;
    };

    const createGooglePlaylist = async (title: string, description?: string): Promise<GooglePlaylist | null> => {
        if (!googleTokens?.access_token) return null;

        try {
            const playlist = await googleApi.createPlaylist(googleTokens.access_token, title, description);
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
                await googleApi.addVideoToPlaylist(googleTokens.access_token, playlistId, song.id);
            }
        } catch (error) {
            console.error('Error adding songs to Google playlist:', error);
        }
    };

    const searchSongOnGoogle = async (title: string, artist?: string): Promise<GoogleSong | null> => {
        if (!googleTokens?.access_token) return null;

        try {
            const query = artist ? `${title} ${artist}` : title;
            const data = await googleApi.searchVideos(googleTokens.access_token, query);
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
                refreshPlaylists,
            }}
        >
            {children}
        </GoogleContext.Provider>
    );
};

export const useGoogleContext = () => useContext(GoogleContext) as GoogleContextType;