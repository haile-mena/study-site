import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useRoomContext } from '../context/RoomContext';
import SystemMessage from './SystemMessage';

export default function Chat() {
  const { messages, sendMessage } = useRoomContext();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <div className="bg-gray-800 rounded-xl flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide p-4 pb-2">
        Chat
      </h2>
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-1 min-h-0">
        {messages.map((msg) =>
          msg.type === 'system' ? (
            <SystemMessage key={msg.id} text={msg.text} />
          ) : (
            <div key={msg.id} className="text-sm">
              <span className="font-medium text-indigo-400">
                {msg.sender_name}
              </span>
              <span className="text-gray-300 ml-2">{msg.text}</span>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}