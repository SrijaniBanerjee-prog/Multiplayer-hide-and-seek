import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import styles from './Home.module.css';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.container} animate-fade`}>
      <div className={styles.heroSection}>
        <div className={styles.tagline}>NEXT-GEN MULTIPLAYER LOBBY</div>
        <h1 className={styles.title}>
          MULTIPLAYER <span className={styles.accentText}>ARENA</span>
        </h1>
        <p className={styles.subtitle}>
          Create private gaming rooms, coordinate map selections with friends, 
          and ready up for high-fidelity tactical battle.
        </p>
      </div>

      <div className={styles.optionsGrid}>
        <Card className={`${styles.optionCard} animate-slide`} interactive={true}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>👑</span>
            <h2 className={styles.cardTitle}>Host Match</h2>
          </div>
          <p className={styles.cardDescription}>
            Start a new game session as Host. Customize room settings, choose maps, and control when the battle begins.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth={true}
            onClick={() => navigate('/create')}
            glow={true}
          >
            Create Room
          </Button>
        </Card>

        <Card className={`${styles.optionCard} animate-slide`} interactive={true}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🔑</span>
            <h2 className={styles.cardTitle}>Join Match</h2>
          </div>
          <p className={styles.cardDescription}>
            Enter an active 6-character room code to join an existing game lobby. Ready up to notify the Host.
          </p>
          <Button
            variant="secondary"
            size="lg"
            fullWidth={true}
            onClick={() => navigate('/join')}
          >
            Join Room
          </Button>
        </Card>
      </div>

      <div className={styles.footerSection}>
        <span className={styles.systemStatus}>
          <span className={styles.activePulse}></span>
          All Servers Operational
        </span>
      </div>
    </div>
  );
};

export default Home;
