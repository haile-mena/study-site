const roomEvents = require('./roomEvents');
const chatEvents = require('./chatEvents');
const taskEvents = require('./taskEvents');
const timerEvents = require('./timerEvents');

module.exports = function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    roomEvents(io, socket);
    chatEvents(io, socket);
    taskEvents(io, socket);
    timerEvents(io, socket);
  });
};
