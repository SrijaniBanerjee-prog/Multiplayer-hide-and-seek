import React from 'react';
import CopyRoomCode from '../CopyRoomCode/CopyRoomCode';
import styles from './RoomHeader.module.css';

export const RoomHeader = ({ roomName, roomCode }) => {
  return (
    <div className={`${styles.header} glass-panel`}>
      <div className={styles.info}>
        <div className={styles.gameBadge}>Active Lobby</div>
        <h2 className={styles.roomTitle}>{roomName || "Game Room"}</h2>
      </div>
      <div className={styles.actions}>
        <CopyRoomCode code={roomCode} />
      </div>
    </div>
  );
};

export default RoomHeader;
