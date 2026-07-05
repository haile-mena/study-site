const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const User = {
  create(username, passwordHash, displayName) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO users (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)'
    ).run(id, username, passwordHash, displayName);
    return this.findById(id);
  },

  findById(id) {
    return db.prepare('SELECT id, username, display_name, created_at FROM users WHERE id = ?').get(id);
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
};

module.exports = User;
