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
