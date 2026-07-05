// models/Message.js
// Chat messages and system events within a room.
// type='chat' for user messages, type='system' for join/leave/host-transfer notifications.

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Message = {
  // Create a message (senderName is null for system messages)
  create(roomId, senderName, text, type = 'chat') {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO messages (id, room_id, sender_name, text, type) VALUES (?, ?, ?, ?, ?)'
    ).run(id, roomId, senderName, text, type);
    return this.findById(id);
  },

  // Look up a message by ID
  findById(id) {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  },

  // Get all messages in a room, oldest first
  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC'
    ).all(roomId);
  },
};

module.exports = Message;
