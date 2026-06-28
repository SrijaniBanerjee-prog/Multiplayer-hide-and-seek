import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './JoinRoom.module.css';

export const JoinRoom = () => {
  const { joinRoom } = useRoom();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setPlayerName(val);
    if (val.trim()) {
      setNameError('');
    } else if (isSubmitted) {
      setNameError('Player Name is required');
    }
  };

  const handleCodeChange = (e) => {
    // Force uppercase and only allow alphanumeric characters
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(val);

    if (val.length === 6) {
      setCodeError('');
    } else if (isSubmitted) {
      setCodeError('Room Code must be exactly 6 characters');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    let hasError = false;

    if (!playerName.trim()) {
      setNameError('Player Name is required');
      hasError = true;
    }

    if (roomCode.length !== 6) {
      setCodeError('Room Code must be exactly 6 characters');
      hasError = true;
    }

    if (hasError) return;

    joinRoom(playerName.trim(), roomCode, (response) => {
      if (response.success) {
        navigate('/lobby');
      } else {
        setCodeError(response.error || 'Failed to join room');
      }
    });
  };

  // Enable/Disable conditions
  const isInvalid = !playerName.trim() || roomCode.length !== 6;

  return (
    <div className={`${styles.container} animate-fade`}>
      <Card className={`${styles.formCard} animate-slide`} glow={true}>
        <div className={styles.header}>
          <span className={styles.backArrow} onClick={() => navigate('/')}>
            ← Back
          </span>
          <h2 className={styles.title}>Join A Lobby</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="playerName"
            label="Player Name"
            placeholder="Enter your gamer tag..."
            value={playerName}
            onChange={handleNameChange}
            error={nameError}
            maxLength={15}
            required
            autoFocus
          />

          <Input
            id="roomCode"
            label="Room Code (6 Characters)"
            placeholder="e.g. A7K92P"
            value={roomCode}
            onChange={handleCodeChange}
            error={codeError}
            maxLength={6}
            required
            style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700' }}
          />

          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>🔑</span>
            <p className={styles.tipText}>
              Ask the Host for the 6-character room code. Enter it exactly as provided to establish a connection.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth={true}
            disabled={isInvalid}
            glow={!isInvalid}
          >
            Join Room
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default JoinRoom;
