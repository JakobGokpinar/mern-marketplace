import { useEffect } from 'react';
import socket from '../lib/socket';
import { useAppSelector } from '../store/hooks';

export const useSocket = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (isLoggedIn && user?._id) {
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
