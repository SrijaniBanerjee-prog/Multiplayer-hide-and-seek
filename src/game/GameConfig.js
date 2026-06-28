import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';

/**
 * Generates standard game configurations for Phaser 3 runtime.
 * @param {string} parentContainerId HTML Element ID where the canvas is mounted.
 * @returns {object} Phaser game configuration object.
 */
export const getGameConfig = (parentContainerId) => {
  return {
    type: Phaser.AUTO,
    parent: parentContainerId,
    width: 800,
    height: 600,
    backgroundColor: '#020617', // Match our slate theme background color
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
    },
    fps: {
      target: 60,
      forceSetTimeOut: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    // Pipeline scenes configuration
    scene: [BootScene, PreloadScene, GameScene]
  };
};

export default getGameConfig;
