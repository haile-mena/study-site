// components/Timer.jsx
// Displays the countdown timer. Host sees start/pause/reset controls and a duration picker.
// Non-hosts see a read-only timer. Syncs with server via socket events.

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useRoomContext } from '../context/RoomContext';
import { formatTime } from '../utils/formatTime';

const PRESETS = [5, 15, 25, 45, 60];

export default function Timer() {
  const { timer, isHost, startTimer, pauseTimer, resetTimer } = useRoomContext();
  const [display, setDisplay] = useState(timer.remainingMs);
  const [showPicker, setShowPicker] = useState(false);
  const [customMin, setCustomMin] = useState('');

  useEffect(() => {
    if (!timer.isRunning) {
      setDisplay(timer.remainingMs);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - timer.startedAt;
      setDisplay(Math.max(0, timer.remainingMs - elapsed));
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [timer]);

  const setDuration = (minutes) => {
    resetTimer(minutes * 60 * 1000);
    setShowPicker(false);
    setCustomMin('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(customMin, 10);
    if (mins > 0 && mins <= 180) {
      setDuration(mins);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <div className="text-5xl font-mono font-bold text-white mb-4">
        {formatTime(display)}
      </div>
      {isHost ? (
        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            {timer.isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Play className="w-4 h-4" /> Start
              </button>
            )}
            <button
              onClick={() => resetTimer()}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          {!timer.isRunning && (
            <div>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                {showPicker ? 'Hide' : 'Set Duration'}
              </button>

              {showPicker && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {PRESETS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setDuration(m)}
                        className="bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleCustomSubmit} className="flex gap-2 justify-center">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      placeholder="Min"
                      className="w-20 bg-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 text-center"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Set
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Only the host can control the timer</p>
      )}
    </div>
  );
}