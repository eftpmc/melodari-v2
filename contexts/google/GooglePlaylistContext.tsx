// GooglePlaylistContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GooglePlaylist, GoogleSong, Playlist, Song } from '@/types';
import { googleApi } from '@/utils/google/api';
import { useGoogleAuthContext } from './GoogleAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabaseOperations } from '@/utils/supabase/operations';

interface GooglePlaylistContextType {
    playlists: Playlist[];
    fetchSongsForPlaylist: (playlistId: string) => Promise<Song[]>;
    convertPlaylistToGoogle: (playlist: Playlist) => Promise<boolean>;
    findGooglePlaylist: (title: string) => Promise<GooglePlaylist | null>;
    createGooglePlaylist: (title: string, description?: string) => Promise<GooglePlaylist | null>;
    matchSongsOnGoogle: (songs: Song[]) => Promise<GoogleSong[]>;
    addSongsToGooglePlaylist: (playlistId: string, songs: GoogleSong[]) => Promise<void>;
    refreshPlaylists: () => Promise<void>;
}

interface GooglePlaylistProviderProps {
    children: React.ReactNode;
}

export const GooglePlaylistContext = createContext<GooglePlaylistContextType | null>(null);

export const GooglePlaylistProvider = ({ children }: GooglePlaylistProviderProps) => {
    const { isGoogleAuth, googleTokens, googleUserId } = useGoogleAuthContext();
    const { googlePlaylists, updateGooglePlaylists, supabaseUserId, fetchUserProfile } = useProfile();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        if (isGoogleAuth) {
            loadPlaylists();
        }
    }, [isGoogleAuth]);

    const validatePlaylists = (playlists: Playlist[]): Playlist[] => {
        const uniquePlaylists: { [id: string]: Playlist } = {};
    
        playlists.forEach((playlist) => {
            if (!uniquePlaylists[playlist.id]) {
                uniquePlaylists[playlist.id] = playlist;
            } else {
                console.warn(`Duplicate playlist found: ${playlist.title}`);
                uniquePlaylists[playlist.id] = {
                    ...uniquePlaylists[playlist.id],
                    songs: [...uniquePlaylists[playlist.id].songs, ...playlist.songs],
                    platforms: Array.from(new Set([...uniquePlaylists[playlist.id].platforms, ...playlist.platforms])),
                };
            }
    
            if (!playlist.title || !playlist.id || !playlist.source) {
                console.error(`Playlist is missing essential information: ${playlist.id}`);
            }
        });
    
        return Object.values(uniquePlaylists);
    };

    const loadPlaylists = async () => {
        let validatedPlaylists: Playlist[] = [];

        if (Object.keys(googlePlaylists).length > 0) {
            validatedPlaylists = validatePlaylists(Object.values(googlePlaylists));
        }

        const fetchedPlaylists = await fetchGooglePlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);

            const mergedPlaylists = validatePlaylists([...validatedPlaylists, ...newValidatedPlaylists]);

            await updateGooglePlaylists(mergedPlaylists);
            setPlaylists(mergedPlaylists);
        } else {
            setPlaylists(validatedPlaylists);
        }
    };

    const refreshPlaylists = async () => {
        const fetchedPlaylists = await fetchGooglePlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);

            updateGooglePlaylists(newValidatedPlaylists)
            setPlaylists(newValidatedPlaylists);
        }
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

    const fetchSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
        const playlist = googlePlaylists.find((p: { id: string; }) => p.id === playlistId);

        if (playlist && playlist.songs.length > 0) {
            return playlist.songs;
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

                if (supabaseUserId) {
                    await supabaseOperations.updateGooglePlaylistSongs(supabaseUserId, playlistId, fetchedSongs);
                }

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
        <GooglePlaylistContext.Provider
            value={{
                playlists,
                fetchSongsForPlaylist,
                convertPlaylistToGoogle,
                findGooglePlaylist,
                createGooglePlaylist,
                matchSongsOnGoogle,
                addSongsToGooglePlaylist,
                refreshPlaylists,
            }}
        >
            {children}
        </GooglePlaylistContext.Provider>
    );
};

export const useGooglePlaylistContext = () => useContext(GooglePlaylistContext) as GooglePlaylistContextType;
