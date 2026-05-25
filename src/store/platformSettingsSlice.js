import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchSettings = createAsyncThunk(
  'platformSettings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/platform-settings', {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch settings'
      );
    }
  }
);

export const uploadRawGuideImages = createAsyncThunk(
  'platformSettings/uploadRawGuideImages',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/platform-settings/raw-guide', formData, {
        withCredentials: true,
      });
      toast.success('Images uploaded successfully');
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload images';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteRawGuideImage = createAsyncThunk(
  'platformSettings/deleteRawGuideImage',
  async (filename, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/platform-settings/raw-guide/${filename}`, {
        withCredentials: true,
      });
      toast.success('Image deleted');
      return `/uploads/guides/raw/${filename}`;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete image';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const uploadMadeGuideImages = createAsyncThunk(
  'platformSettings/uploadMadeGuideImages',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/platform-settings/made-guide', formData, {
        withCredentials: true,
      });
      toast.success('Images uploaded successfully');
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload images';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteMadeGuideImage = createAsyncThunk(
  'platformSettings/deleteMadeGuideImage',
  async (filename, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/platform-settings/made-guide/${filename}`, {
        withCredentials: true,
      });
      toast.success('Image deleted');
      return `/uploads/guides/made/${filename}`;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete image';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const platformSettingsSlice = createSlice({
  name: 'platformSettings',
  initialState: {
    rawGuideImages: [],
    madeGuideImages: [],
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchSettings
    builder.addCase(fetchSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.rawGuideImages = action.payload?.rawMaterialGuide?.images || [];
      state.madeGuideImages = action.payload?.madeGuide?.images || [];
    });
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // uploadRawGuideImages
    builder.addCase(uploadRawGuideImages.pending, (state) => {
      state.uploading = true;
    });
    builder.addCase(uploadRawGuideImages.fulfilled, (state, action) => {
      state.uploading = false;
      state.rawGuideImages = action.payload?.rawMaterialGuide?.images || [];
    });
    builder.addCase(uploadRawGuideImages.rejected, (state) => {
      state.uploading = false;
    });

    // deleteRawGuideImage
    builder.addCase(deleteRawGuideImage.fulfilled, (state, action) => {
      const deletedUrl = action.payload;
      state.rawGuideImages = state.rawGuideImages.filter((url) => url !== deletedUrl);
    });

    // uploadMadeGuideImages
    builder.addCase(uploadMadeGuideImages.pending, (state) => {
      state.uploading = true;
    });
    builder.addCase(uploadMadeGuideImages.fulfilled, (state, action) => {
      state.uploading = false;
      state.madeGuideImages = action.payload?.madeGuide?.images || [];
    });
    builder.addCase(uploadMadeGuideImages.rejected, (state) => {
      state.uploading = false;
    });

    // deleteMadeGuideImage
    builder.addCase(deleteMadeGuideImage.fulfilled, (state, action) => {
      const deletedUrl = action.payload;
      state.madeGuideImages = state.madeGuideImages.filter((url) => url !== deletedUrl);
    });
  },
});

export default platformSettingsSlice.reducer;
