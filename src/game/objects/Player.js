import Phaser from 'phaser';

/**
 * Player sprite class.
 * Represents both the local player and remote player updates.
 * Supports distinct role styles (Seeker vs Hider) and local input mapping.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene The current Phaser scene context.
   * @param {number} x Initial X coordinate.
   * @param {number} y Initial Y coordinate.
   * @param {number|string} id Unique player ID.
   * @param {string} name Player's screen name.
   * @param {'seeker'|'hider'} role Role of the player.
   * @param {boolean} isLocal True if this instance represents the local player.
   */
  constructor(scene, x, y, id, name, role, isLocal) {
    // Call super with loaded spritesheet 'player'
    super(scene, x, y, 'player');

    this.id = id;
    this.name = name;
    this.role = role;
    this.isLocal = isLocal;
    this.isCaught = false;

    // Add player to the scene update and rendering systems
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Apply physics attributes
    this.setCollideWorldBounds(true);
    this.body.setGravity(0, 0);

    // Fine-tune bounding boxes for clean collision checks
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);

    // Configure role specific parameters
    if (this.role === 'seeker') {
      this.speed = 155; // Seeker moves slightly faster
      this.setTint(0xef4444); // Red tint for seeker
    } else {
      this.speed = 140; // Hider moves slightly slower
      this.setTint(0x10b981); // Green tint for hider
    }

    // Direction tracking for animation updates
    this.lastDirection = 'down';

    // Create the floating name tag above player's head
    const labelText = `${this.name} (${this.role.toUpperCase()})`;
    const labelColor = this.isLocal ? '#3b82f6' : (this.role === 'seeker' ? '#f87171' : '#a7f3d0');
    
    this.nameLabel = scene.add.text(x, y - 24, labelText, {
      font: 'bold 10px Courier New, monospace',
      fill: labelColor,
      backgroundColor: '#020617',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setAlpha(0.85);

    // Depth sorting: make sure labels and players sort correctly
    this.setDepth(10);
    this.nameLabel.setDepth(11);
  }

  /**
   * Updates player position and animations.
   * Executed on every engine update tick.
   */
  update() {
    if (this.isCaught) return;

    if (this.isLocal) {
      // Local movement processing
      const vector = this.scene.inputManager.getMovementVector();
      this.setVelocity(vector.x * this.speed, vector.y * this.speed);

      // Play walk/idle animation based on input vector
      this.updateAnimations(vector.x, vector.y);
    }

    // Synchronize the name label position above player sprite
    if (this.nameLabel) {
      this.nameLabel.setPosition(this.x, this.y - 20);
    }
  }

  /**
   * Updates movement animation state based on velocity vectors.
   * @param {number} vx Velocity X component.
   * @param {number} vy Velocity Y component.
   */
  updateAnimations(vx, vy) {
    if (vx === 0 && vy === 0) {
      this.play(`player_idle_${this.lastDirection}`, true);
    } else {
      let dir = this.lastDirection;
      if (vy < 0) {
        dir = 'up';
      } else if (vy > 0) {
        dir = 'down';
      } else if (vx < 0) {
        dir = 'left';
      } else if (vx > 0) {
        dir = 'right';
      }
      this.lastDirection = dir;
      this.play(`player_walk_${dir}`, true);
    }
  }

  /**
   * Applies kinematics changes received from the network.
   * @param {number} x Target absolute X coordinate.
   * @param {number} y Target absolute Y coordinate.
   * @param {number} vx Target velocity X.
   * @param {number} vy Target velocity Y.
   * @param {string} animKey Target animation frame suffix.
   */
  applyNetworkUpdate(x, y, vx, vy, animKey) {
    if (this.isCaught) return;

    // Default undefined to 0 to prevent NaN propagation
    const safeVx = vx || 0;
    const safeVy = vy || 0;

    // Linear interpolation (Lerp) to target position to prevent snapping
    if (x !== undefined && y !== undefined) {
      if (isNaN(this.x) || isNaN(this.y)) {
        this.x = x;
        this.y = y;
      } else {
        this.x = Phaser.Math.Linear(this.x, x, 0.3);
        this.y = Phaser.Math.Linear(this.y, y, 0.3);
      }
    }

    // Apply speed vector directly
    this.setVelocity(safeVx * this.speed, safeVy * this.speed);

    // Extract direction from network animation key
    if (animKey) {
      const parts = animKey.split('_');
      if (parts.length >= 3) {
        this.lastDirection = parts[2];
      }
      this.play(`player_${animKey}`, true);
    }
  }

  /**
   * Triggers the caught transition for hiders.
   */
  caught() {
    if (this.isCaught) return;
    this.isCaught = true;

    // Disable physics body collision
    this.body.enable = false;
    this.setVelocity(0, 0);

    // Fade player and set grayscale style tint
    this.setAlpha(0.4);
    this.setTint(0x64748b); // Gray slate color

    // Update name label
    if (this.nameLabel) {
      this.nameLabel.setText(`${this.name} [CAUGHT]`);
      this.nameLabel.setFill('#64748b');
    }

    this.play(`player_idle_${this.lastDirection}`, true);
  }

  /**
   * Commands player to halt all movements.
   */
  stop() {
    this.setVelocity(0, 0);
    this.play(`player_idle_${this.lastDirection}`, true);
  }

  /**
   * Clean up name label text object when player is destroyed.
   */
  destroy() {
    if (this.nameLabel) {
      this.nameLabel.destroy();
    }
    super.destroy();
  }
}
