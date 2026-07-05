// pages/Home.jsx
// Landing page. Users can create a new room or join an existing one by invite code.
// Shows sign-in/out for auth, pre-fills display name for logged-in users,
// and supports auto-rejoin when navigated from the Dashboard.

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useRoomContext } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createRoom, joinRoom } = useRoomContext();
  const { user, logout, loading: authLoading } = useAuth();

  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-rejoin from dashboard
  useEffect(() => {
    const code = location.state?.rejoinCode;
    if (code && user && !authLoading) {
      setLoading(true);
      joinRoom(code, user.display_name, user.id)
        .then((result) => {
          if (result.error) setError(result.error);
          else navigate('/room');
        })
        .catch(() => setError('Failed to rejoin room'))
        .finally(() => setLoading(false));
      // Clear the state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state, user, authLoading]);

  const effectiveDisplayName = user ? user.display_name : displayName.trim();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !effectiveDisplayName) return;
    setLoading(true);
    setError('');
    try {
      await createRoom(roomName.trim(), effectiveDisplayName, user?.id || null);
      navigate('/room');
    } catch {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim() || !effectiveDisplayName) return;
    setLoading(true);
    setError('');
    try {
      const result = await joinRoom(inviteCode.trim().toUpperCase(), effectiveDisplayName, user?.id || null);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/room');
      }
    } catch {
      setError('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Auth status bar */}
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Signed in as <span className="text-indigo-400 font-medium">{user.display_name}</span>
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> My Sessions
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Study Room</h1>
          <p className="text-gray-400 mt-2">Study together, in real time.</p>
        </div>

        {!mode ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Create a Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" /> Join a Room
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6">
            <button
              onClick={() => { setMode(null); setError(''); }}
              className="text-sm text-gray-400 hover:text-gray-300 mb-4 transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-xl font-semibold text-white mb-4">
              {mode === 'create' ? 'Create a Room' : 'Join a Room'}
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-4">
              {mode === 'create' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Study With Fiveable"
                    className="w-full bg-gray-700 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. ABC123"
                    className="w-full bg-gray-700 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 uppercase"
                    autoFocus
                  />
                </div>
              )}

              {user ? (
                <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-400">Joining as </span>
                  <span className="text-sm text-white font-medium">{user.display_name}</span>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Your Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Izzy"
                    className="w-full bg-gray-700 text-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Loading...' : mode === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}