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

      const onReconnect = () => {
        socket.emit('addUser', user._id);
      };
      socket.on('connect', onReconnect);

      return () => {
        socket.off('connect', onReconnect);
      };
    } else {
      socket.emit('logout');
      socket.disconnect();
      return;
    }
  }, [isLoggedIn, user]);

  return socket;
};
