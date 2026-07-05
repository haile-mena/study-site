# Study Room App

## Overview
A real-time collaborative study room app (inspired by Hours by Fiveable, rebuilt from scratch). Users create or join a shared "room" where they can chat, manage individual task lists, and track time together with a shared timer. Supports both guest and registered user flows.

---

## Tech Stack
- **Frontend:** React (Vite) + TailwindCSS + Lucide icons
- **Backend:** Node.js + Express
- **Real-time:** Socket.io
- **Database:** SQLite via sql.js (pure JS, no native deps)
- **Auth:** JWT + bcrypt (username/password, no email required)

---

## Getting Started

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Start the server (port 3001)
cd server && node server.js

# 3. Start the client (port 5173, separate terminal)
cd client && npm run dev
```

The server auto-creates the SQLite database on first run at `server/data/study-room.db`.

---

## Features

### Rooms
- **Create** a room with a name → get a unique 6-character invite code
- **Join** by invite code → enter as guest or with your account
- **Host controls:** start/pause/reset timer, set custom duration, end session
- **Auto host transfer:** when the host leaves, the earliest remaining participant becomes host
- **Rooms persist** until explicitly ended by the host

### Authentication (optional)
- **Guest flow:** enter a display name and go — no account needed
- **Account flow:** register with username + password, then your display name is auto-filled
- **Reconnection:** logged-in users rejoin rooms with their original participant ID and host status preserved
- Passwords are hashed with bcrypt; JWTs expire after 7 days

### Dashboard (logged-in users only)
- View all sessions you've participated in
- Filter by active / ended
- Rejoin active sessions with one click

### Timer
- Server is the source of truth (stores `startedAt` timestamp, not seconds remaining)
- Host can choose preset durations (5, 15, 25, 45, 60 min) or enter a custom value
- All clients stay in sync via `timer-sync` socket events

### Chat
- Real-time messages broadcast to the room
- System messages for join/leave/host-transfer/session-end events

### Task Board
- Each participant has their own task column
- Only the owner can add, toggle, or delete their tasks
- All participants can view everyone's tasks (read-only)

---

## Key Design Decisions

1. **Server-authoritative timer.** Stores a `startedAt` timestamp rather than counting down. Clients compute remaining time from the timestamp — avoids drift and handles reconnects cleanly.

2. **Server-side authorization.** Host-only actions (timer, end session) are validated on the server, not just hidden in the UI. A participant manually emitting a `timer-start` event is rejected server-side.

3. **Deterministic host transfer.** Earliest `joined_at` among remaining connected participants becomes the new host.

4. **Soft-delete participants.** Leaving a room nulls the `socket_id` but keeps the row. This preserves session history for the dashboard and allows logged-in users to reconnect.

5. **Schema migrations.** The DB layer runs safe `ALTER TABLE` migrations on startup, so schema changes don't require deleting the database.

