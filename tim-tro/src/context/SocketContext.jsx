import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './SocketContextObject';

export const SocketProvider = ({ children, currentUser }) => {
  const [socket, setSocket] = useState(null);
  const SOCKET_SERVER_URL = 'http://localhost:3002';

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server', newSocket.id);
      if (currentUser && currentUser.id) {
        newSocket.emit('registerUser', currentUser.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_SERVER_URL, currentUser?.id]);

  const contextValue = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
