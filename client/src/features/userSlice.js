import { createSlice } from '@reduxjs/toolkit'
import socket from '../config/socket';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: {},
        isLoggedIn: false,
    },
    reducers: {
        login(state, action) {
            if(!action.payload) return;
            state.user = action.payload;
            state.isLoggedIn = true;
            const date = new Date();
            const expiry = date.getTime() + (1000 * 60 * 60 * 24 * 30)
            socket.emit('addUser', action.payload._id)
            window.localStorage.setItem('expiry', expiry)
            window.localStorage.setItem('user', JSON.stringify(action.payload));
            window.localStorage.setItem('isLoggedIn', true);
        },
        logout(state) {
            state.user = {};
            state.isLoggedIn = false;
            socket.emit('logout')
            window.localStorage.removeItem('user');
            window.localStorage.removeItem('isLoggedIn');
            window.localStorage.removeItem('expiry');
        },
        setUser(state, action) {
            if(!state.user) return;
            state.user = action.payload;
            window.localStorage.setItem('user', JSON.stringify(action.payload));
        },
        setUserFavorites(state, action) {
            const user = state.user;
            user.favorites = action.payload;
            window.localStorage.setItem('user', JSON.stringify(user));
        }
    }
})


export const userActions = userSlice.actions;

export default userSlice;