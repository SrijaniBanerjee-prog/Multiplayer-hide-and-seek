import Phaser from 'phaser';

/**
 * SocketManager handles the networking interface.
 * Implements send/receive methods for positions, catches, and game state.
 * Employs a local mock network simulator to drive remote players when server is offline.
 */
export default class SocketManager {
  constructor(scene) {
    this.scene = scene;
    
    // Connect to the socket established in React
    this.socket = window.socket;
    
    // Get room ID from game data
    this.roomId = window.PhaserGameData?.roomId;

    this.listeners = {
      playerMove: [],
      playerCaught: [],
      roundEnd: []
    };

    this.setupListeners();
  }

  setupListeners() {
    if (!this.socket) return;
    
    // The server emits 'state-update' every 100ms
    this.socket.on('state-update', (state) => {
      if (state && state.players) {
        Object.entries(state.players).forEach(([socketId, data]) => {
          // Ignore our own updates
          if (socketId !== this.socket.id) {
            this.trigger('playerMove', {
              id: socketId,
              x: data.x,
              y: data.y,
              vx: data.vx,
              vy: data.vy,
              animation: data.animation
            });
          }
        });
      }
    });

    this.socket.on('player-caught-event', (data) => {
      this.trigger('playerCaught', { hiderId: data.caughtId });
    });

    this.socket.on('round-end', (data) => {
      this.trigger('roundEnd', data);
    });
  }

  /**
   * Subscribes a listener function to network event updates.
   * @param {'playerMove'|'playerCaught'|'roundEnd'} event Name of the event to listen for.
   * @param {function} callback Function executed with received packet.
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Invokes all listener callbacks registered to an event.
   * @param {'playerMove'|'playerCaught'|'roundEnd'} event Event to dispatch.
   * @param {any} data Received data packet.
   */
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Sends the local player's kinematic state to the backend.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   * @param {number} vx X velocity.
   * @param {number} vy Y velocity.
   * @param {string} animation Current running animation key.
   */
  sendPlayerMove(x, y, vx, vy, animation) {
    if (this.socket && this.socket.connected && this.roomId) {
      this.socket.emit('player-move', { roomId: this.roomId, x, y, vx, vy, animation });
    }
  }

  /**
   * Sends caught notification when a seeker catches a hider.
   * @param {number|string} hiderId ID of the hider that was caught.
   */
  sendPlayerCaught(hiderId) {
    console.log(`[SocketManager] Hook: sendPlayerCaught(${hiderId})`);
    if (this.socket && this.socket.connected && this.roomId) {
      this.socket.emit('player-caught', { roomId: this.roomId, caughtId: hiderId });
    }
  }

  sendTimeExpired() {
    if (this.socket && this.socket.connected && this.roomId) {
      this.socket.emit('time-expired', { roomId: this.roomId });
    }
  }

  /**
   * Dispatch method for receiving remote player movements.
   * @param {object} data Kinematic state payload.
   */
  destroy() {
    if (this.socket) {
      this.socket.off('state-update');
      this.socket.off('player-caught-event');
      this.socket.off('round-end');
    }
  }
}
