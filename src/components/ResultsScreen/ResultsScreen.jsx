import React from 'react';
import Card from '../Card/Card';
import Button from '../Button/Button';
import styles from './ResultsScreen.module.css';

export const ResultsScreen = ({ results, currentPlayer, onPlayAgain, onLeave }) => {
  const { winner, reason, survivors, caughtPlayers, seeker, players } = results;

  // Determine if the local player is a winner
  // Standardized comparison: hider wins if winner is 'hider', seeker wins if winner is 'seeker'
  const isLocalHider = currentPlayer?.role === 'hider';
  const isLocalSeeker = currentPlayer?.role === 'seeker';
  const didLocalPlayerWin = (winner === 'hider' && isLocalHider) || (winner === 'seeker' && isLocalSeeker);

  // Sort all players by score for the overall leaderboard
  const leaderboard = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className={`${styles.overlay} animate-fade`}>
      <div className={styles.resultsContainer}>
        {/* Header Section */}
        <header className={`${styles.header} ${didLocalPlayerWin ? styles.winHeader : styles.loseHeader}`}>
          <div className={styles.glowingText}>
            {didLocalPlayerWin ? '🏆 VICTORY' : '💀 DEFEAT'}
          </div>
          <h1 className={styles.title}>
            {winner === 'seeker' ? 'SEEKER WON' : 'HIDERS WON'}
          </h1>
          <p className={styles.subtitle}>{reason.toUpperCase()}</p>
        </header>

        {/* Content Layout */}
        <div className={styles.contentGrid}>
          {/* Left Panel: Round Stats */}
          <div className={styles.statsPanel}>
            <h2 className={styles.sectionTitle}>Round Summary</h2>
            
            {/* Seeker Info */}
            {seeker && (
              <div className={styles.seekerCard}>
                <span className={styles.roleLabel}>SEEKER</span>
                <div className={styles.playerRow}>
                  <img src={seeker.avatar} alt={seeker.name} className={styles.avatar} />
                  <div className={styles.playerInfo}>
                    <span className={styles.playerName}>
                      {seeker.name} {seeker.isLocal && <span className={styles.selfLabel}>(You)</span>}
                    </span>
                    <span className={styles.playerScore}>Score: {seeker.score || 0} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Survivors List */}
            <div className={styles.categoryList}>
              <h3 className={`${styles.categoryHeader} ${styles.survivorColor}`}>
                🛡️ Survivors ({survivors.length})
              </h3>
              {survivors.length === 0 ? (
                <div className={styles.emptyState}>No hiders survived!</div>
              ) : (
                <div className={styles.listContainer}>
                  {survivors.map(p => (
                    <div key={p.id} className={`${styles.playerRowItem} ${styles.survivorRow}`}>
                      <img src={p.avatar} alt={p.name} className={styles.avatarMini} />
                      <span className={styles.playerNameMini}>
                        {p.name} {p.isLocal && <span className={styles.selfLabel}>(You)</span>}
                      </span>
                      <span className={styles.playerScoreMini}>{p.score || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caught Players List */}
            <div className={styles.categoryList}>
              <h3 className={`${styles.categoryHeader} ${styles.caughtColor}`}>
                ❌ Caught Players ({caughtPlayers.length})
              </h3>
              {caughtPlayers.length === 0 ? (
                <div className={styles.emptyState}>No hiders were caught!</div>
              ) : (
                <div className={styles.listContainer}>
                  {caughtPlayers.map(p => (
                    <div key={p.id} className={`${styles.playerRowItem} ${styles.caughtRow}`}>
                      <img src={p.avatar} alt={p.name} className={styles.avatarMini} />
                      <span className={styles.playerNameMini}>
                        {p.name} {p.isLocal && <span className={styles.selfLabel}>(You)</span>}
                      </span>
                      <span className={styles.playerScoreMini}>{p.score || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Room Leaderboard */}
          <div className={styles.leaderboardPanel}>
            <h2 className={styles.sectionTitle}>🏆 Standings</h2>
            <div className={styles.leaderboardList}>
              {leaderboard.map((p, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                
                let rankClass = '';
                if (isFirst) rankClass = styles.rankFirst;
                else if (isSecond) rankClass = styles.rankSecond;
                else if (isThird) rankClass = styles.rankThird;

                return (
                  <div 
                    key={p.id} 
                    className={`${styles.leaderboardRow} ${p.isLocal ? styles.leaderboardSelf : ''}`}
                  >
                    <div className={styles.leaderboardLeft}>
                      <span className={`${styles.rankBadge} ${rankClass}`}>
                        {isFirst ? '👑' : index + 1}
                      </span>
                      <img src={p.avatar} alt={p.name} className={styles.avatar} />
                      <span className={styles.leaderboardName}>
                        {p.name} {p.isLocal && <span className={styles.selfLabel}>(You)</span>}
                        {p.host && <span className={styles.hostStar}>⭐</span>}
                      </span>
                    </div>
                    <span className={styles.leaderboardScore}>{p.score || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className={styles.actions}>
          <Button 
            variant="success" 
            size="lg" 
            glow={true} 
            onClick={onPlayAgain}
            className={styles.actionBtn}
          >
            🎮 Return to Lobby / Play Again
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={onLeave}
            className={styles.actionBtn}
          >
            🚪 Exit Room
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ResultsScreen;
