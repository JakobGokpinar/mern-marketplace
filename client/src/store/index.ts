import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import uiSlice from './uiSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
