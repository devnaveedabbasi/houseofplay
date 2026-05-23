import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import rawMaterialReducer from './rawMaterialSlice';
import themeReducer from './themeSlice';
import externalReducer from './externalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rawMaterial: rawMaterialReducer,
    theme: themeReducer,
    external: externalReducer,
  },
});
