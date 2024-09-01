"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpotifyPlaylist, SpotifyTrack, Playlist, Song } from '@/types';
import { spotifyApi } from '@/utils/spotify/api';
import { useSpotifyAuthContext } from './SpotifyAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabaseOperations } from '@/utils/supabase/operations';

interface SpotifyPlaylistContextType {
    playlists: Playlist[];
    fetchSongsForPlaylist: (playlistId: string) => Promise<Song[]>;
    convertPlaylistToSpotify: (playlist: Playlist) => Promise<boolean>;
    findSpotifyPlaylist: (title: string) => Promise<SpotifyPlaylist | null>;
    createSpotifyPlaylist: (title: string, description?: string) => Promise<SpotifyPlaylist | null>;
    matchSongsOnSpotify: (songs: Song[]) => Promise<SpotifyTrack[]>;
    addSongsToSpotifyPlaylist: (playlistId: string, songs: SpotifyTrack[]) => Promise<void>;
    refreshPlaylists: () => Promise<void>;
}

interface SpotifyPlaylistProviderProps {
    children: React.ReactNode;
}

export const SpotifyPlaylistContext = createContext<SpotifyPlaylistContextType | null>(null);

export const SpotifyPlaylistProvider = ({ children }: SpotifyPlaylistProviderProps) => {
    const { isSpotifyAuth, spotifyTokens } = useSpotifyAuthContext();
    const { spotifyPlaylists, updateSpotifyPlaylists, supabaseUserId } = useProfile();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        if (isSpotifyAuth) {
            loadPlaylists();
        }
    }, [isSpotifyAuth]);

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

        if (Object.keys(spotifyPlaylists).length > 0) {
            validatedPlaylists = validatePlaylists(Object.values(spotifyPlaylists));
        }

        const fetchedPlaylists = await fetchSpotifyPlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);

            const mergedPlaylists = validatePlaylists([...validatedPlaylists, ...newValidatedPlaylists]);

            setPlaylists(mergedPlaylists);

            await updateSpotifyPlaylists(validatedPlaylists);
        } else {
            setPlaylists(validatedPlaylists);
        }
    };

    const refreshPlaylists = async () => {
        const fetchedPlaylists = await fetchSpotifyPlaylists();
        if (fetchedPlaylists) {
            const newValidatedPlaylists = validatePlaylists(fetchedPlaylists);
            setPlaylists(newValidatedPlaylists);

            await updateSpotifyPlaylists(newValidatedPlaylists);
        }
    };

    const fetchSpotifyPlaylists = async (): Promise<Playlist[] | null> => {
        if (spotifyTokens?.access_token) {
            try {
                const data = await spotifyApi.getUserPlaylists(spotifyTokens.access_token);
                const transformedPlaylists: Playlist[] = data.items.map((playlist: any) => ({
                    id: playlist.id,
                    title: playlist.name,
                    accountName: playlist.owner.display_name,
                    source: "spotify",
                    description: playlist.description,
                    thumbnails: {
                        default: playlist.images[0]?.url,
                        medium: playlist.images[0]?.url,
                        high: playlist.images[0]?.url,
                    },
                    songs: [],
                    platforms: ['spotify'],
                }));
                return transformedPlaylists;
            } catch (error) {
                console.error('Error fetching Spotify playlists:', error);
            }
        }
        return null;
    };

    const fetchSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length > 0) {
            return playlist?.songs || [];
        }

        if (spotifyTokens?.access_token) {
            try {
                const data = await spotifyApi.getPlaylistTracks(spotifyTokens.access_token, playlistId);
                const fetchedSongs: Song[] = data.items.map((item: any) => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map((artist: any) => artist.name).join(', '),
                    thumbnails: {
                        default: item.track.album.images[2]?.url,
                        medium: item.track.album.images[1]?.url,
                        high: item.track.album.images[0]?.url,
                    },
                }));

                if (supabaseUserId){
                    await supabaseOperations.updateSpotifyPlaylistSongs(supabaseUserId, playlistId, fetchedSongs);
                }

                setPlaylists(prevPlaylists => prevPlaylists.map(p =>
                    p.id === playlistId ? { ...p, songs: fetchedSongs } : p
                ));

                return fetchedSongs;
            } catch (error) {
                console.error('Error fetching Spotify playlist songs:', error);
            }
        }

        return [];
    };

    const convertPlaylistToSpotify = async (playlist: Playlist): Promise<boolean> => {
        if (!spotifyTokens) return false;

        try {
            let existingPlaylist = await findSpotifyPlaylist(playlist.title);

            if (!existingPlaylist) {
                existingPlaylist = await createSpotifyPlaylist(playlist.title, playlist.description);
            }

            if (!existingPlaylist) return false;

            const matchedSongs = await matchSongsOnSpotify(playlist.songs);
            await addSongsToSpotifyPlaylist(existingPlaylist.id, matchedSongs);

            return true;
        } catch (error) {
            console.error('Error converting playlist to Spotify:', error);
            return false;
        }
    };

    const findSpotifyPlaylist = async (title: string): Promise<SpotifyPlaylist | null> => {
        if (!spotifyTokens?.access_token) return null;

        try {
            const data = await spotifyApi.getUserPlaylists(spotifyTokens.access_token);
            const playlist = data.items.find((pl: any) => pl.name.toLowerCase() === title.toLowerCase());

            if (playlist) {
                return {
                    id: playlist.id,
                    title: playlist.name,
                    description: playlist.description,
                    thumbnails: {
                        default: playlist.images[0]?.url,
                        medium: playlist.images[0]?.url,
                        high: playlist.images[0]?.url,
                    },
                    songs: [],
                } as SpotifyPlaylist;
            }
        } catch (error) {
            console.error('Error finding Spotify playlist:', error);
        }

        return null;
    };

    const createSpotifyPlaylist = async (title: string, description?: string): Promise<SpotifyPlaylist | null> => {
        if (!spotifyTokens?.access_token) return null;

        try {
            const playlist = await spotifyApi.createPlaylist(spotifyTokens.access_token, title, description || "");
            return {
                id: playlist.id,
                title: playlist.name,
                description: playlist.description,
                thumbnails: {
                    default: playlist.images[0]?.url,
                    medium: playlist.images[0]?.url,
                    high: playlist.images[0]?.url,
                },
                songs: [],
            } as SpotifyPlaylist;
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
            await spotifyApi.addTracksToPlaylist(spotifyTokens.access_token, playlistId, uris);
        } catch (error) {
            console.error('Error adding songs to Spotify playlist:', error);
        }
    };

    const searchSongOnSpotify = async (title: string, artist?: string): Promise<SpotifyTrack | null> => {
        if (!spotifyTokens?.access_token) return null;

        try {
            const query = artist ? `${title} ${artist}` : title;
            const data = await spotifyApi.searchTracks(spotifyTokens.access_token, query);
            if (data.tracks.items.length > 0) {
                const track = data.tracks.items[0];
                return {
                    id: track.id,
                    title: track.name,
                    artist: track.artists.map((artist: any) => artist.name).join(', '),
                    thumbnails: {
                        default: track.album.images[2]?.url,
                        medium: track.album.images[1]?.url,
                        high: track.album.images[0]?.url,
                    },
                } as SpotifyTrack;
            }
        } catch (error) {
            console.error('Error searching for song on Spotify:', error);
        }

        return null;
    };

    return (
        <SpotifyPlaylistContext.Provider
            value={{
                playlists,
                fetchSongsForPlaylist,
                convertPlaylistToSpotify,
                findSpotifyPlaylist,
                createSpotifyPlaylist,
                matchSongsOnSpotify,
                addSongsToSpotifyPlaylist,
                refreshPlaylists,
            }}
        >
            {children}
        </SpotifyPlaylistContext.Provider>
    );
};

export const useSpotifyPlaylistContext = () => useContext(SpotifyPlaylistContext) as SpotifyPlaylistContextType;
