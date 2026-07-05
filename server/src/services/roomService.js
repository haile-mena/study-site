const Room = require('../models/Room');
const Participant = require('../models/Participant');
const Message = require('../models/Message');

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const roomService = {
  createRoom(roomName, displayName, socketId, userId = null) {
    const inviteCode = generateInviteCode();
    const room = Room.create(roomName, inviteCode);
    const participant = Participant.create(room.id, displayName, socketId, userId);
    Room.setHost(room.id, participant.id);

    Message.create(room.id, null, `${displayName} created the room`, 'system');

    return {
      room: Room.findById(room.id),
      participant,
    };
  },

  joinRoom(inviteCode, displayName, socketId, userId = null) {
    const room = Room.findByInviteCode(inviteCode);
    if (!room) return { error: 'Room not found' };
    if (room.status === 'ended') return { error: 'Session has ended' };

    // Reconnect logged-in user if they already have an active participant in this room
    if (userId) {
      const existing = Participant.findByRoomAndUser(room.id, userId);
      if (existing) {
        Participant.updateSocketId(existing.id, socketId);
        Message.create(room.id, null, `${existing.display_name} reconnected`, 'system');
        return { room, participant: Participant.findById(existing.id) };
      }
    }

    const participant = Participant.create(room.id, displayName, socketId, userId);
    Message.create(room.id, null, `${displayName} joined the room`, 'system');

    return {
      room,
      participant,
    };
  },

  leaveRoom(socketId, io) {
    const participant = Participant.findBySocketId(socketId);
    if (!participant) return null;

    const room = Room.findById(participant.room_id);
    if (!room) return null;

    Participant.removeFromRoom(participant.id);
    Message.create(room.id, null, `${participant.display_name} left the room`, 'system');

    const result = {
      room,
      participant,
      hostTransferred: false,
      newHost: null,
    };

    // If the leaving participant was the host, transfer host
    if (room.host_id === participant.id) {
      const nextHost = Participant.findNextHost(room.id, participant.id);
      if (nextHost) {
        Room.setHost(room.id, nextHost.id);
        Message.create(room.id, null, `Host role transferred to ${nextHost.display_name}`, 'system');
        result.hostTransferred = true;
        result.newHost = nextHost;
      } else {
        // No one left connected — clear host
        Room.setHost(room.id, null);
      }
    }

    return result;
  },

  endSession(roomId, participantId) {
    const room = Room.findById(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.host_id !== participantId) return { error: 'Only the host can end the session' };

    Room.setStatus(roomId, 'ended');
    Message.create(roomId, null, 'Session ended by host', 'system');

    return { success: true };
  },

  getRoomState(roomId) {
    const room = Room.findById(roomId);
    const participants = Participant.findByRoomId(roomId);
    const messages = Message.findByRoomId(roomId);
    const Task = require('../models/Task');
    const tasks = Task.findByRoomId(roomId);

    return { room, participants, messages, tasks };
  },
};

module.exports = roomService;
