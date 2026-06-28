import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './managers/roomManager.js';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // create-room
  socket.on('create-room', ({ roomId, playerName }, callback) => {
    const created = roomManager.createRoom(roomId, socket.id);
    if (created) {
      socket.join(roomId);
      roomManager.joinRoom(roomId, socket.id, playerName);
      const room = roomManager.getRoom(roomId);
      
      // Acknowledge back to sender
      if (callback) callback({ success: true, room });
      
      // Broadcast to room
      io.to(roomId).emit('room-update', room);
      console.log(`Room ${roomId} created by ${socket.id}`);
    } else {
      if (callback) callback({ success: false, error: 'Room already exists' });
    }
  });

  // join-room
  socket.on('join-room', ({ roomId, playerName }, callback) => {
    const room = roomManager.joinRoom(roomId, socket.id, playerName);
    if (room) {
      socket.join(roomId);
      
      if (callback) callback({ success: true, room });
      
      io.to(roomId).emit('room-update', room);
      console.log(`${socket.id} joined room ${roomId}`);
    } else {
      if (callback) callback({ success: false, error: 'Room not found or game in progress' });
    }
  });

  // leave-room
  socket.on('leave-room', ({ roomId }) => {
    const room = roomManager.leaveRoom(roomId, socket.id);
    socket.leave(roomId);
    
    if (room) {
      io.to(roomId).emit('room-update', room);
    }
  });

  // toggle-ready
  socket.on('toggle-ready', ({ roomId }) => {
    const room = roomManager.toggleReady(roomId, socket.id);
    if (room) {
      io.to(roomId).emit('room-update', room);
    }
  });

  // select-map
  socket.on('select-map', ({ roomId, mapId }) => {
    const room = roomManager.selectMap(roomId, socket.id, mapId);
    if (room) {
      io.to(roomId).emit('room-update', room);
    }
  });

  // game-start
  socket.on('game-start', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.hostId === socket.id) { // Only host can start
      const startedRoom = roomManager.startGame(roomId);
      if (startedRoom) {
        io.to(roomId).emit('game-started', startedRoom);
        console.log(`Game started in room ${roomId}`);
      }
    }
  });

  // player-move
  socket.on('player-move', ({ roomId, x, y, vx, vy, animation }) => {
    roomManager.updatePlayerPosition(roomId, socket.id, x, y, vx, vy, animation);
    // Note: We do NOT emit here. The fixed-tick loop handles broadcasting.
  });

  // player-caught
  socket.on('player-caught', ({ roomId, caughtId }) => {
    const result = roomManager.catchPlayer(roomId, caughtId);
    if (result) {
      // Broadcast caught event
      io.to(roomId).emit('player-caught-event', { caughtId });

      if (result.gameEnded) {
        const updatedRoom = roomManager.calculateRoundScores(roomId, 'seeker');
        io.to(roomId).emit('round-end', { winner: 'seeker', room: updatedRoom, reason: 'All Hiders Caught!' });
      }
    }
  });

  // time-expired
  socket.on('time-expired', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.status === 'playing') {
      room.status = 'waiting';
      const updatedRoom = roomManager.calculateRoundScores(roomId, 'hider');
      io.to(roomId).emit('round-end', { winner: 'hider', room: updatedRoom, reason: 'Time Expired!' });
    }
  });

  // disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const changedRooms = roomManager.handleDisconnect(socket.id);
    
    changedRooms.forEach(roomId => {
      const room = roomManager.getRoom(roomId);
      if (room) {
        io.to(roomId).emit('room-update', room);
      }
    });
  });
});

// Fixed-tick broadcast loop (100ms)
const TICK_RATE = 100;
setInterval(() => {
  const activeRooms = roomManager.getActiveRooms();
  
  activeRooms.forEach(room => {
    // Only send the necessary state (positions and essential flags)
    const stateUpdate = {
      players: {}
    };
    
    for (const [id, player] of Object.entries(room.players)) {
      stateUpdate.players[id] = {
        x: player.x,
        y: player.y,
        vx: player.vx,
        vy: player.vy,
        animation: player.animation,
        isCaught: player.isCaught
      };
    }

    io.to(room.id).emit('state-update', stateUpdate);
  });
}, TICK_RATE);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
