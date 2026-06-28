# 🎭 Multiplayer Hide & Seek

A real-time multiplayer **Hide & Seek** game built with **React**, **Phaser 4**, and **Socket.IO**. Players join a shared room, choose a map, and compete in fast-paced rounds — one player hunts as the **Seeker**, the rest try to survive as **Hiders**.

---

## ✨ Features

- 🔴 **Real-time multiplayer** via Socket.IO (WebSockets)
- 🗺️ **3 unique maps** — Forest, Maze, School
- 👥 **Lobby system** — Create/Join rooms with a 6-character room code
- ✅ **Ready-up flow** — Game only starts when all players are ready
- 🎮 **Phaser 4 game engine** — Smooth tilemap rendering & physics
- 🏆 **In-memory score tracking** — Points persist per session across rounds
- 📊 **Results screen** — Post-round overlay showing survivors, caught players & leaderboard
- 🔁 **Play Again / Leave Room** — Seamless lobby-to-game-to-lobby flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7 |
| Game Engine | Phaser 4 |
| Networking | Socket.IO Client |
| Build Tool | Vite 8 |
| Backend | Node.js, Express |
| Real-time | Socket.IO Server |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### 1. Clone the Repository

```bash
git clone https://github.com/SrijaniBanerjee-prog/Multiplayer-hide-and-seek.git
cd Multiplayer-hide-and-seek
```

### 2. Start the Server

```bash
cd server
npm install
npm run dev
```

The server starts on **port 3001**.

### 3. Start the Client

In a new terminal, from the project root:

```bash
npm install
npm run dev
```

The client starts on **http://localhost:5173**.

---

## 🎮 How to Play

1. **Open** `http://localhost:5173` in two browser windows (to simulate two players).
2. **Create a Room** in Window 1 — a 6-character room code is generated.
3. **Join the Room** in Window 2 using the room code.
4. **Select a Map** (host only) and click **Ready Up** on both windows.
5. **Host clicks Start Game** — a 5-second countdown begins.
6. **One player is randomly assigned as the Seeker**, the rest are Hiders.
7. **Seeker** must catch all Hiders before time runs out.
8. **Results screen** appears at the end showing scores and standings.
9. Click **Return to Lobby** to play again!

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move Up |
| `A` / `←` | Move Left |
| `S` / `↓` | Move Down |
| `D` / `→` | Move Right |

---

## 🏆 Scoring System

| Event | Points Awarded |
|-------|---------------|
| Seeker wins (all hiders caught) | **+100 pts** (Seeker) |
| Seeker catches a hider | **+50 pts** per catch (Seeker) |
| Hider survives until time runs out | **+150 pts** (Hider) |
| Hider gets caught | **+50 pts** (Hider — for effort!) |

Scores accumulate **in-memory per session** and are visible in the lobby between rounds.

---

## 📁 Project Structure

```
├── server/                  # Node.js + Socket.IO backend
│   └── src/
│       ├── index.js         # Server entry point & socket event handlers
│       └── managers/
│           └── roomManager.js  # Room state, player management, score tracking
│
├── src/                     # React + Phaser frontend
│   ├── components/
│   │   ├── PlayerCard/      # Lobby player card (shows score)
│   │   ├── ResultsScreen/   # Post-round results overlay
│   │   └── ...              # Other UI components
│   ├── context/
│   │   └── RoomContext.jsx  # Global room + round state
│   ├── game/
│   │   ├── scenes/          # Phaser scenes (Boot, Preload, Game)
│   │   ├── objects/         # Player game object
│   │   ├── managers/        # Input, Timer, Collision managers
│   │   └── network/         # SocketManager (game ↔ server bridge)
│   ├── hooks/
│   │   ├── useRoom.js       # Context hook
│   │   └── useSocket.js     # Socket.IO connection hook
│   └── pages/
│       ├── Home/            # Landing page
│       ├── CreateRoom/      # Create a new room
│       ├── JoinRoom/        # Join existing room
│       ├── Lobby/           # Pre-game lobby
│       └── Game/            # Active game view (Phaser canvas)
```

---

## 🌐 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `create-room` | Client → Server | Create a new room |
| `join-room` | Client → Server | Join an existing room |
| `toggle-ready` | Client → Server | Toggle player ready status |
| `select-map` | Client → Server | Host changes the selected map |
| `game-start` | Client → Server | Host starts the match |
| `player-move` | Client → Server | Send player position update |
| `player-caught` | Client → Server | Seeker reports a catch |
| `time-expired` | Client → Server | Timer ran out |
| `room-update` | Server → Client | Broadcast updated room state |
| `game-started` | Server → Client | Match has begun |
| `state-update` | Server → Client | 10Hz position broadcast tick |
| `player-caught-event` | Server → Client | A hider was caught |
| `round-end` | Server → Client | Round finished with winner + scores |

---

## 📄 License

MIT — feel free to fork, remix, and build upon this project.
