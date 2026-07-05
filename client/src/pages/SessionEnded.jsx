// pages/SessionEnded.jsx
// Shown when the host ends a study session. Provides a button to go back home.

import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function SessionEnded() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Session Ended</h1>
        <p className="text-gray-400 mb-6">The host has ended this study session.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}