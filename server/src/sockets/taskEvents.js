// sockets/taskEvents.js
// Handles task-add, task-toggle, and task-delete events.
// Each participant can only modify their own tasks (enforced server-side).

const Task = require('../models/Task');
const Participant = require('../models/Participant');

module.exports = function taskEvents(io, socket) {
  socket.on('task-add', ({ roomId, text }, callback) => {
    const participant = Participant.findBySocketId(socket.id);
    if (!participant) return;

    const task = Task.create(roomId, participant.id, text);
    io.to(roomId).emit('task-added', task);
    if (callback) callback(task);
  });

  socket.on('task-toggle', ({ roomId, taskId }, callback) => {
    const participant = Participant.findBySocketId(socket.id);
    if (!participant) return;

    const task = Task.findById(taskId);
    if (!task || task.participant_id !== participant.id) {
      if (callback) callback({ error: 'Unauthorized' });
      return;
    }

    const updated = Task.toggle(taskId);
    io.to(roomId).emit('task-toggled', updated);
    if (callback) callback(updated);
  });

  socket.on('task-delete', ({ roomId, taskId }, callback) => {
    const participant = Participant.findBySocketId(socket.id);
    if (!participant) return;

    const task = Task.findById(taskId);
    if (!task || task.participant_id !== participant.id) {
      if (callback) callback({ error: 'Unauthorized' });
      return;
    }

    Task.delete(taskId);
    io.to(roomId).emit('task-deleted', { taskId });
    if (callback) callback({ success: true });
  });
};
