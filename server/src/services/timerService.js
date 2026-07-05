// In-memory timer state per room
// Server is the source of truth for timer (see README design decision #1)
const timers = new Map();

const DEFAULT_DURATION = 25 * 60 * 1000; // 25 minutes in ms

const timerService = {
  getTimer(roomId) {
    if (!timers.has(roomId)) {
      timers.set(roomId, {
        duration: DEFAULT_DURATION,
        remainingMs: DEFAULT_DURATION,
        startedAt: null,
        isRunning: false,
      });
    }
    return timers.get(roomId);
  },

  start(roomId) {
    const timer = this.getTimer(roomId);
    if (timer.isRunning) return timer;
    timer.startedAt = Date.now();
    timer.isRunning = true;
    return timer;
  },

  pause(roomId) {
    const timer = this.getTimer(roomId);
    if (!timer.isRunning) return timer;
    const elapsed = Date.now() - timer.startedAt;
    timer.remainingMs = Math.max(0, timer.remainingMs - elapsed);
    timer.startedAt = null;
    timer.isRunning = false;
    return timer;
  },

  reset(roomId, duration) {
    const dur = duration || DEFAULT_DURATION;
    timers.set(roomId, {
      duration: dur,
      remainingMs: dur,
      startedAt: null,
      isRunning: false,
    });
    return timers.get(roomId);
  },

  getState(roomId) {
    const timer = this.getTimer(roomId);
    if (timer.isRunning) {
      const elapsed = Date.now() - timer.startedAt;
      return {
        ...timer,
        remainingMs: Math.max(0, timer.remainingMs - elapsed),
      };
    }
    return { ...timer };
  },

  remove(roomId) {
    timers.delete(roomId);
  },
};

module.exports = timerService;
