const express = require('express');
const cors = require('cors');
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

// Register socket handlers
registerSocketHandlers(io);

module.exports = { app, httpServer, io };
