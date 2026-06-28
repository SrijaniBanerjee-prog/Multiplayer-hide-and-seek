import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import Card from '../Card/Card';
import styles from './PlayerCard.module.css';

export const PlayerCard = ({ player }) => {
  const { toggleReady, currentPlayer } = useRoom();

  const handleCardClick = () => {
    if (isSelf) {
      toggleReady();
    }
  };

  const isSelf = player.id === currentPlayer?.id;

  return (
    <Card
      className={`${styles.playerCard} ${player.ready ? styles.cardReady : ''} ${isSelf ? styles.cardSelf : ''}`}
      interactive={true}
      onClick={handleCardClick}
      title={isSelf ? "Click to toggle your status" : "Click to toggle mock player status"}
    >
      <div className={styles.playerInfo}>
        <div className={styles.avatarWrapper}>
          <img src={player.avatar} alt={`${player.name}'s Avatar`} className={styles.avatar} />
          {player.ready && <span className={styles.avatarGlow}></span>}
        </div>
        <div className={styles.details}>
          <div className={styles.nameRow}>
            <span className={styles.name}>
              {player.name} {isSelf && <span className={styles.selfBadge}>(You)</span>}
            </span>
            {player.host && (
              <span className={styles.hostBadge} title="Lobby Host">
                ⭐ HOST
              </span>
            )}
            <span className={styles.scoreBadge} title="Player Score">
              🏆 {player.score !== undefined ? player.score : 0} pts
            </span>
          </div>
          <span className={styles.clickTip}>
            {isSelf ? "Click card to toggle ready" : "Click card to toggle simulation"}
          </span>
        </div>
      </div>
      <div className={styles.statusSection}>
        <span
          className={`${styles.statusDot} ${player.ready ? styles.ready : styles.notReady}`}
        ></span>
        <span className={styles.statusText}>
          {player.ready ? 'Ready' : 'Not Ready'}
        </span>
      </div>
    </Card>
  );
};

export default PlayerCard;
