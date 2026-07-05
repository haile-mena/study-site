const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Task = {
  create(roomId, participantId, text) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO tasks (id, room_id, participant_id, text) VALUES (?, ?, ?, ?)'
    ).run(id, roomId, participantId, text);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM tasks WHERE room_id = ? ORDER BY created_at ASC'
    ).all(roomId);
  },

  toggle(id) {
    db.prepare(
      'UPDATE tasks SET is_complete = CASE WHEN is_complete = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id) {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },
};

module.exports = Task;
