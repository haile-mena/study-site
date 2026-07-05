import { Crown, User } from 'lucide-react';
import { useRoomContext } from '../context/RoomContext';

export default function ParticipantsList() {
  const { participants, room } = useRoomContext();

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Participants ({participants.length})
      </h2>
      <ul className="space-y-2">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2 text-sm text-gray-200"
          >
            {room?.host_id === p.id ? (
              <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span className={!p.socket_id ? 'text-gray-500' : ''}>
              {p.display_name}
            </span>
            {room?.host_id === p.id && (
              <span className="text-xs text-yellow-400/70 ml-auto">host</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}