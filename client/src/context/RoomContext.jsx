import { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const socketRef = useSocket();
  const roomState = useRoom(socketRef);

  return (
    <RoomContext.Provider value={roomState}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
}