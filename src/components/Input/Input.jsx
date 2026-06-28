import React from 'react';
import styles from './Input.module.css';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  maxLength,
  id,
  className = '',
  ...props
}) => {
  const containerClasses = [styles.container, className].join(' ');
  const inputClasses = [
    styles.input,
    error ? styles.inputError : '',
    disabled ? styles.disabled : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
