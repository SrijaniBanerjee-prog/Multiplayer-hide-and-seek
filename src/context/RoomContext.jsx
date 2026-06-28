import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '../hooks/useSocket';
import { MAPS } from '../data/maps';

export const RoomContext = createContext();

const getAvatarUrl = (name) => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
};

export const RoomProvider = ({ children }) => {
  const socketHook = useSocket();
  const { room, isConnected, socket, createRoom: socketCreate, joinRoom: socketJoin, leaveRoom: socketLeave, startGame: socketStart, toggleReady: socketToggleReady, selectMap: socketSelectMap } = socketHook;

  const [toast, setToast] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [roundResults, setRoundResults] = useState(null);

  const resetRoundResults = useCallback(() => {
    setRoundResults(null);
  }, []);

  // Derived state from socket room
  const roomCode = room ? room.id : null;
  const roomName = room ? `${Object.values(room.players).find(p => p.id === room.hostId)?.name || 'Host'}'s Arena` : null;
  
  const selectedMap = useMemo(() => {
    return room ? MAPS.find(m => m.id === room.selectedMap) || MAPS[0] : null;
  }, [room]);
  
  const players = useMemo(() => {
    return room ? Object.values(room.players).map(p => ({
      ...p,
      host: p.id === room.hostId,
      avatar: getAvatarUrl(p.name),
      isLocal: socket && p.id === socket.id
    })) : [];
  }, [room, socket]);
  
  const currentPlayer = useMemo(() => {
    return players.find(p => p.isLocal) || null;
  }, [players]);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, []);

  // Listen for game start
  useEffect(() => {
    if (socket) {
      const handleGameStarted = () => {
        setIsStarting(true);
        setRoundResults(null);
        showToast("Starting Match!");
      };
      socket.on('game-started', handleGameStarted);
      
      const handleRoundEnd = ({ winner, room: updatedRoom, reason }) => {
        setIsStarting(false);
        const playersList = Object.values(updatedRoom.players).map(p => ({
          ...p,
          avatar: getAvatarUrl(p.name),
          isLocal: p.id === socket.id
        }));
        
        const survivors = playersList.filter(p => p.role === 'hider' && !p.isCaught);
        const caughtPlayers = playersList.filter(p => p.role === 'hider' && p.isCaught);
        const seeker = playersList.find(p => p.role === 'seeker');

        setRoundResults({
          winner,
          reason,
          survivors,
          caughtPlayers,
          seeker,
          players: playersList
        });
      };
      socket.on('round-end', handleRoundEnd);

      return () => {
        socket.off('game-started', handleGameStarted);
        socket.off('round-end', handleRoundEnd);
      };
    }
  }, [socket, showToast]);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createRoom = useCallback((playerName, customRoomName, callback) => {
    const code = generateRoomCode();
    socketCreate(code, playerName, (response) => {
      if (response.success) {
        showToast(`Room Created!`);
      }
      if (callback) callback(response);
    });
  }, [socketCreate, showToast]);

  const joinRoom = useCallback((playerName, code, callback) => {
    socketJoin(code, playerName, (response) => {
      if (response.success) {
        showToast(`Joined Room ${code}!`);
      }
      if (callback) callback(response);
    });
  }, [socketJoin, showToast]);

  const toggleReady = useCallback(() => {
    if (roomCode) {
      socketToggleReady(roomCode);
    }
  }, [socketToggleReady, roomCode]);

  const selectMap = useCallback((map) => {
    if (roomCode && currentPlayer?.host) {
      socketSelectMap(roomCode, map.id);
      showToast(`Map changed to ${map.name}`);
    } else {
      showToast("Only the Host can select the map.");
    }
  }, [socketSelectMap, roomCode, currentPlayer, showToast]);

  const startGame = useCallback(() => {
    if (roomCode && currentPlayer?.host) {
      const allReady = players.every(p => p.ready);
      if (!allReady) {
        showToast("Cannot start: Some players are not ready.");
        return;
      }
      socketStart(roomCode);
    }
  }, [socketStart, roomCode, currentPlayer, players, showToast]);

  const leaveRoom = useCallback(() => {
    if (roomCode) {
      socketLeave(roomCode);
      setIsStarting(false);
      showToast("Left the room");
    }
  }, [socketLeave, roomCode, showToast]);

  return (
    <RoomContext.Provider
      value={{
        ...socketHook,
        roomCode,
        roomName,
        players,
        currentPlayer,
        selectedMap,
        isStarting,
        toast,
        roundResults,
        resetRoundResults,
        createRoom,
        joinRoom,
        toggleReady,
        selectMap,
        startGame,
        leaveRoom,
        showToast,
        setIsStarting
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
