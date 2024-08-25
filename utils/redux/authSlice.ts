import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

interface AuthState {
  googleTokens: Tokens | null;
  spotifyTokens: Tokens | null;
}

const initialState: AuthState = {
  googleTokens: null,
  spotifyTokens: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setGoogleTokens(state, action: PayloadAction<Tokens>) {
      state.googleTokens = action.payload;
    },
    clearGoogleTokens(state) {
      state.googleTokens = null;
    },
    setSpotifyTokens(state, action: PayloadAction<Tokens>) {
      state.spotifyTokens = action.payload;
    },
    clearSpotifyTokens(state) {
      state.spotifyTokens = null;
    },
    logout(state) {
      state.googleTokens = null;
      state.spotifyTokens = null;
    },
  },
});

export const { setGoogleTokens, clearGoogleTokens, setSpotifyTokens, clearSpotifyTokens, logout } = authSlice.actions;
export default authSlice.reducer;
