import React, { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContextObject';

interface SocketProviderProps {
  children: React.ReactNode;
  currentUser?: { id?: string } | null;
}

import { SOCKET_URL } from '../config';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, currentUser }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const SOCKET_SERVER_URL = SOCKET_URL;

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

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_SERVER_URL, currentUser?.id]);

  const contextValue = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={contextValue as any}>
      {children}
    </SocketContext.Provider>
  );
};
