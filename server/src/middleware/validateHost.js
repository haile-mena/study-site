const Room = require('../models/Room');
const Participant = require('../models/Participant');

// Socket.io middleware-style function to validate host-only actions
function validateHost(socket, roomId, callback) {
  const participant = Participant.findBySocketId(socket.id);
  if (!participant) {
    if (callback) callback({ error: 'Not a participant' });
    return false;
  }

  const room = Room.findById(roomId);
  if (!room) {
    if (callback) callback({ error: 'Room not found' });
    return false;
  }

  if (room.host_id !== participant.id) {
    if (callback) callback({ error: 'Only the host can perform this action' });
    return false;
  }

  return true;
}

module.exports = validateHost;
