import React from 'react';
import { useRoom } from '../../hooks/useRoom';
import Card from '../Card/Card';
import Button from '../Button/Button';
import styles from './MapCard.module.css';

export const MapCard = ({ map, isSelected }) => {
  const { selectMap, players } = useRoom();

  // Find host to check if the current user is host
  const host = players.find((p) => p.host);
  const isLocalHost = host?.isLocal;

  const handleSelect = () => {
    if (isLocalHost) {
      selectMap(map);
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return styles.easy;
      case 'medium':
        return styles.medium;
      case 'hard':
        return styles.hard;
      default:
        return '';
    }
  };

  return (
    <Card
      className={`${styles.mapCard} ${isSelected ? styles.selectedCard : ''}`}
      style={{
        '--accent-color': map.color,
        borderColor: isSelected ? map.color : 'rgba(255, 255, 255, 0.05)'
      }}
      interactive={isLocalHost}
      onClick={isLocalHost ? handleSelect : undefined}
    >
      <div className={styles.imageWrapper}>
        <img src={map.image} alt={map.name} className={styles.mapImage} />
        <span className={`${styles.difficultyBadge} ${getDifficultyClass(map.difficulty)}`}>
          {map.difficulty}
        </span>
        {isSelected && <div className={styles.selectedOverlay}>SELECTED</div>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.mapName}>{map.name}</h3>
        <p className={styles.description}>{map.description}</p>
        
        <div className={styles.footer}>
          {isLocalHost ? (
            <Button
              variant={isSelected ? 'success' : 'primary'}
              size="sm"
              fullWidth={true}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect();
              }}
              className={isSelected ? styles.selectedBtn : ''}
            >
              {isSelected ? '✓ Selected' : 'Select Map'}
            </Button>
          ) : (
            <div className={`${styles.statusLabel} ${isSelected ? styles.labelActive : ''}`}>
              {isSelected ? '⭐ Selected by Host' : 'Host Selecting...'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MapCard;
