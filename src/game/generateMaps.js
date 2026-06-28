import fs from 'fs';
import path from 'path';

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const TILE_SIZE = 32;

// Utility to create a blank array of size 1200
const createEmptyLayer = () => Array(MAP_WIDTH * MAP_HEIGHT).fill(0);

// Helper to set tile at (x, y)
const setTile = (layer, x, y, tileId) => {
  if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
    layer[y * MAP_WIDTH + x] = tileId;
  }
};

// Generate layout for a map
const generateMapData = (bgTile, wallTile, obstacleTile) => {
  const bg = createEmptyLayer().fill(bgTile);
  const coll = createEmptyLayer();
  const obst = createEmptyLayer();

  // 1. Draw outer border walls
  for (let x = 0; x < MAP_WIDTH; x++) {
    setTile(coll, x, 0, wallTile);
    setTile(coll, x, MAP_HEIGHT - 1, wallTile);
  }
  for (let y = 0; y < MAP_HEIGHT; y++) {
    setTile(coll, 0, y, wallTile);
    setTile(coll, MAP_WIDTH - 1, y, wallTile);
  }

  // 2. Draw some tactical interior rooms and blocks
  // Room 1: Top Left
  for (let x = 6; x <= 14; x++) {
    setTile(coll, x, 6, wallTile);
  }
  for (let y = 6; y <= 12; y++) {
    if (y !== 9) { // Leave a doorway gap at y = 9
      setTile(coll, 6, y, wallTile);
    }
  }

  // Room 2: Bottom Right
  for (let x = 25; x <= 33; x++) {
    setTile(coll, x, 23, wallTile);
  }
  for (let y = 17; y <= 23; y++) {
    if (y !== 20) { // Leave a doorway gap at y = 20
      setTile(coll, 33, y, wallTile);
    }
  }

  // Central Labyrinth barriers
  // Vertical column divider
  for (let y = 5; y <= 24; y++) {
    if (y !== 14 && y !== 15) { // Leave a large center gap
      setTile(coll, 20, y, wallTile);
    }
  }
  
  // Horizontal walls
  for (let x = 15; x <= 25; x++) {
    if (x !== 20) {
      setTile(coll, x, 15, wallTile);
    }
  }

  // 3. Scatter obstacles (trees/rocks/crates) to hide behind
  const obstaclePositions = [
    // Top right area
    { x: 30, y: 5 }, { x: 35, y: 8 }, { x: 28, y: 10 },
    // Center-left area
    { x: 10, y: 18 }, { x: 15, y: 22 }, { x: 5, y: 25 },
    // Inside top-left room
    { x: 10, y: 8 }, { x: 12, y: 10 },
    // Inside bottom-right room
    { x: 28, y: 20 }, { x: 30, y: 19 },
    // Scattered elsewhere
    { x: 18, y: 4 }, { x: 22, y: 26 }, { x: 3, y: 12 }, { x: 36, y: 16 }
  ];

  obstaclePositions.forEach(pos => {
    setTile(obst, pos.x, pos.y, obstacleTile);
  });

  return { bg, coll, obst };
};

// Generate complete Tiled JSON structure
const buildTiledJson = (mapName, bgTile, wallTile, obstacleTile, hiderSpawn, seekerSpawn) => {
  const { bg, coll, obst } = generateMapData(bgTile, wallTile, obstacleTile);

  return {
    compressionlevel: -1,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tilewidth: TILE_SIZE,
    tileheight: TILE_SIZE,
    infinite: false,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.9.2",
    version: "1.9",
    type: "map",
    tilesets: [
      {
        firstgid: 1,
        name: "tileset",
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        tilecount: 16,
        columns: 4
      }
    ],
    layers: [
      {
        data: bg,
        height: MAP_HEIGHT,
        id: 1,
        name: "background",
        opacity: 1,
        type: "tilelayer",
        visible: true,
        width: MAP_WIDTH,
        x: 0,
        y: 0
      },
      {
        data: coll,
        height: MAP_HEIGHT,
        id: 2,
        name: "collision",
        opacity: 1,
        type: "tilelayer",
        visible: true,
        width: MAP_WIDTH,
        x: 0,
        y: 0
      },
      {
        data: obst,
        height: MAP_HEIGHT,
        id: 3,
        name: "obstacle",
        opacity: 1,
        type: "tilelayer",
        visible: true,
        width: MAP_WIDTH,
        x: 0,
        y: 0
      },
      {
        id: 4,
        name: "spawnpoints",
        type: "objectgroup",
        visible: true,
        objects: [
          {
            id: 1,
            name: "hider_spawn",
            type: "spawn",
            class: "hider",
            x: hiderSpawn.x,
            y: hiderSpawn.y,
            width: TILE_SIZE,
            height: TILE_SIZE,
            point: true
          },
          {
            id: 2,
            name: "seeker_spawn",
            type: "spawn",
            class: "seeker",
            x: seekerSpawn.x,
            y: seekerSpawn.y,
            width: TILE_SIZE,
            height: TILE_SIZE,
            point: true
          }
        ]
      }
    ],
    nextlayerid: 5,
    nextobjectid: 3
  };
};

const main = () => {
  const outputDir = path.resolve('public/maps');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Forest Arena (Grass: 1, Wall: 2, Obstacle: 3)
  const forestMap = buildTiledJson(
    "Forest Arena",
    1, 2, 3,
    { x: 128, y: 128 }, // spawn top-left
    { x: 1152, y: 832 } // spawn bottom-right
  );
  fs.writeFileSync(path.join(outputDir, 'map_forest.json'), JSON.stringify(forestMap, null, 2));
  console.log("Generated public/maps/map_forest.json");

  // 2. Desert Valley (Sand: 4, Wall: 5, Obstacle: 6)
  const desertMap = buildTiledJson(
    "Desert Valley",
    4, 5, 6,
    { x: 128, y: 832 }, // spawn bottom-left
    { x: 1152, y: 128 } // spawn top-right
  );
  fs.writeFileSync(path.join(outputDir, 'map_desert.json'), JSON.stringify(desertMap, null, 2));
  console.log("Generated public/maps/map_desert.json");

  // 3. Snow Mountain (Snow: 7, Wall: 8, Obstacle: 9)
  const snowMap = buildTiledJson(
    "Snow Mountain",
    7, 8, 9,
    { x: 640, y: 128 }, // spawn top-center
    { x: 640, y: 832 } // spawn bottom-center
  );
  fs.writeFileSync(path.join(outputDir, 'map_snow.json'), JSON.stringify(snowMap, null, 2));
  console.log("Generated public/maps/map_snow.json");
};

main();
