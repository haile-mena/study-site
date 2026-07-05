const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'study-room-secret-change-me';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, display_name: user.display_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

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

// Optional auth — sets req.user if token present, but doesn't block
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
