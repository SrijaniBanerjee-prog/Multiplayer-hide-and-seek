import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import Button from '../Button/Button';
import styles from './ReadyButton.module.css';

export const ReadyButton = () => {
  const { currentPlayer, toggleReady } = useRoom();

  if (!currentPlayer) return null;

  const isReady = currentPlayer.ready;

  const handleToggle = () => {
    toggleReady();
  };

  return (
    <div className={styles.readyBtnContainer}>
      <Button
        variant={isReady ? 'danger' : 'success'}
        size="lg"
        glow={true}
        fullWidth={true}
        onClick={handleToggle}
        className={isReady ? styles.activeReady : styles.inactiveReady}
      >
        <span className={styles.icon}>{isReady ? '✖' : '✔'}</span>
        {isReady ? 'Cancel Ready' : 'Ready Up'}
      </Button>
    </div>
  );
};

export default ReadyButton;
