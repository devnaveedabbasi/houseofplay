import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const createTheme = createAsyncThunk(
  'theme/createTheme',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/themes', formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Theme added successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add theme');
      return rejectWithValue(error.response?.data?.message || 'Failed to add theme');
    }
  }
);

export const fetchThemes = createAsyncThunk(
  'theme/fetchThemes',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/themes?page=${page}&limit=${limit}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // { themes, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch themes');
    }
  }
);

export const fetchThemeById = createAsyncThunk(
  'theme/fetchThemeById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/themes/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch theme');
    }
  }
);

export const updateTheme = createAsyncThunk(
  'theme/updateTheme',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/themes/${id}`, formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Theme updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update theme');
      return rejectWithValue(error.response?.data?.message || 'Failed to update theme');
    }
  }
);

export const deleteTheme = createAsyncThunk(
  'theme/deleteTheme',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/api/themes/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Theme deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete theme');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete theme');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  themes: [],
  selectedTheme: null,
  loading: false,
  error: null,
  success: false,
  pagination: { total: 0, page: 1, pages: 1 }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // createTheme
    builder.addCase(createTheme.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(createTheme.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createTheme.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // fetchThemes
    builder.addCase(fetchThemes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchThemes.fulfilled, (state, action) => {
      state.loading = false;
      state.themes = action.payload.themes;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    });
    builder.addCase(fetchThemes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchThemeById
    builder.addCase(fetchThemeById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchThemeById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTheme = action.payload;
    });
    builder.addCase(fetchThemeById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateTheme
    builder.addCase(updateTheme.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(updateTheme.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedTheme = action.payload;
    });
    builder.addCase(updateTheme.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // deleteTheme
    builder.addCase(deleteTheme.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteTheme.fulfilled, (state, action) => {
      state.loading = false;
      state.themes = state.themes.filter(t => t._id !== action.payload);
    });
    builder.addCase(deleteTheme.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearSuccess, clearError } = themeSlice.actions;
export default themeSlice.reducer;
