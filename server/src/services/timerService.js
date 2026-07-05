// services/timerService.js
// In-memory timer state per room. Server is the source of truth (not persisted to DB).
// The timer stores a startedAt timestamp; clients compute remaining time from that.
// This avoids drift issues between client and server clocks.

const timers = new Map();

const DEFAULT_DURATION = 25 * 60 * 1000; // 25 minutes in ms

const timerService = {
  // Get or create the timer for a room (defaults to 25 min)
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

  // Start the timer — records the current timestamp
  start(roomId) {
    const timer = this.getTimer(roomId);
    if (timer.isRunning) return timer;
    timer.startedAt = Date.now();
    timer.isRunning = true;
    return timer;
  },

  // Pause the timer — calculates remaining time and stops
  pause(roomId) {
    const timer = this.getTimer(roomId);
    if (!timer.isRunning) return timer;
    const elapsed = Date.now() - timer.startedAt;
    timer.remainingMs = Math.max(0, timer.remainingMs - elapsed);
    timer.startedAt = null;
    timer.isRunning = false;
    return timer;
  },

  // Reset the timer to a specific duration (or default 25 min)
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

  // Get the current timer state (computes remaining time if running)
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

  // Clean up timer when a session ends
  remove(roomId) {
    timers.delete(roomId);
  },
};

module.exports = timerService;
