import React, { useEffect } from 'react';
import styles from './Modal.module.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} glass-panel animate-slide`}>
        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            {showCloseButton && (
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                &times;
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
