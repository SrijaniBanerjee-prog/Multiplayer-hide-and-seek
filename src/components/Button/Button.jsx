import React from 'react';
import styles from './Button.module.css';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, success, danger, warning
  size = 'md', // sm, md, lg
  disabled = false,
  fullWidth = false,
  glow = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    glow ? styles.glow : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className={styles.content}>{children}</span>
    </button>
  );
};

export default Button;
