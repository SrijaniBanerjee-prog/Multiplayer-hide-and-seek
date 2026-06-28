import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './CreateRoom.module.css';

export const CreateRoom = () => {
  const { createRoom } = useRoom();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!playerName.trim()) {
      setError('Player Name is required');
      return;
    }

    createRoom(playerName.trim(), roomName.trim(), (response) => {
      if (response.success) {
        navigate('/lobby');
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setPlayerName(val);
    if (val.trim()) {
      setError('');
    } else if (isSubmitted) {
      setError('Player Name is required');
    }
  };

  const isInvalid = !playerName.trim();

  return (
    <div className={`${styles.container} animate-fade`}>
      <Card className={`${styles.formCard} animate-slide`} glow={true}>
        <div className={styles.header}>
          <span className={styles.backArrow} onClick={() => navigate('/')}>
            ← Back
          </span>
          <h2 className={styles.title}>Host A Lobby</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="playerName"
            label="Player Name (Host)"
            placeholder="Enter your gamer tag..."
            value={playerName}
            onChange={handleNameChange}
            error={error}
            maxLength={15}
            required
            autoFocus
          />

          <Input
            id="roomName"
            label="Room Name (Optional)"
            placeholder="e.g. Mani's Grand Arena..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={25}
          />

          <div className={styles.tipBox}>
            <span className={styles.tipIcon}>💡</span>
            <p className={styles.tipText}>
              Creating a room generates a private 6-character room code. Share this code with friends so they can join.
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
            Create Room
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateRoom;
