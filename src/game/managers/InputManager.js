import Phaser from 'phaser';

/**
 * InputManager handles player controls.
 * It maps keyboard inputs (WASD + Arrow keys) to movement vectors.
 */
export default class InputManager {
  /**
   * @param {Phaser.Scene} scene The current Phaser scene context.
   */
  constructor(scene) {
    this.scene = scene;
    
    // Add keys for W, A, S, D and Arrow keys
    this.keys = this.scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      UP: Phaser.Input.Keyboard.KeyCodes.UP,
      DOWN: Phaser.Input.Keyboard.KeyCodes.DOWN,
      LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
      RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
  }

  /**
   * Calculates the raw input movement vector.
   * Normalizes diagonal movement velocity to maintain consistent speed.
   * @returns {Phaser.Math.Vector2} The direction vector {x, y} with length <= 1.
   */
  getMovementVector() {
    let vx = 0;
    let vy = 0;

    // Check states
    const isUp = this.keys.W.isDown || this.keys.UP.isDown;
    const isDown = this.keys.S.isDown || this.keys.DOWN.isDown;
    const isLeft = this.keys.A.isDown || this.keys.LEFT.isDown;
    const isRight = this.keys.D.isDown || this.keys.RIGHT.isDown;

    if (isLeft) vx = -1;
    if (isRight) vx = 1;
    if (isUp) vy = -1;
    if (isDown) vy = 1;

    // Create a vector and normalize it for diagonal consistency
    const vector = new Phaser.Math.Vector2(vx, vy);
    if (vector.length() > 0) {
      vector.normalize();
    }
    return vector;
  }
}
