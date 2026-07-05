const roomService = require('../services/roomService');
const timerService = require('../services/timerService');
const Participant = require('../models/Participant');

module.exports = function roomEvents(io, socket) {
  socket.on('create-room', ({ roomName, displayName, userId }, callback) => {
    const result = roomService.createRoom(roomName, displayName, socket.id, userId || null);
    const { room, participant } = result;

    socket.join(room.id);
    const state = roomService.getRoomState(room.id);
    state.timer = timerService.getState(room.id);

    if (callback) callback({ ...state, participantId: participant.id });
  });

  socket.on('join-room', ({ inviteCode, displayName, userId }, callback) => {
    const result = roomService.joinRoom(inviteCode, displayName, socket.id, userId || null);

    if (result.error) {
      if (callback) callback({ error: result.error });
      return;
    }

    const { room, participant } = result;
    socket.join(room.id);

    // Broadcast to others in the room
    socket.to(room.id).emit('participant-joined', {
      participant,
      message: roomService.getRoomState(room.id).messages.slice(-1)[0],
    });

    const state = roomService.getRoomState(room.id);
    state.timer = timerService.getState(room.id);

    if (callback) callback({ ...state, participantId: participant.id });
  });

  socket.on('leave-room', () => {
    handleLeave(io, socket);
  });

  socket.on('end-session', ({ roomId }, callback) => {
    const participant = Participant.findBySocketId(socket.id);
    if (!participant) {
      if (callback) callback({ error: 'Not a participant' });
      return;
    }

    const result = roomService.endSession(roomId, participant.id);
    if (result.error) {
      if (callback) callback({ error: result.error });
      return;
    }

    io.to(roomId).emit('session-ended');
    timerService.remove(roomId);
    if (callback) callback({ success: true });
  });

  socket.on('disconnect', () => {
    handleLeave(io, socket);
  });
};

function handleLeave(io, socket) {
  const result = roomService.leaveRoom(socket.id);
  if (!result) return;

  const { room, participant, hostTransferred, newHost } = result;

  socket.leave(room.id);

  // Broadcast updated participant list and system messages
  const state = roomService.getRoomState(room.id);
  socket.to(room.id).emit('participant-left', {
    participantId: participant.id,
    participants: state.participants,
    messages: state.messages,
  });

  if (hostTransferred && newHost) {
    io.to(room.id).emit('host-transferred', {
      newHostId: newHost.id,
      room: state.room,
      messages: state.messages,
    });
  }
}
