import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import { MAPS } from '../../data/maps';
import RoomHeader from '../../components/RoomHeader/RoomHeader';
import PlayerCard from '../../components/PlayerCard/PlayerCard';
import MapCard from '../../components/MapCard/MapCard';
import ReadyButton from '../../components/ReadyButton/ReadyButton';
import LobbyFooter from '../../components/LobbyFooter/LobbyFooter';
import Modal from '../../components/Modal/Modal';
import styles from './Lobby.module.css';

export const Lobby = () => {
  const {
    roomCode,
    roomName,
    players,
    selectedMap,
    isStarting,
    setIsStarting,
    currentPlayer
  } = useRoom();

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Route Guard: If not in a room, redirect to Home
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
    }
  }, [roomCode, navigate]);

  // Handle countdown simulation when game is starting
  useEffect(() => {
    let timer;
    if (isStarting) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // BACKEND_INTEGRATION_POINT: Load the actual game view or scene
            navigate('/game');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [isStarting]);

  if (!roomCode) return null;

  const handleCancelStart = () => {
    // Only host can cancel starting, but in mock let's allow it or restrict to host
    const host = players.find(p => p.host);
    if (host?.isLocal) {
      setIsStarting(false);
    }
  };

  const hostPlayer = players.find(p => p.host);
  const isLocalHost = hostPlayer?.isLocal;

  return (
    <div className={`${styles.container} animate-fade`}>
      <RoomHeader roomName={roomName} roomCode={roomCode} />

      <div className={styles.lobbyGrid}>
        {/* Left Column: Players list & Readiness */}
        <div className={styles.leftColumn}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              👥 Players <span className={styles.badge}>{players.length}</span>
            </h3>
            <span className={styles.simulationNotice}>
              💡 Click any card to toggle mock ready state.
            </span>
          </div>

          <div className={styles.playerList}>
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>

          <div className={styles.controlsCard}>
            <h4 className={styles.controlsTitle}>Lobby Controls</h4>
            <ReadyButton />
          </div>
        </div>

        {/* Right Column: Map Selection */}
        <div className={styles.rightColumn}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              🗺 Select Map
            </h3>
            {!isLocalHost && (
              <span className={styles.hostNotice}>
                ⚠️ Only the Host ({hostPlayer?.name || 'Host'}) can choose maps.
              </span>
            )}
          </div>

          <div className={styles.mapGrid}>
            {MAPS.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                isSelected={selectedMap?.id === map.id}
              />
            ))}
          </div>
        </div>
      </div>

      <LobbyFooter />

      {/* Game Starting Countdown Modal */}
      <Modal
        isOpen={isStarting}
        onClose={handleCancelStart}
        showCloseButton={isLocalHost}
        closeOnOverlayClick={false}
        title="Deploying Crew"
      >
        <div className={styles.modalContent}>
          <div className={styles.spinnerWrapper}>
            <div className={styles.spinner}></div>
            <div className={styles.countdownText}>
              {countdown > 0 ? countdown : 'DEPOYING'}
            </div>
          </div>
          <h2 className={styles.startingTitle}>
            {countdown > 0 ? 'LOBBY STARTING' : 'LAUNCHING COMBAT SIMULATION'}
          </h2>
          <p className={styles.startingSubtitle}>
            {countdown > 0 
              ? `Entering battle in ${countdown} seconds...` 
              : 'Connecting to match servers...'}
          </p>
          <div className={styles.modalDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Map:</span>
              <span className={styles.detailValue} style={{ color: selectedMap?.color }}>
                {selectedMap?.name}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Difficulty:</span>
              <span className={styles.detailValue}>{selectedMap?.difficulty}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Squad Size:</span>
              <span className={styles.detailValue}>{players.length} Players</span>
            </div>
          </div>

          {isLocalHost && countdown > 0 && (
            <button className={styles.cancelStartBtn} onClick={handleCancelStart}>
              Abort Countdown
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Lobby;
