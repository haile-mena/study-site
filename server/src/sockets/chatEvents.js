// sockets/chatEvents.js
// Handles the 'chat-send' event. Saves the message to DB and broadcasts to all room members.

const Message = require('../models/Message');
const Participant = require('../models/Participant');

module.exports = function chatEvents(io, socket) {
  socket.on('chat-send', ({ roomId, text }, callback) => {
    const participant = Participant.findBySocketId(socket.id);
    if (!participant) return;

    const message = Message.create(roomId, participant.display_name, text, 'chat');

    io.to(roomId).emit('chat-message', message);
    if (callback) callback(message);
  });
};
