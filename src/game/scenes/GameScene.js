import Phaser from 'phaser';
import Player from '../objects/Player';
import InputManager from '../managers/InputManager';
import TimerManager from '../managers/TimerManager';
import CollisionManager from '../managers/CollisionManager';
import SocketManager from '../network/SocketManager';

/**
 * GameScene controls the active match session.
 * Loads tilemaps, manages physics layers, updates players, HUD text, and end-game triggers.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  /**
   * Reads data passed from PreloadScene or window.PhaserGameData.
   */
  init(data) {
    // Config properties
    this.mapId = data.mapId || 1;
    this.playerRole = data.role || 'hider';
    this.playerName = data.playerName || 'Player';
    this.currentPlayerId = data.currentPlayerId || 1;

    // Load full player listing from lobby
    this.lobbyPlayers = data.players || [
      { id: 1, name: this.playerName, role: this.playerRole, isLocal: true }
    ];

    // State parameters
    this.roundOver = false;
    this.winner = null;
    this.winReason = '';
    this.lastMoveSentTime = 0;
  }

  create() {
    console.log(`[GameScene] Arena Booted: Map ${this.mapId} as ${this.playerRole}`);

    // 1. Initialize Network connection
    this.socketManager = new SocketManager(this);

    // 2. Initialize Managers
    this.inputManager = new InputManager(this);
    this.collisionManager = new CollisionManager(this);

    // 3. Build tilemaps and physics layers
    this.setupTilemap();

    // 4. Spawn Seeker and Hiders
    this.spawnPlayers();

    // 5. Setup Camera
    this.setupCamera();

    // 6. Setup HUD UI
    this.setupHUD();

    // 7. Setup countdown timer
    this.timerManager = new TimerManager(
      this,
      120, // 120 seconds duration
      (timeLeft) => this.updateTimerHUD(timeLeft),
      () => this.handleTimerTimeout()
    );
    this.timerManager.start();

    // 8. Bind network event listeners
    this.setupNetworkListeners();
  }

  update() {
    if (this.roundOver) return;

    // Update active player instances
    Object.values(this.players).forEach((p) => {
      p.update();
    });

    // Send local kinematics coordinates every 100ms
    const now = this.time.now;
    if (now - this.lastMoveSentTime >= 100) {
      this.lastMoveSentTime = now;
      this.sendLocalMovement();
    }
  }

  /**
   * Renders map tile layers and sets up physical barriers.
   */
  setupTilemap() {
    // Build map from loaded JSON keys
    this.map = this.make.tilemap({ key: `map_${this.mapId}` });
    const tileset = this.map.addTilesetImage('tileset', 'tiles');

    // Create Ground, Wall, Collision, and Obstacles layers
    this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
    this.wallLayer = this.map.createLayer('wall', tileset, 0, 0);
    this.collisionLayer = this.map.createLayer('collision', tileset, 0, 0);
    this.obstaclesLayer = this.map.createLayer('obstacles', tileset, 0, 0);

    // Configure collision bounds
    if (this.collisionLayer) {
      this.collisionLayer.setCollisionByExclusion([-1]);
    }
    if (this.obstaclesLayer) {
      this.obstaclesLayer.setCollisionByExclusion([-1]);
    }

    // Set world physics bounds to fit the map size (40x30 tiles of 32px = 1280x960 px)
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  /**
   * Spawns seeker and hiders from Tiled spawn points.
   */
  spawnPlayers() {
    this.players = {};
    this.hidersGroup = this.physics.add.group();

    // Load spawn points from spawnpoints layer
    const spawnPoints = {};
    const spawnpointsLayer = this.map.getObjectLayer('spawnpoints');
    if (spawnpointsLayer && spawnpointsLayer.objects) {
      spawnpointsLayer.objects.forEach((obj) => {
        spawnPoints[obj.name] = { x: obj.x, y: obj.y };
      });
    }

    // Fallbacks if spawn points are missing
    const defaultSeekerSpawn = spawnPoints['seeker_spawn'] || { x: 1152, y: 832 };
    const defaultHiderSpawns = [
      spawnPoints['hider_spawn_1'] || { x: 128, y: 128 },
      spawnPoints['hider_spawn_2'] || { x: 128, y: 832 },
      spawnPoints['hider_spawn_3'] || { x: 1152, y: 128 }
    ];

    let hiderSpawnCounter = 0;

    // Spawn each player defined in the lobby list
    this.lobbyPlayers.forEach((player) => {
      let x, y;

      if (player.role === 'seeker') {
        x = defaultSeekerSpawn.x;
        y = defaultSeekerSpawn.y;
      } else {
        // Distribute hiders across the three spawn points
        const spawnIdx = hiderSpawnCounter % defaultHiderSpawns.length;
        x = defaultHiderSpawns[spawnIdx].x;
        y = defaultHiderSpawns[spawnIdx].y;
        hiderSpawnCounter++;
      }

      // Check if this player matches the local client
      const isLocal = player.id === this.currentPlayerId;

      const p = new Player(this, x, y, player.id, player.name, player.role, isLocal);
      
      this.players[player.id] = p;

      if (player.role === 'hider') {
        this.hidersGroup.add(p);
      } else if (player.role === 'seeker') {
        this.seeker = p;
      }

      if (isLocal) {
        this.localPlayer = p;
      }

      // Setup collision boundary boundaries with physics layers
      this.collisionManager.addWorldCollisions(p, this.collisionLayer, this.obstaclesLayer);
    });

    // If local player isn't loaded (e.g. testing fallback), make first player local
    if (!this.localPlayer) {
      const firstPlayerId = Object.keys(this.players)[0];
      this.localPlayer = this.players[firstPlayerId];
      this.localPlayer.isLocal = true;
    }

    // Set Seeker overlap caught check
    if (this.seeker && this.hidersGroup.getLength() > 0) {
      this.collisionManager.addPlayerCatchOverlap(
        this.seeker,
        this.hidersGroup,
        (hiderId) => this.handlePlayerCaught(hiderId)
      );
    }
  }

  /**
   * Sets up camera follow bounds.
   */
  setupCamera() {
    if (this.localPlayer) {
      this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
      this.cameras.main.startFollow(this.localPlayer, true, 0.08, 0.08); // smooth follow
      this.cameras.main.setZoom(1.1); // zoom in on players
    }
  }

  /**
   * Prepares the HUD display layout in the top-left corner.
   */
  setupHUD() {
    this.hudContainer = this.add.container(16, 16).setScrollFactor(0);

    // Dark backdrop backing panel
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.85); // dark blue-slate
    bg.lineStyle(1.5, 0x3b82f6, 1);  // blue border glow
    bg.fillRoundedRect(0, 0, 180, 80, 8);
    bg.strokeRoundedRect(0, 0, 180, 80, 8);
    this.hudContainer.add(bg);

    // Text elements
    this.hudTimeText = this.add.text(12, 10, 'TIME LEFT: 120s', {
      font: 'bold 12px monospace',
      fill: '#f8fafc'
    });
    
    const roleColor = this.playerRole === 'seeker' ? '#f87171' : '#34d399';
    this.hudRoleText = this.add.text(12, 32, `MY ROLE: ${this.playerRole.toUpperCase()}`, {
      font: 'bold 12px monospace',
      fill: roleColor
    });

    this.hudRemainingText = this.add.text(12, 54, 'ALIVE HIDERS: -/-', {
      font: 'bold 12px monospace',
      fill: '#94a3b8'
    });

    this.hudContainer.add([this.hudTimeText, this.hudRoleText, this.hudRemainingText]);
    this.hudContainer.setDepth(100);

    this.updateHidersRemainingHUD();
  }

  updateTimerHUD(timeLeft) {
    if (this.hudTimeText) {
      this.hudTimeText.setText(`TIME LEFT: ${timeLeft}s`);
    }
  }

  updateHidersRemainingHUD() {
    if (!this.hudRemainingText) return;

    const totalHiders = this.lobbyPlayers.filter(p => p.role === 'hider').length;
    const activeHiders = Object.values(this.players).filter(p => p.role === 'hider' && !p.isCaught).length;

    this.hudRemainingText.setText(`ALIVE HIDERS: ${activeHiders}/${totalHiders}`);
  }

  /**
   * Binds socket events to react to other network updates.
   */
  setupNetworkListeners() {
    // 1. Move remote players
    this.socketManager.on('playerMove', (data) => {
      const remotePlayer = this.players[data.id];
      if (remotePlayer && !remotePlayer.isLocal) {
        remotePlayer.applyNetworkUpdate(data.x, data.y, data.vx, data.vy, data.animation);
      }
    });

    // 2. Catch hider update
    this.socketManager.on('playerCaught', (data) => {
      const caughtPlayer = this.players[data.hiderId];
      if (caughtPlayer && !caughtPlayer.isCaught) {
        caughtPlayer.caught();
        this.updateHidersRemainingHUD();
        this.checkWinConditions();
      }
    });

    // 3. Round end update
    this.socketManager.on('roundEnd', (data) => {
      this.endRound(data.winner, data.reason);
    });
  }

  /**
   * Publishes local player move data.
   */
  sendLocalMovement() {
    if (this.localPlayer && !this.localPlayer.isCaught && !this.roundOver) {
      const vx = this.localPlayer.body.velocity.x / this.localPlayer.speed;
      const vy = this.localPlayer.body.velocity.y / this.localPlayer.speed;
      
      let animSuffix = 'idle_down';
      if (this.localPlayer.anims.currentAnim) {
        // Strip the player_ prefix to keep network payload thin
        animSuffix = this.localPlayer.anims.currentAnim.key.replace('player_', '');
      }

      this.socketManager.sendPlayerMove(
        this.localPlayer.x,
        this.localPlayer.y,
        vx,
        vy,
        animSuffix
      );
    }
  }

  /**
   * Executes when the seeker catches a hider locally.
   */
  handlePlayerCaught(hiderId) {
    if (this.roundOver) return;
    this.socketManager.sendPlayerCaught(hiderId);
  }

  /**
   * Executes when the countdown timer expires.
   */
  handleTimerTimeout() {
    if (this.roundOver) return;

    // Only host dictates time expiration to prevent multiple events
    const isHost = this.lobbyPlayers.find(p => p.isLocal)?.host;
    if (isHost && this.socketManager.sendTimeExpired) {
      this.socketManager.sendTimeExpired();
    }
  }

  /**
   * Inspects hider counts to verify matches locally.
   */
  checkWinConditions() {
    if (this.roundOver) return;

    // Check if any hiders remain uncaught
    const activeHiders = Object.values(this.players).filter((p) => p.role === 'hider' && !p.isCaught);
    
    if (activeHiders.length === 0) {
      // All caught: Seeker wins!
      this.endRound('seeker', 'All Hiders Caught!');
    }
  }

  /**
   * Triggers round shutdown and ends kinematics.
   */
  endRound(winner, reason) {
    if (this.roundOver) return;
    this.roundOver = true;

    // Stop timer
    if (this.timerManager) {
      this.timerManager.stop();
    }

    // Halt all player velocities
    Object.values(this.players).forEach((p) => {
      p.stop();
      if (p.body) p.body.enable = false;
    });

    this.winner = winner;
    this.winReason = reason;

    // Render result overlay screen
    this.createEndGameOverlay();
  }

  /**
   * Builds the results canvas overlay.
   */
  createEndGameOverlay() {
    const width = this.scale.width;
    const height = this.scale.height;

    const overlay = this.add.container(0, 0).setScrollFactor(0);
    overlay.setDepth(1000);

    // 1. Transparent Backdrop screen tint
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x020617, 0.85); // Slate slate black
    backdrop.fillRect(0, 0, width, height);
    overlay.add(backdrop);

    // Determine local victory or defeat
    // If local player role matches winning role, it is a VICTORY, else DEFEAT.
    // Handle both 'seeker' and 'seekers'/'hiders' plural forms gracefully
    const normalizedWinner = this.winner.replace(/s$/, '').toLowerCase();
    const isLocalWinner = this.playerRole === normalizedWinner;
    const titleText = isLocalWinner ? 'VICTORY' : 'DEFEAT';
    const accentColor = isLocalWinner ? '#10b981' : '#ef4444'; // green vs red
    const borderHex = isLocalWinner ? 0x10b981 : 0xef4444;

    // Centered dialogue box
    const boxW = 340;
    const boxH = 240;
    const boxX = width / 2;
    const boxY = height / 2;

    const card = this.add.graphics();
    card.fillStyle(0x0f172a, 0.95);
    card.lineStyle(2.5, borderHex, 1);
    card.fillRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 10);
    card.strokeRoundedRect(boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, 10);
    overlay.add(card);

    // Title label
    const titleLabel = this.add.text(boxX, boxY - 60, titleText, {
      font: 'bold 36px monospace',
      fill: accentColor
    }).setOrigin(0.5);
    overlay.add(titleLabel);

    // Reason subtitle
    const reasonLabel = this.add.text(boxX, boxY - 15, `${this.winner.toUpperCase()}S WIN - ${this.winReason.toUpperCase()}`, {
      font: 'bold 11px Courier New, monospace',
      fill: '#94a3b8'
    }).setOrigin(0.5);
    overlay.add(reasonLabel);

    // Buttons
    // Play Again returns to the Lobby to start a new match
    const playAgainBtn = this.createButton(boxX, boxY + 35, 200, 36, 'RETURN TO LOBBY', '#3b82f6', () => {
      window.dispatchEvent(new CustomEvent('phaser-play-again'));
    });

    // Exit Match signals React page exit
    const exitMatchBtn = this.createButton(boxX, boxY + 80, 200, 36, 'EXIT MATCH', '#64748b', () => {
      // Dispatches a global window event that Game.jsx will capture
      window.dispatchEvent(new CustomEvent('phaser-exit-match'));
    });

    overlay.add([playAgainBtn, exitMatchBtn]);
  }

  /**
   * Helper to draw clean interactive UI buttons.
   */
  createButton(x, y, w, h, label, hoverColorStr, callback) {
    const container = this.add.container(0, 0);
    const graphics = this.add.graphics();
    const targetColor = Phaser.Display.Color.HexStringToColor(hoverColorStr).color;

    const text = this.add.text(x, y, label, {
      font: 'bold 11px Courier New, monospace',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });

    const render = (hovered) => {
      graphics.clear();
      if (hovered) {
        graphics.fillStyle(targetColor, 0.95);
        graphics.lineStyle(1.5, 0xffffff, 1);
        text.setFill('#ffffff');
      } else {
        graphics.fillStyle(0x1e293b, 0.85); // dark grey
        graphics.lineStyle(1.5, targetColor, 1);
        text.setFill(hoverColorStr);
      }
      graphics.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      graphics.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };

    render(false);

    zone.on('pointerdown', callback);
    zone.on('pointerover', () => render(true));
    zone.on('pointerout', () => render(false));

    container.add([graphics, text, zone]);
    return container;
  }

  /**
   * Shutdown network updates when changing scene.
   */
  shutdown() {
    if (this.socketManager) {
      this.socketManager.destroy();
    }
  }
}
