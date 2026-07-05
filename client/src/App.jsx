// App.jsx
// Root component. Sets up routing and wraps the app in AuthProvider and RoomProvider.
// Routes: / (Home), /login, /room, /dashboard, /session-ended

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import Room from './pages/Room';
import SessionEnded from './pages/SessionEnded';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/room" element={<Room />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session-ended" element={<SessionEnded />} />
          </Routes>
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}