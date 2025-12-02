import { createContext } from 'react';

// Default context value has the same shape we provide from the provider
export const SocketContext = createContext({ socket: null });
