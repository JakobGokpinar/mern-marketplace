import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/user';
import socket from '../lib/socket';

interface UserState {
  user: User | Record<string, never>;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  user: {},
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      if (!action.payload) return;
      state.user = action.payload;
      state.isLoggedIn = true;
      const date = new Date();
      const expiry = date.getTime() + 1000 * 60 * 60 * 24 * 30;
      socket.emit('addUser', action.payload._id);
      window.localStorage.setItem('expiry', String(expiry));
      window.localStorage.setItem('user', JSON.stringify(action.payload));
      window.localStorage.setItem('isLoggedIn', 'true');
    },
    logout(state) {
      state.user = {};
      state.isLoggedIn = false;
      socket.emit('logout');
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('isLoggedIn');
      window.localStorage.removeItem('expiry');
    },
    setUser(state, action: PayloadAction<User>) {
      if (!state.user) return;
      state.user = action.payload;
      window.localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setUserFavorites(state, action: PayloadAction<string[]>) {
      const user = state.user as User;
      user.favorites = action.payload;
      window.localStorage.setItem('user', JSON.stringify(user));
    },
  },
});

export const userActions = userSlice.actions;

export default userSlice;
