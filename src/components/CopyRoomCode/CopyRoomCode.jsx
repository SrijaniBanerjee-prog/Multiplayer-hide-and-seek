import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import Button from '../Button/Button';
import styles from './CopyRoomCode.module.css';

export const CopyRoomCode = ({ code }) => {
  const { showToast } = useRoom();

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      showToast('Copied!', 2000); // Triggers the context toast state
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy', 2000);
    }
  };

  return (
    <div className={styles.copyContainer}>
      <span className={styles.codeLabel}>Room Code:</span>
      <div className={styles.codeBox}>
        <span className={styles.code}>{code}</span>
        <Button
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className={styles.copyBtn}
        >
          <span className={styles.copyIcon}>📋</span> Copy
        </Button>
      </div>
    </div>
  );
};

export default CopyRoomCode;
