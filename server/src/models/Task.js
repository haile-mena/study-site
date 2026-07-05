// models/Task.js
// Per-participant to-do items within a room.
// Only the task owner can toggle or delete their own tasks.

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Task = {
  // Add a new task for a participant
  create(roomId, participantId, text) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO tasks (id, room_id, participant_id, text) VALUES (?, ?, ?, ?)'
    ).run(id, roomId, participantId, text);
    return this.findById(id);
  },

  // Look up a task by ID
  findById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  // Get all tasks in a room (across all participants)
  findByRoomId(roomId) {
    return db.prepare(
      'SELECT * FROM tasks WHERE room_id = ? ORDER BY created_at ASC'
    ).all(roomId);
  },

  // Toggle a task between complete and incomplete
  toggle(id) {
    db.prepare(
      'UPDATE tasks SET is_complete = CASE WHEN is_complete = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  // Permanently delete a task
  delete(id) {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },
};

module.exports = Task;
