import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';

// ─── Token helpers (localStorage + middleware cookie) ─────────────────────────

/**
 * Persist token so:
 *  1. axiosInstance interceptor can attach it as Authorization header
 *  2. Next.js middleware (edge) can read it from the cookie to protect pages
 */
function saveToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  // Set a regular (non-httpOnly) cookie so Next.js middleware can read it
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  // Expire the middleware cookie
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Login — POST /api/auth/login
 * On success, token is in response body → store in localStorage.
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/auth/login', credentials);

      if (!data.success) {
        return rejectWithValue({
          statusCode: data.statusCode,
          message: data.message,
          requiresVerification: data.data?.requiresVerification ?? false,
          email: data.data?.email,
        });
      }

      // Save token to localStorage + cookie for middleware
      if (data.data?.token) {
        saveToken(data.data.token);
      }

      return data.data; // { user, token }
    } catch (error) {
      const errData = error.response?.data;
      return rejectWithValue({
        statusCode: error.response?.status,
        message: errData?.message || error.message || 'Login failed.',
        requiresVerification: errData?.data?.requiresVerification ?? false,
        email: errData?.data?.email,
      });
    }
  }
);

/**
 * Logout — POST /api/auth/logout
 * Sends token via Authorization header (axiosInstance interceptor handles it).
 * Clears localStorage + cookie on success.
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/auth/logout');
      if (!data.success) return rejectWithValue(data.message);
      clearToken();
      return null;
    } catch (error) {
      // Even if the API call fails, clear the local token
      clearToken();
      return rejectWithValue(error.response?.data?.message || 'Logout failed.');
    }
  }
);

/**
 * Fetch current user — GET /api/auth/me
 * Token is sent automatically by axiosInstance interceptor.
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/auth/me');
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // { user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user.');
    }
  }
);

/**
 * Set credentials directly (used after OTP verification to avoid
 * an extra /me round-trip when we already have user + token).
 */
export const setCredentials = (userData, token) => (dispatch) => {
  if (token) saveToken(token);
  dispatch(authSlice.actions._setUser(userData));
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    requiresVerification: false,
    verificationEmail: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVerification: (state) => {
      state.requiresVerification = false;
      state.verificationEmail = null;
    },
    // Internal — used by setCredentials thunk above
    _setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────────────────
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.requiresVerification = false;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message ?? 'Login failed.';
      state.requiresVerification = action.payload?.requiresVerification ?? false;
      state.verificationEmail = action.payload?.email ?? null;
    });

    // ── Logout ─────────────────────────────────────────────────────────────
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state) => {
      // Still clear auth state even if API call failed
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });

    // ── Fetch Current User ─────────────────────────────────────────────────
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    });
  },
});

export const { clearError, clearVerification } = authSlice.actions;
export default authSlice.reducer;
