import { useRoomContext } from '../context/RoomContext';
import TaskColumn from './TaskColumn';

export default function TaskBoard() {
  const { participants, tasks } = useRoomContext();

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Task Board
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {participants.map((p) => (
          <TaskColumn
            key={p.id}
            participant={p}
            tasks={tasks.filter((t) => t.participant_id === p.id)}
          />
        ))}
      </div>
    </div>
  );
}