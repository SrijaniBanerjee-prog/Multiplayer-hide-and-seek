import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const { roomCode, leaveRoom } = useRoom();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (roomCode) {
      if (window.confirm("Leave current room?")) {
        leaveRoom();
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo} onClick={handleLogoClick}>
          <span className={styles.icon}>🎮</span>
          <span className={styles.logoText}>
            MULTIPLAYER<span className={styles.accent}>GAME</span>
          </span>
        </div>
        {roomCode && (
          <div className={styles.roomStatus}>
            <span className={styles.pulseDot}></span>
            <span className={styles.roomCodeLabel}>
              Room: <span className={styles.roomCodeValue}>{roomCode}</span>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
