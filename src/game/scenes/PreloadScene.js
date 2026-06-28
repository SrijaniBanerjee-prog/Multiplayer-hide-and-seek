import Phaser from 'phaser';

/**
 * PreloadScene handles asset loading (maps, spritesheets, tilesets).
 * Renders a visual loading progress bar and generates player animation configurations.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 1. Render Loading Progress Bar
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x0f172a, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 55,
      text: 'TRANSMITTING COGNITIVE MAPS...',
      style: {
        font: 'bold 14px monospace',
        fill: '#3b82f6'
      }
    }).setOrigin(0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: 'bold 16px Courier New, monospace',
        fill: '#ffffff'
      }
    }).setOrigin(0.5);

    // Track loading progress
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x3b82f6, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 5);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 2. Load Tilemap JSON Configurations
    this.load.tilemapTiledJSON('map_1', 'assets/maps/forest.json');
    this.load.tilemapTiledJSON('map_2', 'assets/maps/school.json');
    this.load.tilemapTiledJSON('map_3', 'assets/maps/maze.json');

    // 3. Load Tilemap Tileset Graphic
    this.load.image('tiles', 'assets/tilesets/tiles.png');

    // 4. Load Player Spritesheet
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  create() {
    // Generate shared player animations
    this.createPlayerAnimations();

    // Proceed straight to GameScene
    // In our react-lobby design, the match config is passed down globally
    const startData = window.PhaserGameData || {
      mapId: 1,
      role: 'hider',
      playerName: 'Local Hider',
      players: [
        { id: 1, name: 'Local Hider', host: false, ready: true, isLocal: true, role: 'hider' },
        { id: 2, name: 'AI Seeker', host: true, ready: true, isLocal: false, role: 'seeker' }
      ],
      currentPlayerId: 1
    };

    this.scene.start('GameScene', startData);
  }

  /**
   * Sets up 4-directional walking and idle animations for the player spritesheet.
   */
  createPlayerAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const rowOffset = { down: 0, left: 3, right: 6, up: 9 };

    directions.forEach((dir) => {
      const startFrame = rowOffset[dir];

      // Idle Animation (frame 0 of the row)
      this.anims.create({
        key: `player_idle_${dir}`,
        frames: [{ key: 'player', frame: startFrame }],
        frameRate: 1
      });

      // Walk Animation (loop frames: step 1, stand, step 2, stand)
      this.anims.create({
        key: `player_walk_${dir}`,
        frames: [
          { key: 'player', frame: startFrame + 1 },
          { key: 'player', frame: startFrame },
          { key: 'player', frame: startFrame + 2 },
          { key: 'player', frame: startFrame }
        ],
        frameRate: 8,
        repeat: -1
      });
    });
  }
}
