// models/User.js
// Handles registered user accounts (username/password auth).
// Passwords are stored as bcrypt hashes — never in plain text.

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const User = {
  // Create a new user account (password must already be hashed)
  create(username, passwordHash, displayName) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO users (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)'
    ).run(id, username, passwordHash, displayName);
    return this.findById(id);
  },

  // Find user by ID — intentionally excludes password_hash from result
  findById(id) {
    return db.prepare('SELECT id, username, display_name, created_at FROM users WHERE id = ?').get(id);
  },

  // Find user by username — includes password_hash (used for login verification)
  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
};

module.exports = User;
