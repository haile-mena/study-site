// pages/Room.jsx
// The main study room view. Shows the header (room name, invite code, leave/end buttons),
// a sidebar with participants and timer, and the task board and chat in the main area.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, DoorClosed, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useRoomContext } from '../context/RoomContext';
import ParticipantsList from '../components/ParticipantsList';
import Chat from '../components/Chat';
import Timer from '../components/Timer';
import TaskBoard from '../components/TaskBoard';

export default function Room() {
  const navigate = useNavigate();
  const { room, isHost, sessionEnded, leaveRoom, endSession } = useRoomContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate('/');
    }
  }, [room, navigate]);

  useEffect(() => {
    if (sessionEnded) {
      navigate('/session-ended');
    }
  }, [sessionEnded, navigate]);

  if (!room) return null;

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(room.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{room.name}</h1>
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> {room.invite_code}
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <button
                onClick={endSession}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                <DoorClosed className="w-4 h-4" /> End Session
              </button>
            )}
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Leave
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4 h-[calc(100vh-57px)]">
        {/* Left Sidebar */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          <ParticipantsList />
          <Timer />
        </div>

        {/* Center + Right */}
        <div className="col-span-9 flex flex-col gap-4 min-h-0">
          {/* Task Board */}
          <div className="flex-shrink-0">
            <TaskBoard />
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}