import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Playlist, Song } from '@/types';

interface PlaylistsState {
  google: {
    [playlistId: string]: Playlist;
  };
  spotify: {
    [playlistId: string]: Playlist;
  };
}

const initialState: PlaylistsState = {
  google: {},
  spotify: {}, // Initialize with an empty object to avoid undefined issues
};

const playlistSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setGooglePlaylists(state, action: PayloadAction<Playlist[]>) {
      action.payload.forEach((playlist) => {
        state.google[playlist.id] = {
          ...playlist,
          songs: [], // Initialize with empty songs array
        };
      });
    },
    setSpotifyPlaylists(state, action: PayloadAction<Playlist[]>) {
      action.payload.forEach((playlist) => {
        state.spotify[playlist.id] = {
          ...playlist,
          songs: [], // Initialize with empty songs array
        };
      });
    },
    setPlaylistSongs(
      state,
      action: PayloadAction<{ playlistId: string; songs: Song[] }>
    ) {
      const googlePlaylist = state.google[action.payload.playlistId];
      const spotifyPlaylist = state.spotify[action.payload.playlistId];

      if (googlePlaylist) {
        googlePlaylist.songs = action.payload.songs;
      } else if (spotifyPlaylist) {
        spotifyPlaylist.songs = action.payload.songs;
      }
    },
    clearGooglePlaylists(state) {
      state.google = {}; // Clear all Google playlists
    },
    clearSpotifyPlaylists(state) {
      state.spotify = {}; // Clear all Spotify playlists
    },
    clearAllPlaylists(state) {
      state.google = {};
      state.spotify = {};
    },
  },
});

export const { setGooglePlaylists, setSpotifyPlaylists, setPlaylistSongs, clearGooglePlaylists, clearSpotifyPlaylists, clearAllPlaylists } = playlistSlice.actions;
export default playlistSlice.reducer;
