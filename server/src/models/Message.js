const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Message = {
  create(roomId, senderName, text, type = 'chat') {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO messages (id, room_id, sender_name, text, type) VALUES (?, ?, ?, ?, ?)'
    ).run(id, roomId, senderName, text, type);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  },

  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC'
    ).all(roomId);
  },
};

module.exports = Message;
