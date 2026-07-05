const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Participant = require('../models/Participant');
const { authenticateToken } = require('../middleware/auth');

// GET /api/rooms/user/sessions — get all rooms for logged-in user
router.get('/user/sessions', authenticateToken, (req, res) => {
  const rooms = Room.findByUserId(req.user.id);
  const sessionsWithCounts = rooms.map((room) => {
    const participants = Participant.findByRoomId(room.id);
    return {
      ...room,
      participantCount: participants.length,
    };
  });
  res.json({ sessions: sessionsWithCounts });
});

// GET /api/rooms/:code — check if a room exists by invite code
router.get('/:code', (req, res) => {
  const room = Room.findByInviteCode(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  if (room.status === 'ended') {
    return res.status(410).json({ error: 'Session has ended' });
  }

  const participants = Participant.findByRoomId(room.id);
  res.json({
    id: room.id,
    name: room.name,
    invite_code: room.invite_code,
    status: room.status,
    participantCount: participants.length,
  });
});

module.exports = router;
