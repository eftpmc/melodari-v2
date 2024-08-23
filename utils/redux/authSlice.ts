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
  tokens: Tokens | null;
}

const initialState: AuthState = {
  tokens: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Tokens>) {
      state.tokens = action.payload;
    },
    clearTokens(state) {
      state.tokens = null;
    },
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export default authSlice.reducer;
