CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  host_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  socket_id TEXT,
  user_id TEXT,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_name TEXT,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'chat',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
