import Phaser from 'phaser';

/**
 * TimerManager handles the 120-second game countdown clock.
 * It decrements the remaining time every second and alerts the scene when the timer expires.
 */
export default class TimerManager {
  /**
   * @param {Phaser.Scene} scene The current Phaser scene context.
   * @param {number} duration The duration of the round in seconds (default 120).
   * @param {function} onTick Callback triggered each second with remaining time.
   * @param {function} onTimeout Callback triggered when timer reaches 0.
   */
  constructor(scene, duration = 120, onTick = null, onTimeout = null) {
    this.scene = scene;
    this.duration = duration;
    this.timeLeft = duration;
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    this.timerEvent = null;
    this.isRunning = false;
  }

  /**
   * Starts the round timer countdown.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timeLeft = this.duration;

    // Trigger initial tick
    if (this.onTick) {
      this.onTick(this.timeLeft);
    }

    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: this.tick,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Ticks down the timer by 1 second.
   */
  tick() {
    if (!this.isRunning) return;

    this.timeLeft -= 1;
    
    if (this.onTick) {
      this.onTick(this.timeLeft);
    }

    if (this.timeLeft <= 0) {
      this.stop();
      if (this.onTimeout) {
        this.onTimeout();
      }
    }
  }

  /**
   * Stops the countdown timer.
   */
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = null;
    }
  }

  /**
   * Retrieves the remaining seconds.
   * @returns {number} Time left in seconds.
   */
  getTimeLeft() {
    return this.timeLeft;
  }
}
