# Study Room App — Project Spec

## Overview
A real-time collaborative study room app (inspired by a now-defunct product Hours by Fiveable, rebuilt from scratch). Users create or join a shared "room" where they can chat, manage individual task lists, and track time together with a shared timer.

**Why this project:** demonstrates real-time state sync across multiple clients, permission/authorization logic, and graceful handling of disconnects — all common topics in technical interviews and directly relevant to maintenance/support-style engineering roles.

---

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Real-time layer:** Socket.io
- **Database:** SQLite to start (can upgrade to PostgreSQL later)
- **Hosting:** Render or Railway (backend + websockets), Vercel or Render (frontend)

---

## User Journey

### 1. Home / Landing
- **Create room:** enter room name + your display name → you become the **host**
- **Join room:** via invite link or code, enter your display name → you become a **participant**

### 2. Inside the Room
All users see:
- Participants list (host marked with an icon)
- Chat panel
- Shared timer
- Task board (one column per participant)

Permissions differ by role:
| Feature | Host | Participant |
|---|---|---|
| Timer controls (start/pause/reset) | ✅ | ❌ (read-only view) |
| End Session | ✅ | ❌ |
| Add/edit/delete own tasks | ✅ | ✅ |
| View others' tasks | ✅ | ✅ (read-only) |
| Send chat messages | ✅ | ✅ |

### 3. Leaving vs. Ending
- **Participant leaves:** removed from participant list; room persists; they (or anyone with the link) can rejoin later, tasks/chat history intact.
- **Host leaves without ending session:** host role **automatically transfers** to the remaining participant with the **earliest `joined_at` timestamp**.
- **Host clicks "End Session":** room is archived/marked ended; all participants are redirected to a "session ended" screen.
- **Room becomes empty:** it simply persists with no host until someone rejoins via the invite link (no auto-deletion).

### 4. System Messages
Chat log includes system-generated messages for room events, e.g.:
- "Izzy joined the room"
- "Triplecs left the room"
- "Host role transferred to Izzy"
- "Session ended by host"

---

## Data Model (rough shape)

**rooms**
| field | type | notes |
|---|---|---|
| id | string/uuid | primary key |
| name | string | e.g. "Study With Fiveable" |
| invite_code | string | shareable code/slug |
| host_id | string | FK → participants.id |
| status | enum | `active` \| `ended` |
| created_at | timestamp | |

**participants**
| field | type | notes |
|---|---|---|
| id | string/uuid | primary key |
| room_id | string | FK → rooms.id |
| display_name | string | |
| socket_id | string | current socket connection (nullable if disconnected) |
| joined_at | timestamp | used for host-transfer tiebreak |

**tasks**
| field | type | notes |
|---|---|---|
| id | string/uuid | primary key |
| room_id | string | FK → rooms.id |
| participant_id | string | FK → participants.id (owner) |
| text | string | |
| is_complete | boolean | |
| created_at | timestamp | |

**messages**
| field | type | notes |
|---|---|---|
| id | string/uuid | primary key |
| room_id | string | FK → rooms.id |
| sender_name | string | null/system for system messages |
| text | string | |
| type | enum | `chat` \| `system` |
| created_at | timestamp | |

---

## Socket.io Events

| Event | Direction | Notes |
|---|---|---|
| `create-room` | client → server | returns room id + invite code |
| `join-room` | client → server | adds participant, broadcasts to room |
| `leave-room` | client → server | removes participant, may trigger host transfer |
| `host-transferred` | server → clients | broadcast when host role changes |
| `end-session` | client → server | **host-only**; archives room, kicks everyone |
| `task-add` / `task-toggle` / `task-delete` | both | scoped to owner's own tasks |
| `chat-send` | both | broadcasts chat message to room |
| `timer-start` / `timer-pause` / `timer-reset` | client → server | **host-only**, server-validated |
| `timer-sync` | server → clients | keeps all clients in sync |

---

## Key Design Decisions (worth highlighting in interviews / README)

1. **Server is the source of truth for the timer.** Store a `startedAt` timestamp on the server rather than "seconds remaining." Clients compute remaining time from the timestamp — this avoids client-side drift and handles reconnects cleanly.

2. **Server-side authorization, not just UI hiding.** Host-only actions (timer control, end session) are validated on the server, not just hidden in the frontend. A participant manually emitting a `timer-start` event should still be rejected server-side.

3. **Host-transfer tiebreak rule:** earliest `joined_at` among remaining participants becomes the new host. Deterministic, simple to implement, easy to explain.

4. **Rooms persist by default.** Sessions aren't ephemeral — only explicit "End Session" by the host archives a room. This was a deliberate choice to support people naturally coming and going from a long study session.

---

## Suggested Build Order

1. Static UI with hardcoded/fake data (get the layout right first)
2. Backend + REST endpoints for room creation/joining (in-memory storage, no DB yet)
3. Real-time chat via Socket.io (simplest real-time feature — proof of concept)
4. Real-time timer sync (host-only controls, server-side timestamp logic)
5. Real-time task lists per participant
6. Host-transfer logic on disconnect
7. Add persistence (SQLite)
8. Deploy, write README, polish
