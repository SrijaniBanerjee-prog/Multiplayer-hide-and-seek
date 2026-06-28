import Phaser from 'phaser';
import getGameConfig from './GameConfig';

/**
 * Initializes a new instance of the Phaser 3 Game engine.
 * @param {string} parentContainerId HTML element target where the canvas will be rendered.
 * @param {object} customConfig Optional custom overrides to standard game configs.
 * @returns {Phaser.Game} The instantiated game engine instance.
 */
export const initGame = (parentContainerId, customConfig = {}) => {
  const baseConfig = getGameConfig(parentContainerId);
  const mergedConfig = { ...baseConfig, ...customConfig };
  return new Phaser.Game(mergedConfig);
};

export default initGame;
