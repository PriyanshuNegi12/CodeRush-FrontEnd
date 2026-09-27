import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// ---------- Register (handles BOTH step 1 "send OTP" and step 2 "verify OTP") ----------
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      // Step 1 response: { message: "OTP sent to your email" }
      // Step 2 response: { user: {...}, message: "Login Successfully" }
      return response.data;
    } catch (error) {
      const msg =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || error.message;
      return rejectWithValue(msg);
    }
  }
);

// ---------- Login ----------
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data?.user;
    } catch (error) {
      const msg =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || error.message;
      return rejectWithValue(msg);
    }
  }
);

// ---------- Check Auth ----------
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue(null); // no session — silent
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ---------- Logout ----------
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,      // drives register/login/logout button + spinner state
    checkingAuth: true,  // NEW — only true during the initial checkAuth() on app boot
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------- registerUser ----------
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Only authenticate on step 2 (when backend returns a user)
        if (action.payload?.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
        // step 1 (OTP sent): leave auth state untouched
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ---------- loginUser ----------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })

      // ---------- checkAuth ----------
      // NOTE: uses `checkingAuth`, NOT `loading` — this is the fix.
      // `loading` is shared with registerUser/loginUser, so if this used
      // `loading` too, App.jsx's top-level spinner gate (driven by `loading`)
      // would also fire during registerUser requests, unmounting whatever
      // page was showing (e.g. SignupPage) mid-request.
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.checkingAuth = false;
        state.error = action.payload || null;
        state.isAuthenticated = false;
        state.user = null;
      })

      // ---------- logoutUser ----------
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;