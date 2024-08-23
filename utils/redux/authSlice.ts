// store/authSlice.ts
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
  otherTokens: Tokens | null;
}

const initialState: AuthState = {
  googleTokens: null,
  otherTokens: null,
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
    setOtherTokens(state, action: PayloadAction<Tokens>) {
      state.otherTokens = action.payload;
    },
    clearOtherTokens(state) {
      state.otherTokens = null;
    },
  },
});

export const { setGoogleTokens, clearGoogleTokens, setOtherTokens, clearOtherTokens } = authSlice.actions;
export default authSlice.reducer;
