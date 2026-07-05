import { useState, useEffect, useCallback } from 'react';

export function useRoom(socketRef) {
  const [room, setRoom] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timer, setTimer] = useState({
    duration: 25 * 60 * 1000,
    remainingMs: 25 * 60 * 1000,
    startedAt: null,
    isRunning: false,
  });
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('participant-joined', ({ participant, message }) => {
      setParticipants((prev) => [...prev, participant]);
      if (message) setMessages((prev) => [...prev, message]);
    });

    socket.on('participant-left', ({ participantId: leftId, participants: updated, messages: msgs }) => {
      setParticipants(updated);
      setMessages(msgs);
    });

    socket.on('host-transferred', ({ newHostId, room: updatedRoom, messages: msgs }) => {
      setRoom(updatedRoom);
      setMessages(msgs);
    });

    socket.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('task-added', (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on('task-toggled', (updated) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

    socket.on('task-deleted', ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    socket.on('timer-sync', (timerState) => {
      setTimer(timerState);
    });

    socket.on('session-ended', () => {
      setSessionEnded(true);
    });

    return () => {
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('host-transferred');
      socket.off('chat-message');
      socket.off('task-added');
      socket.off('task-toggled');
      socket.off('task-deleted');
      socket.off('timer-sync');
      socket.off('session-ended');
    };
  }, [socketRef]);

  const createRoom = useCallback((roomName, displayName, userId = null) => {
    return new Promise((resolve) => {
      socketRef.current.emit('create-room', { roomName, displayName, userId }, (state) => {
        setRoom(state.room);
        setParticipantId(state.participantId);
        setParticipants(state.participants);
        setMessages(state.messages);
        setTasks(state.tasks);
        if (state.timer) setTimer(state.timer);
        resolve(state);
      });
    });
  }, [socketRef]);

  const joinRoom = useCallback((inviteCode, displayName, userId = null) => {
    return new Promise((resolve) => {
      socketRef.current.emit('join-room', { inviteCode, displayName, userId }, (state) => {
        if (state.error) {
          resolve(state);
          return;
        }
        setRoom(state.room);
        setParticipantId(state.participantId);
        setParticipants(state.participants);
        setMessages(state.messages);
        setTasks(state.tasks);
        if (state.timer) setTimer(state.timer);
        resolve(state);
      });
    });
  }, [socketRef]);

  const leaveRoom = useCallback(() => {
    socketRef.current.emit('leave-room');
    setRoom(null);
    setParticipantId(null);
    setParticipants([]);
    setMessages([]);
    setTasks([]);
  }, [socketRef]);

  const endSession = useCallback(() => {
    if (!room) return;
    socketRef.current.emit('end-session', { roomId: room.id });
  }, [socketRef, room]);

  const sendMessage = useCallback((text) => {
    if (!room) return;
    socketRef.current.emit('chat-send', { roomId: room.id, text });
  }, [socketRef, room]);

  const addTask = useCallback((text) => {
    if (!room) return;
    socketRef.current.emit('task-add', { roomId: room.id, text });
  }, [socketRef, room]);

  const toggleTask = useCallback((taskId) => {
    if (!room) return;
    socketRef.current.emit('task-toggle', { roomId: room.id, taskId });
  }, [socketRef, room]);

  const deleteTask = useCallback((taskId) => {
    if (!room) return;
    socketRef.current.emit('task-delete', { roomId: room.id, taskId });
  }, [socketRef, room]);

  const startTimer = useCallback(() => {
    if (!room) return;
    socketRef.current.emit('timer-start', { roomId: room.id });
  }, [socketRef, room]);

  const pauseTimer = useCallback(() => {
    if (!room) return;
    socketRef.current.emit('timer-pause', { roomId: room.id });
  }, [socketRef, room]);

  const resetTimer = useCallback((duration) => {
    if (!room) return;
    socketRef.current.emit('timer-reset', { roomId: room.id, duration });
  }, [socketRef, room]);

  const isHost = room && participantId && room.host_id === participantId;

  return {
    room,
    participantId,
    participants,
    messages,
    tasks,
    timer,
    sessionEnded,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    endSession,
    sendMessage,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}