import React from 'react';
import styles from './Card.module.css';

export const Card = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  onClick,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    glow ? styles.glow : '',
    interactive ? styles.interactive : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
