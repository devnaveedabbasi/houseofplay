import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSuppliers = createAsyncThunk(
  'product/fetchSuppliers',
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
  'product/createSupplier',
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

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      // formData is sent natively without specifying Content-Type, 
      // axios and browser will automatically set it to multipart/form-data with boundary
      const { data } = await axiosInstance.post('/api/products', formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Product added successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async ({ page = 1, limit = 10, filters = {}, sort = {} } = {}, { rejectWithValue }) => {
    try {
      let url = `/api/products?page=${page}&limit=${limit}`;
      
      if (filters.type) url += `&type=${filters.type}`;
      if (filters.productName) url += `&productName=${encodeURIComponent(filters.productName)}`;
      if (filters.productCode) url += `&productCode=${encodeURIComponent(filters.productCode)}`;
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.supplier) url += `&supplier=${encodeURIComponent(filters.supplier)}`;

      if (sort.field) url += `&sortField=${encodeURIComponent(sort.field)}`;
      if (sort.order) url += `&sortOrder=${encodeURIComponent(sort.order)}`;
      
      const { data } = await axiosInstance.get(url);
      if (!data.success) return rejectWithValue(data.message);
      return data.data; // { products, total, page, pages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/products/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/products/${id}`, formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Product updated successfully');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/api/products/${id}`);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Product deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  'product/updateProductStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      const { data } = await axiosInstance.put(`/api/products/${id}`, formData);
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success('Product status updated successfully');
      return data.data; // updated product
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update product status');
    }
  }
);

export const bulkUpdateProductStatus = createAsyncThunk(
  'product/bulkUpdateProductStatus',
  async ({ productIds, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch('/api/products/bulk', { productIds, status });
      if (!data.success) return rejectWithValue(data.message);
      
      toast.success(`${data.data.updatedCount} products updated to ${status}`);
      return { productIds, status };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bulk update products');
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update products');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  products: [],
  selectedProduct: null,
  suppliers: [],
  loading: false,
  error: null,
  success: false,
  pagination: { total: 0, page: 1, pages: 1 }
};

const productSlice = createSlice({
  name: 'product',
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

    // createProduct
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchProductById
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateProduct
    builder.addCase(updateProduct.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedProduct = action.payload;
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    });

    // deleteProduct
    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products = state.products.filter(rm => rm._id !== action.payload);
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // updateProductStatus
    builder.addCase(updateProductStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateProductStatus.fulfilled, (state, action) => {
      state.loading = false;
      const updatedProduct = action.payload;
      const index = state.products.findIndex(p => p._id === updatedProduct._id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
    });
    builder.addCase(updateProductStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // bulkUpdateProductStatus
    builder.addCase(bulkUpdateProductStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(bulkUpdateProductStatus.fulfilled, (state, action) => {
      state.loading = false;
      const { productIds, status } = action.payload;
      state.products.forEach(product => {
        if (productIds.includes(product._id)) {
          product.status = status;
        }
      });
    });
    builder.addCase(bulkUpdateProductStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearSuccess, clearError } = productSlice.actions;
export default productSlice.reducer;
