import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import Button from '../Button/Button';
import styles from './LobbyFooter.module.css';

export const LobbyFooter = () => {
  const { players, selectedMap, startGame, leaveRoom, currentPlayer } = useRoom();
  const navigate = useNavigate();

  // Find host
  const host = players.find(p => p.host);
  const isLocalHost = host?.isLocal;

  // Validation conditions
  const allPlayersReady = players.length > 0 && players.every(p => p.ready);
  const mapSelected = !!selectedMap;
  const canStart = allPlayersReady && mapSelected;

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this game room?")) {
      leaveRoom();
      navigate('/');
    }
  };

  const getStatusText = () => {
    if (!mapSelected) return "Select a map to continue";
    if (!allPlayersReady) return "Waiting for all players to Ready Up";
    return "All systems clear. Ready to deploy!";
  };

  return (
    <div className={`${styles.footer} glass-panel`}>
      <div className={styles.left}>
        <Button variant="secondary" size="md" onClick={handleLeave}>
          🚪 Leave Lobby
        </Button>
      </div>

      <div className={styles.center}>
        <span className={`${styles.statusLabel} ${canStart ? styles.readyStatus : ''}`}>
          {getStatusText()}
        </span>
      </div>

      <div className={styles.right}>
        {isLocalHost ? (
          <Button
            variant="success"
            size="lg"
            disabled={!canStart}
            glow={canStart}
            onClick={startGame}
            className={styles.startBtn}
          >
            🚀 Start Game
          </Button>
        ) : (
          <div className={styles.waitingBadge}>
            <span className={styles.pulseDot}></span>
            Waiting for Host
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyFooter;
