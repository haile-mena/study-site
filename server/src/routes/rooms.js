const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Participant = require('../models/Participant');

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
