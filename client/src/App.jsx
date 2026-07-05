import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import Room from './pages/Room';
import SessionEnded from './pages/SessionEnded';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/room" element={<Room />} />
            <Route path="/session-ended" element={<SessionEnded />} />
          </Routes>
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}