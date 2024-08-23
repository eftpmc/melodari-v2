// store/playlistsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {PlaylistItem} from '@/types'

interface PlaylistsState {
  google: PlaylistItem[];
  // Add other sources like Spotify, Apple Music, etc. in the future
}

const initialState: PlaylistsState = {
  google: [],
  // Add initial states for other sources here
};

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setGooglePlaylists(state, action: PayloadAction<PlaylistItem[]>) {
      state.google = action.payload;
    },
    clearGooglePlaylists(state) {
      state.google = [];
    },
    // Add reducers for other sources as needed
  },
});

export const { setGooglePlaylists, clearGooglePlaylists } = playlistsSlice.actions;
export default playlistsSlice.reducer;
