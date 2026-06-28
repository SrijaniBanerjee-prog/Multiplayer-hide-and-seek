import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { useRoom } from '../../hooks/useRoom';
import getGameConfig from '../../game/GameConfig';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import ResultsScreen from '../../components/ResultsScreen/ResultsScreen';
import styles from './Game.module.css';

export const Game = () => {
  const { roomCode, selectedMap, currentPlayer, players, leaveRoom, showToast, roundResults, resetRoundResults } = useRoom();
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const initialized = useRef(false);
  const containerId = 'phaser-game-container';

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // 1. Prepare global settings for Phaser scenes
    const mapId = selectedMap?.id || 1;
    const role = currentPlayer?.role || (currentPlayer?.host ? 'seeker' : 'hider');
    const currentPlayerId = currentPlayer?.id || 1;

    // Convert lobby players list to game format with role properties
    const gamePlayers = (players && players.length > 0)
      ? players.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role || (p.host ? 'seeker' : 'hider'),
          isLocal: p.isLocal
        }))
      : [
          { id: currentPlayerId, name: currentPlayer?.name || 'Local User', role, isLocal: true }
        ];

    window.PhaserGameData = {
      roomId: roomCode,
      mapId,
      role,
      playerName: currentPlayer?.name || 'Local User',
      players: gamePlayers,
      currentPlayerId
    };

    showToast(`Loading Arena: ${selectedMap?.name || 'Forest'} as ${role.toUpperCase()}`, 2500);

    // 2. Initialize Phaser Game
    const config = getGameConfig(containerId);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Listen to window size changes for resizing the game canvas
    const handleResize = () => {
      if (gameRef.current && gameRef.current.scale) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Listen to custom exit events triggered inside Phaser scenes
    const handlePhaserExitMatch = () => {
      leaveRoom();
      navigate('/');
    };
    window.addEventListener('phaser-exit-match', handlePhaserExitMatch);

    const handlePhaserPlayAgain = () => {
      navigate('/lobby');
    };
    window.addEventListener('phaser-play-again', handlePhaserPlayAgain);

    // 3. Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('phaser-exit-match', handlePhaserExitMatch);
      window.removeEventListener('phaser-play-again', handlePhaserPlayAgain);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.PhaserGameData = null;
      initialized.current = false;
    };
  }, []); // Run ONLY once on mount

  const handlePlayAgain = () => {
    resetRoundResults();
    navigate('/lobby');
  };

  const handleLeaveRoom = () => {
    resetRoundResults();
    leaveRoom();
    navigate('/');
  };

  if (roundResults) {
    return (
      <ResultsScreen
        results={roundResults}
        currentPlayer={currentPlayer}
        onPlayAgain={handlePlayAgain}
        onLeave={handleLeaveRoom}
      />
    );
  }

  const handleExitMatch = () => {
    if (window.confirm("Are you sure you want to abandon the match and leave the lobby?")) {
      leaveRoom();
      navigate('/');
    }
  };

  return (
    <div className={`${styles.gameLayout} animate-fade`}>
      <header className={styles.gameHeader}>
        <div className={styles.metaInfo}>
          <span className={styles.statusPulse}></span>
          <span className={styles.matchTitle}>COMBAT ARENA SIMULATION</span>
          <span className={styles.divider}>|</span>
          <span className={styles.mapBadge} style={{ color: selectedMap?.color || '#22C55E' }}>
            {selectedMap?.name || 'Forest Arena'}
          </span>
        </div>
        <button className={styles.exitBtn} onClick={handleExitMatch}>
          🗙 Abort Match
        </button>
      </header>

      <div className={styles.viewportWrapper}>
        <Card className={styles.gameCard}>
          {/* Phaser canvas mounts inside this div */}
          <div id={containerId} className={styles.canvasContainer} />
        </Card>
      </div>

      <footer className={styles.gameFooter}>
        <div className={styles.controlsTip}>
          ⌨️ <span className={styles.key}>W</span><span className={styles.key}>A</span><span className={styles.key}>S</span><span className={styles.key}>D</span> or 🖰 Arrows moves your Character
        </div>
      </footer>
    </div>
  );
};

export default Game;
