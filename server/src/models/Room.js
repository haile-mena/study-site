const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const Room = {
  create(name, inviteCode) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO rooms (id, name, invite_code) VALUES (?, ?, ?)'
    ).run(id, name, inviteCode);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  },

  findByInviteCode(code) {
    return db.prepare('SELECT * FROM rooms WHERE invite_code = ?').get(code);
  },

  setHost(roomId, hostId) {
    db.prepare('UPDATE rooms SET host_id = ? WHERE id = ?').run(hostId, roomId);
  },

  setStatus(roomId, status) {
    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run(status, roomId);
  },

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
