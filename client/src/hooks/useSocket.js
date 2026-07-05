// hooks/useSocket.js
// Creates and manages a single Socket.io connection to the server.
// Returns a ref to the socket instance. Automatically disconnects on unmount.

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// In production (single-service deploy), connect to same origin; in dev, use localhost:3001
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}