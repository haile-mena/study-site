// components/SystemMessage.jsx
// Renders a centered italic system message (e.g. "User joined the room").

export default function SystemMessage({ text }) {
  return (
    <div className="text-center text-xs text-gray-400 italic py-1">
      {text}
    </div>
  );
}