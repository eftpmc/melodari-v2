"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { clearSpotifyTokens, setSpotifyTokens } from '@/utils/redux/authSlice';
import { clearSpotifyPlaylists, UpdateSpotifyPlaylists, UpdatePlaylistSongs } from '@/utils/redux/playlistSlice';
import { Playlist, Song, SpotifyPlaylist, SpotifyTrack, Tokens } from '@/types';
import { spotifyApi } from '@/utils/spotify/api';

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
    refreshPlaylists: () => Promise<void>;
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
                const newTokens = await spotifyApi.refreshToken(spotifyTokens.refresh_token);
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
                await spotifyApi.getCurrentUserProfile(spotifyTokens.access_token);
                return true;
            } catch (error) {
                if (error instanceof Error && error.message.includes('401')) {
                    const refreshed = await refreshSpotifyTokens();
                    return refreshed;
                }
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
                const data = await spotifyApi.getUserPlaylists(spotifyTokens.access_token);
                const transformedPlaylists = data.items.map((playlist: any) => ({
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
                    songs: [],
                    platforms: ['spotify'],
                }));
                dispatch(UpdateSpotifyPlaylists(transformedPlaylists));
                setPlaylists(transformedPlaylists);
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
                const data = await spotifyApi.getPlaylistTracks(spotifyTokens.access_token, playlistId);
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
            } catch (error) {
                console.error('Error fetching Spotify playlist songs:', error);
            }
        }

        return [];
    };

    const findSpotifyPlaylist = async (title: string): Promise<SpotifyPlaylist | null> => {
        if (!spotifyTokens?.access_token) return null;
    
        try {
            const data = await spotifyApi.getUserPlaylists(spotifyTokens.access_token);
            const playlist = data.items.find((pl: { name: string; }) => pl.name.toLowerCase() === title.toLowerCase());
    
            if (playlist) {
                return {
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description,
                    images: playlist.images,
                    tracks: [],
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
            const userProfile = await spotifyApi.getCurrentUserProfile(spotifyTokens.access_token);
            const playlist = await spotifyApi.createPlaylist(spotifyTokens.access_token, userProfile.id, title, description);
            return {
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                images: playlist.images,
                tracks: [],
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
                    name: track.name,
                    album: track.album,
                    artists: track.artists,
                } as SpotifyTrack;
            }
        } catch (error) {
            console.error('Error searching for song on Spotify:', error);
        }
    
        return null;
    };

    const refreshPlaylists = async () => {
        if (spotifyTokens?.access_token) {
            try {
                const data = await spotifyApi.getUserPlaylists(spotifyTokens.access_token);
                const transformedPlaylists = data.items.map((playlist: any) => ({
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
                    songs: [],
                    platforms: ['spotify'],
                }));
                dispatch(UpdateSpotifyPlaylists(transformedPlaylists));
                setPlaylists(transformedPlaylists);
            } catch (error) {
                console.error('Error fetching Spotify playlists:', error);
            }
        }
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
                refreshPlaylists,
            }}
        >
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotifyContext = () => useContext(SpotifyContext) as SpotifyContextType;