import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSuppliers = createAsyncThunk(
  'rawMaterial/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/suppliers');
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // array of suppliers
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'rawMaterial/createSupplier',
  async (name, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/api/suppliers', { name });
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Supplier added successfully');
      dispatch(fetchSuppliers()); // refresh suppliers list
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add supplier');
      return rejectWithValue(error.response?.data?.message || 'Failed to add supplier');
    }
  }
);

export const createRawMaterial = createAsyncThunk(
  'rawMaterial/createRawMaterial',
  async (formData, { rejectWithValue }) => {
    try {
      // formData is sent natively without specifying Content-Type, 
      // axios and browser will automatically set it to multipart/form-data with boundary
      const { data } = await axiosInstance.post('/api/raw-materials', formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Raw material added successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add raw material');
      return rejectWithValue(error.response?.data?.message || 'Failed to add raw material');
    }
  }
);

export const fetchRawMaterials = createAsyncThunk(
  'rawMaterial/fetchRawMaterials',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/raw-materials?page=${page}&limit=${limit}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // { rawMaterials, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch raw materials');
    }
  }
);

export const fetchRawMaterialById = createAsyncThunk(
  'rawMaterial/fetchRawMaterialById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/raw-materials/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch raw material');
    }
  }
);

export const updateRawMaterial = createAsyncThunk(
  'rawMaterial/updateRawMaterial',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/raw-materials/${id}`, formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Raw material updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update raw material');
      return rejectWithValue(error.response?.data?.message || 'Failed to update raw material');
    }
  }
);

export const deleteRawMaterial = createAsyncThunk(
  'rawMaterial/deleteRawMaterial',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/api/raw-materials/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Raw material deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete raw material');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete raw material');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  rawMaterials: [],
  selectedRawMaterial: null,
  suppliers: [],
  loading: false,
  error: null,
  success: false,
  pagination: { total: 0, page: 1, pages: 1 }
};

const rawMaterialSlice = createSlice({
  name: 'rawMaterial',
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
    // fetchSuppliers
    builder.addCase(fetchSuppliers.fulfilled, (state, action) => {
      state.suppliers = action.payload;
    });

    // createSupplier
    builder.addCase(createSupplier.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createSupplier.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createSupplier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // createRawMaterial
    builder.addCase(createRawMaterial.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(createRawMaterial.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createRawMaterial.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // fetchRawMaterials
    builder.addCase(fetchRawMaterials.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRawMaterials.fulfilled, (state, action) => {
      state.loading = false;
      state.rawMaterials = action.payload.rawMaterials;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    });
    builder.addCase(fetchRawMaterials.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchRawMaterialById
    builder.addCase(fetchRawMaterialById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRawMaterialById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedRawMaterial = action.payload;
    });
    builder.addCase(fetchRawMaterialById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateRawMaterial
    builder.addCase(updateRawMaterial.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(updateRawMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedRawMaterial = action.payload;
    });
    builder.addCase(updateRawMaterial.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // deleteRawMaterial
    builder.addCase(deleteRawMaterial.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteRawMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.rawMaterials = state.rawMaterials.filter(rm => rm._id !== action.payload);
    });
    builder.addCase(deleteRawMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearSuccess, clearError } = rawMaterialSlice.actions;
export default rawMaterialSlice.reducer;
