import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const createExternal = createAsyncThunk(
  'external/createExternal',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/externals', formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('External added successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add external');
      return rejectWithValue(error.response?.data?.message || 'Failed to add external');
    }
  }
);

export const fetchExternals = createAsyncThunk(
  'external/fetchExternals',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/externals?page=${page}&limit=${limit}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // { externals, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch externals');
    }
  }
);

export const fetchExternalById = createAsyncThunk(
  'external/fetchExternalById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/externals/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch external');
    }
  }
);

export const updateExternal = createAsyncThunk(
  'external/updateExternal',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/externals/${id}`, formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('External updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update external');
      return rejectWithValue(error.response?.data?.message || 'Failed to update external');
    }
  }
);

export const deleteExternal = createAsyncThunk(
  'external/deleteExternal',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/api/externals/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('External deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete external');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete external');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  externals: [],
  selectedExternal: null,
  loading: false,
  error: null,
  success: false,
  pagination: { total: 0, page: 1, pages: 1 }
};

const externalSlice = createSlice({
  name: 'external',
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
    // createExternal
    builder.addCase(createExternal.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(createExternal.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createExternal.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // fetchExternals
    builder.addCase(fetchExternals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchExternals.fulfilled, (state, action) => {
      state.loading = false;
      state.externals = action.payload.externals;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    });
    builder.addCase(fetchExternals.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchExternalById
    builder.addCase(fetchExternalById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchExternalById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedExternal = action.payload;
    });
    builder.addCase(fetchExternalById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateExternal
    builder.addCase(updateExternal.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(updateExternal.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedExternal = action.payload;
    });
    builder.addCase(updateExternal.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // deleteExternal
    builder.addCase(deleteExternal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteExternal.fulfilled, (state, action) => {
      state.loading = false;
      state.externals = state.externals.filter(e => e._id !== action.payload);
    });
    builder.addCase(deleteExternal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearSuccess, clearError } = externalSlice.actions;
export default externalSlice.reducer;
