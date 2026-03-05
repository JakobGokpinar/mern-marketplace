import { useEffect } from 'react';
import socket from '../lib/socket';
import { useAppSelector } from '../store/hooks';
import type { User } from '../types/user';

export const useSocket = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const user = useAppSelector((state) => state.user.user) as User | Record<string, never>;

  useEffect(() => {
    if (isLoggedIn && '_id' in user && user._id) {
      socket.connect();
      socket.emit('addUser', user._id);
    } else {
      socket.emit('logout');
      socket.disconnect();
    }

    return () => {
      if (!isLoggedIn) {
        socket.disconnect();
      }
    };
  }, [isLoggedIn, user]);

  return socket;
};
