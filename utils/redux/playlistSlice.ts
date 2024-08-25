import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Playlist, Song } from '@/types';

interface PlaylistsState {
  google: {
    [playlistId: string]: Playlist;
  };
}

const initialState: PlaylistsState = {
  google: {},
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
    setPlaylistSongs(
      state,
      action: PayloadAction<{ playlistId: string; songs: Song[] }>
    ) {
      const playlist = state.google[action.payload.playlistId];
      if (playlist) {
        playlist.songs = action.payload.songs;
      }
    },
  },
});

export const { setGooglePlaylists, setPlaylistSongs } = playlistSlice.actions;
export default playlistSlice.reducer;
