import Phaser from 'phaser';

/**
 * CollisionManager configures physics collisions and overlaps.
 * Handles Player vs Walls, Player vs Obstacles, and Seeker vs Hider catch detections.
 */
export default class CollisionManager {
  /**
   * @param {Phaser.Scene} scene The current Phaser scene context.
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Configures a player sprite to collide with tilemap wall and obstacle layers.
   * @param {Phaser.GameObjects.GameObject} player The player sprite object.
   * @param {Phaser.Tilemaps.TilemapLayer} collisionLayer The solid wall/tile layer.
   * @param {Phaser.Tilemaps.TilemapLayer} obstacleLayer The hiding/blocking obstacle layer.
   */
  addWorldCollisions(player, collisionLayer, obstacleLayer) {
    if (collisionLayer) {
      this.scene.physics.add.collider(player, collisionLayer);
    }
    if (obstacleLayer) {
      this.scene.physics.add.collider(player, obstacleLayer);
    }
  }

  /**
   * Sets up overlap verification between seeker and hiders group.
   * Calls onCaught callback with caught hider's ID.
   * @param {Phaser.GameObjects.GameObject} seeker The seeker player sprite.
   * @param {Phaser.Physics.Arcade.Group} hiderGroup Group containing all hider player sprites.
   * @param {function} onCatch Callback function triggered when seeker touches a hider.
   */
  addPlayerCatchOverlap(seeker, hiderGroup, onCatch) {
    this.scene.physics.add.overlap(
      seeker,
      hiderGroup,
      (seekerObj, hiderObj) => {
        if (onCatch && hiderObj.active && !hiderObj.isCaught) {
          onCatch(hiderObj.id);
        }
      },
      null,
      this.scene
    );
  }
}
