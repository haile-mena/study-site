// models/Room.js
// CRUD operations for study rooms.
// Each room has a unique invite code, a host, and a status (active/ended).

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Room = {
  // Create a new room with a generated invite code
  create(name, inviteCode) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO rooms (id, name, invite_code) VALUES (?, ?, ?)'
    ).run(id, name, inviteCode);
    return this.findById(id);
  },

  // Look up a room by its UUID
  findById(id) {
    return db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  },

  // Look up a room by its 6-character invite code
  findByInviteCode(code) {
    return db.prepare('SELECT * FROM rooms WHERE invite_code = ?').get(code);
  },

  // Update who the host is (hostId = participant.id)
  setHost(roomId, hostId) {
    db.prepare('UPDATE rooms SET host_id = ? WHERE id = ?').run(hostId, roomId);
  },

  // Change room status ('active' or 'ended')
  setStatus(roomId, status) {
    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run(status, roomId);
  },

  // Get all rooms a user has ever participated in (for the dashboard)
  findByUserId(userId) {
    return db.prepare(
      `SELECT DISTINCT r.* FROM rooms r
       INNER JOIN participants p ON p.room_id = r.id
       WHERE p.user_id = ?
       ORDER BY r.created_at DESC`
    ).all(userId);
  },
};

module.exports = Room;
