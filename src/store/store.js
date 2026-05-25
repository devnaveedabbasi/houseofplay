import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import platformSettingsReducer from './platformSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    platformSettings: platformSettingsReducer,
  },
});
