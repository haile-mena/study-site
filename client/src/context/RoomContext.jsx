// context/RoomContext.jsx
// Provides room state (participants, messages, tasks, timer, actions) to the entire app.
// Wraps useSocket and useRoom so any component can access room data via useRoomContext().

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