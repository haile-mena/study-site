const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Participant = {
  create(roomId, displayName, socketId, userId = null) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO participants (id, room_id, display_name, socket_id, user_id) VALUES (?, ?, ?, ?, ?)'
    ).run(id, roomId, displayName, socketId, userId);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM participants WHERE id = ?').get(id);
  },

  findBySocketId(socketId) {
    return db.prepare('SELECT * FROM participants WHERE socket_id = ?').get(socketId);
  },

  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND socket_id IS NOT NULL ORDER BY joined_at ASC'
    ).all(roomId);
  },

  findByRoomAndUser(roomId, userId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND user_id = ?'
    ).get(roomId, userId);
  },

  updateSocketId(id, socketId) {
    db.prepare('UPDATE participants SET socket_id = ? WHERE id = ?').run(socketId, id);
  },

  removeFromRoom(id) {
    db.prepare('UPDATE participants SET socket_id = NULL WHERE id = ?').run(id);
  },

  findNextHost(roomId, excludeId) {
    return db.prepare(
      'SELECT * FROM participants WHERE room_id = ? AND id != ? AND socket_id IS NOT NULL ORDER BY joined_at ASC LIMIT 1'
    ).get(roomId, excludeId);
  },
};

module.exports = Participant;
