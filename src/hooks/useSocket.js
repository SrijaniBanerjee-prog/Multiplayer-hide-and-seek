import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      autoConnect: true
    });
    window.socket = socketRef.current;

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket server:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    // Room events
    socket.on('room-update', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Game events
    socket.on('game-started', (startedRoom) => {
      setRoom(startedRoom);
    });

    // Game logic events
    socket.on('player-caught-event', ({ caughtId }) => {
      console.log('Player caught!', caughtId);
      // Can trigger sound or UI effects here
    });

    socket.on('round-end', ({ winner, room, reason }) => {
      console.log('Round ended, winner:', winner);
      setRoom(room);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action methods
  const createRoom = (roomId, playerName, callback) => {
    socketRef.current?.emit('create-room', { roomId, playerName }, callback);
  };

  const joinRoom = (roomId, playerName, callback) => {
    socketRef.current?.emit('join-room', { roomId, playerName }, callback);
  };

  const leaveRoom = (roomId) => {
    socketRef.current?.emit('leave-room', { roomId });
    setRoom(null);
  };

  const startGame = (roomId) => {
    socketRef.current?.emit('game-start', { roomId });
  };

  const toggleReady = (roomId) => {
    socketRef.current?.emit('toggle-ready', { roomId });
  };

  const selectMap = (roomId, mapId) => {
    socketRef.current?.emit('select-map', { roomId, mapId });
  };

  const movePlayer = (roomId, x, y) => {
    socketRef.current?.emit('player-move', { roomId, x, y });
  };

  const catchPlayer = (roomId, caughtId) => {
    socketRef.current?.emit('player-caught', { roomId, caughtId });
  };

  return {
    socket: socketRef.current,
    isConnected,
    room,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    toggleReady,
    selectMap,
    movePlayer,
    catchPlayer
  };
};
