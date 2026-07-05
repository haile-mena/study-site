// components/TaskColumn.jsx
// A single participant's task list. Only the task owner can add, toggle, or delete tasks.

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useRoomContext } from '../context/RoomContext';

export default function TaskColumn({ participant, tasks }) {
  const { participantId, addTask, toggleTask, deleteTask } = useRoomContext();
  const [newTaskText, setNewTaskText] = useState('');
  const isOwner = participant.id === participantId;

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    addTask(trimmed);
    setNewTaskText('');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 min-w-[220px]">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 truncate">
        {participant.display_name}'s Tasks
      </h3>
      <ul className="space-y-2 mb-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 group">
            <button
              onClick={() => isOwner && toggleTask(task.id)}
              disabled={!isOwner}
              className="shrink-0"
            >
              {task.is_complete ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Circle className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <span
              className={`text-sm flex-1 ${
                task.is_complete ? 'line-through text-gray-500' : 'text-gray-200'
              }`}
            >
              {task.text}
            </span>
            {isOwner && (
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {isOwner && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}