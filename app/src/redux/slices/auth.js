import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /* =====================
       LOGIN / REFRESH
    ====================== */
    setCredentials: (state, action) => {
      const { accessToken, user } = action.payload;

      state.accessToken = accessToken;
      state.user = user || null;
      state.isAuthenticated = true;
      state.loading = false;
    },

    /* =====================
       LOGOUT
    ====================== */
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    /* =====================
       OPTIONAL UI HELPERS
    ====================== */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
} = auth.actions;

export default auth.reducer;
