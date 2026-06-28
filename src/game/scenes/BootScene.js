import Phaser from 'phaser';

/**
 * BootScene initializes Phaser configurations, scale checks, and basic assets.
 * Immediately transitions to the PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Optional: Load a boot logo/loading spinner asset here.
  }

  create() {
    // Go to the PreloadScene once boot loading finishes
    this.scene.start('PreloadScene');
  }
}
