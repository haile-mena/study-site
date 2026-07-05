const timerService = require('../services/timerService');
const validateHost = require('../middleware/validateHost');

module.exports = function timerEvents(io, socket) {
  socket.on('timer-start', ({ roomId }, callback) => {
    if (!validateHost(socket, roomId, callback)) return;

    const timer = timerService.start(roomId);
    io.to(roomId).emit('timer-sync', timerService.getState(roomId));
    if (callback) callback(timer);
  });

  socket.on('timer-pause', ({ roomId }, callback) => {
    if (!validateHost(socket, roomId, callback)) return;

    const timer = timerService.pause(roomId);
    io.to(roomId).emit('timer-sync', timerService.getState(roomId));
    if (callback) callback(timer);
  });

  socket.on('timer-reset', ({ roomId, duration }, callback) => {
    if (!validateHost(socket, roomId, callback)) return;

    const timer = timerService.reset(roomId, duration);
    io.to(roomId).emit('timer-sync', timerService.getState(roomId));
    if (callback) callback(timer);
  });

  socket.on('timer-get', ({ roomId }, callback) => {
    const state = timerService.getState(roomId);
    if (callback) callback(state);
  });
};
