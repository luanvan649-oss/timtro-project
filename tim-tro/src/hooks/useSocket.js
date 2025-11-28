import { useContext } from 'react';
import { SocketContext } from '../context/SocketContextObject';

export const useSocket = () => {
  return useContext(SocketContext);
};
