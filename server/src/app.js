// app.js
// Sets up the Express app, HTTP server, and Socket.io.
// Mounts REST routes (/api/auth, /api/rooms) and registers socket event handlers.

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const roomsRouter = require('./routes/rooms');
const authRouter = require('./routes/auth');
const registerSocketHandlers = require('./sockets');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// In production, serve the built React app from ../client/dist
const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');

// Middleware
app.use(cors());
app.use(express.json());

// REST routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the React static build and handle client-side routing
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Register socket handlers
registerSocketHandlers(io);

module.exports = { app, httpServer, io };
