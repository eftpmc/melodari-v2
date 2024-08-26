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
  spotify: {},
};

const playlistSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    UpdateGooglePlaylists(state, action: PayloadAction<Playlist[]>) {
      action.payload.forEach((playlist) => {
        state.google[playlist.id] = {
          ...state.google[playlist.id], // Merge with existing playlist data if present
          ...playlist,
          songs: state.google[playlist.id]?.songs || [], // Preserve existing songs if already loaded
        };
      });
    },
    UpdateSpotifyPlaylists(state, action: PayloadAction<Playlist[]>) {
      action.payload.forEach((playlist) => {
        state.spotify[playlist.id] = {
          ...state.spotify[playlist.id],
          ...playlist,
          songs: state.spotify[playlist.id]?.songs || [],
        };
      });
    },
    UpdatePlaylistSongs(
      state,
      action: PayloadAction<{ playlistId: string; songs: Song[] }>
    ) {
      const googlePlaylist = state.google[action.payload.playlistId];
      const spotifyPlaylist = state.spotify[action.payload.playlistId];

      if (googlePlaylist) {
        googlePlaylist.songs = [...googlePlaylist.songs, ...action.payload.songs]; // Merge new songs with existing ones
      } else if (spotifyPlaylist) {
        spotifyPlaylist.songs = [...spotifyPlaylist.songs, ...action.payload.songs];
      }
    },
    clearGooglePlaylists(state) {
      state.google = {};
    },
    clearSpotifyPlaylists(state) {
      state.spotify = {};
    },
    clearAllPlaylists(state) {
      state.google = {};
      state.spotify = {};
    },
  },
});

export const {
  UpdateGooglePlaylists,
  UpdateSpotifyPlaylists,
  UpdatePlaylistSongs,
  clearGooglePlaylists,
  clearSpotifyPlaylists,
  clearAllPlaylists,
} = playlistSlice.actions;

export default playlistSlice.reducer;
