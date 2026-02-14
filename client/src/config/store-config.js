import { configureStore } from '@reduxjs/toolkit'
import userSlice from '../features/userSlice';
import uiSlice from '../features/uiSlice';
import appDataSlice from '../features/appDataSlice.js';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    ui: uiSlice.reducer,
    app: appDataSlice.reducer
  }
})

export default store;
