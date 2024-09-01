import { Playlist } from "@/types";

export const validatePlaylists = (playlists: Playlist[]): Playlist[] => {
    const uniquePlaylists: { [id: string]: Playlist } = {};

    playlists.forEach((playlist) => {
        if (!uniquePlaylists[playlist.id]) {
            uniquePlaylists[playlist.id] = playlist;
        } else {
            console.warn(`Duplicate playlist found: ${playlist.title}`);
            // Merge the playlists
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