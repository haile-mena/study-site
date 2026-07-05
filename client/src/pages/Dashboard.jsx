// pages/Dashboard.jsx
// Shows all study sessions a logged-in user has participated in.
// Filterable by active/ended status. Active sessions have a "Rejoin" button.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/api/rooms/user/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  const filtered = sessions.filter((s) => {
    if (filter === 'active') return s.status === 'active';
    if (filter === 'ended') return s.status === 'ended';
    return true;
  });

  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const endedCount = sessions.filter((s) => s.status === 'ended').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">My Sessions</h1>
          </div>
          <span className="text-sm text-gray-400">
            {user?.display_name}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: sessions.length },
            { key: 'active', label: 'Active', count: activeCount },
            { key: 'ended', label: 'Ended', count: endedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'all'
                ? "You haven't joined any sessions yet."
                : `No ${filter} sessions.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => (
              <div
                key={session.id}
                className="bg-gray-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      session.status === 'active' ? 'bg-green-600/20' : 'bg-gray-700'
                    }`}
                  >
                    <BookOpen
                      className={`w-5 h-5 ${
                        session.status === 'active' ? 'text-green-400' : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{session.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Circle
                          className={`w-2 h-2 fill-current ${
                            session.status === 'active' ? 'text-green-400' : 'text-gray-600'
                          }`}
                        />
                        {session.status === 'active' ? 'Active' : 'Ended'}
                      </span>
                      {session.status === 'active' && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {session.participantCount} online
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {session.invite_code}
                      </span>
                    </div>
                  </div>
                </div>

                {session.status === 'active' && (
                  <button
                    onClick={() => navigate('/', { state: { rejoinCode: session.invite_code } })}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    Rejoin
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
