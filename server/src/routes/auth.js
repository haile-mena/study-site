const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: 'Username, password, and display name are required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const existing = User.findByUsername(username.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create(username.toLowerCase(), passwordHash, displayName);
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = User.findByUsername(username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;

  res.json({ user: safeUser, token });
});

// GET /api/auth/me — get current user from token
router.get('/me', authenticateToken, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

module.exports = router;
