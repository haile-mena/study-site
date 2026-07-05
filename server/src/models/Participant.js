// models/Participant.js
// Manages people in rooms. Each participant has a socket_id (null when disconnected)
// and an optional user_id (null for guests, set for logged-in users).

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Participant = {
  // Add a new participant to a room
  create(roomId, displayName, socketId, userId = null) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO participants (id, room_id, display_name, socket_id, user_id) VALUES (?, ?, ?, ?, ?)'
    ).run(id, roomId, displayName, socketId, userId);
    return this.findById(id);
  },

  // Look up a participant by ID
  findById(id) {
    return db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
  },

  // Find the participant associated with a socket connection
  findBySocketId(socketId) {
    return db.prepare('SELECT * FROM participants WHERE socket_id = ?').get(socketId);
  },

  // Get all currently connected participants in a room
  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND socket_id IS NOT NULL ORDER BY joined_at ASC'
    ).all(roomId);
  },

  // Find an existing participant for a logged-in user (for reconnection)
  findByRoomAndUser(roomId, userId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND user_id = ?'
    ).get(roomId, userId);
  },

  // Update the socket connection for a participant (used on reconnect)
  updateSocketId(id, socketId) {
    db.prepare('UPDATE participants SET socket_id = ? WHERE id = ?').run(socketId, id);
  },

  // Disconnect a participant (soft delete — nulls socket, keeps the row for history)
  removeFromRoom(id) {
    db.prepare('UPDATE participants SET socket_id = NULL WHERE id = ?').run(id);
  },

  // Find the next connected participant to transfer host to
  findNextHost(roomId, excludeId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND id != ? AND socket_id IS NOT NULL ORDER BY joined_at ASC LIMIT 1'
    ).get(roomId, excludeId);
  },
};

module.exports = Participant;
