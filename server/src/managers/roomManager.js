export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, hostId) {
    if (this.rooms.has(roomId)) {
      return false; // Room already exists
    }
    
    this.rooms.set(roomId, {
      id: roomId,
      hostId,
      status: 'waiting', // 'waiting' or 'playing'
      selectedMap: 1,
      players: {} // socketId -> player object
    });
    
    return true;
  }

  joinRoom(roomId, socketId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.status !== 'waiting') return null; // Cannot join a game in progress

    room.players[socketId] = {
      id: socketId,
      name: playerName || `Player ${Object.keys(room.players).length + 1}`,
      x: 0,
      y: 0,
      role: 'hider', // default, assigned later
      ready: false,
      isCaught: false,
      connected: true,
      score: 0
    };

    return room;
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    delete room.players[socketId];

    // If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId);
    } else if (room.hostId === socketId) {
      // Reassign host if current host leaves
      room.hostId = Object.keys(room.players)[0];
    }

    return room;
  }

  toggleReady(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const player = room.players[socketId];
    if (player) {
      player.ready = !player.ready;
    }
    return room;
  }

  selectMap(roomId, socketId, mapId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.hostId === socketId) {
      room.selectedMap = mapId;
    }
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (Object.keys(room.players).length < 2) return false; // Need at least 2 players

    room.status = 'playing';

    // Assign roles randomly
    const playerIds = Object.keys(room.players);
    const seekerIndex = Math.floor(Math.random() * playerIds.length);
    
    playerIds.forEach((id, index) => {
      const player = room.players[id];
      player.role = index === seekerIndex ? 'seeker' : 'hider';
      player.isCaught = false;
      player.ready = false; // Reset ready status for next lobby return
      // Reset positions to a starting area
      player.x = 400; // Example spawn x
      player.y = 300; // Example spawn y
    });

    return room;
  }

  calculateRoundScores(roomId, winner) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    Object.values(room.players).forEach(player => {
      if (player.score === undefined) {
        player.score = 0;
      }
      
      if (player.role === 'seeker') {
        if (winner === 'seeker') {
          player.score += 100;
        }
        const caughtCount = Object.values(room.players).filter(p => p.role === 'hider' && p.isCaught).length;
        player.score += caughtCount * 50;
      } else if (player.role === 'hider') {
        if (!player.isCaught) {
          player.score += 150;
        } else {
          player.score += 50;
        }
      }
    });

    return room;
  }

  updatePlayerPosition(roomId, socketId, x, y, vx, vy, animation) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const player = room.players[socketId];
    if (!player) return;

    player.x = x;
    player.y = y;
    player.vx = vx;
    player.vy = vy;
    player.animation = animation;
  }

  catchPlayer(roomId, caughtId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players[caughtId];
    if (!player || player.role !== 'hider') return false;

    player.isCaught = true;

    // Check if game is over (all hiders caught)
    const hiders = Object.values(room.players).filter(p => p.role === 'hider');
    const allCaught = hiders.every(h => h.isCaught);

    if (allCaught) {
      room.status = 'waiting';
      return { gameEnded: true, room };
    }

    return { gameEnded: false, room };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getActiveRooms() {
    return Array.from(this.rooms.values()).filter(r => r.status === 'playing');
  }

  // Handle disconnect cleanly
  handleDisconnect(socketId) {
    let changedRooms = [];
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players[socketId]) {
        this.leaveRoom(roomId, socketId);
        changedRooms.push(roomId);
      }
    }
    
    return changedRooms;
  }
}
