// server.js
// Entry point. Initializes the database, then starts the HTTP + WebSocket server.

const db = require('./src/db');

const PORT = process.env.PORT || 3001;

async function start() {
  await db.init();
  console.log('Database initialized');

  const { httpServer } = require('./src/app');

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
