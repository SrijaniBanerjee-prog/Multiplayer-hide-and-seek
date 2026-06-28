import React from 'react';
import styles from './Toast.module.css';

export const Toast = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {type === 'success' || message.includes('Copied') ? '✓' : 'ℹ'}
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast;
