// middleware/auth.js
// JWT-based authentication for REST routes.
// Provides token generation, required auth, and optional auth middleware.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'study-room-secret-change-me';

// Create a JWT token containing the user's id, username, and display_name (expires in 7 days)
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, display_name: user.display_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Express middleware — blocks the request if no valid token is provided
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Express middleware — sets req.user if a valid token is present, but doesn't block guests
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore invalid tokens
    }
  }
  next();
}

module.exports = { generateToken, authenticateToken, optionalAuth, JWT_SECRET };
