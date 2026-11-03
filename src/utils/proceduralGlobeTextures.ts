import * as THREE from 'three';

/**
 * Fast deterministic 2D/3D value noise & Fractal Brownian Motion (fBm)
 * for realistic terrain elevation, biome variation, and cloud formations.
 */
function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}

function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * High-detail geographic coastline polygons [lon, lat] for accurate world continents,
 * peninsulas, seas, and major islands.
 */
const WORLD_LANDMASS_POLYGONS: [number, number][][] = [
  // North America & Central America
  [
    [-168, 66], [-162, 70], [-140, 70], [-125, 71], [-105, 73], [-85, 73],
    [-75, 70], [-65, 65], [-80, 62], [-90, 57], [-78, 53], [-62, 58],
    [-55, 52], [-53, 47], [-60, 45], [-66, 44], [-70, 42], [-75, 35],
    [-80, 31], [-80, 25], [-82, 26], [-84, 30], [-90, 29], [-96, 28],
    [-97, 22], [-90, 21], [-87, 21], [-88, 16], [-83, 15], [-84, 10],
    [-79, 9], [-77, 8], [-82, 8], [-86, 11], [-92, 14], [-97, 16],
    [-105, 20], [-109, 24], [-112, 31], [-115, 30], [-110, 23], [-115, 28],
    [-120, 34], [-124, 40], [-124, 48], [-130, 54], [-136, 58], [-148, 61],
    [-160, 56], [-166, 60], [-168, 66]
  ],
  // Greenland
  [
    [-72, 77], [-55, 82], [-30, 83], [-18, 77], [-22, 70], [-36, 65],
    [-44, 60], [-52, 64], [-55, 72], [-72, 77]
  ],
  // Baffin & Canadian Arctic Islands
  [
    [-85, 76], [-65, 73], [-62, 66], [-75, 65], [-88, 70], [-85, 76]
  ],
  // Cuba & Hispaniola
  [
    [-85, 22], [-79, 23], [-74, 20], [-78, 20], [-84, 21], [-85, 22]
  ],
  [
    [-74, 19.5], [-68.5, 19], [-71, 17.8], [-74, 18.5], [-74, 19.5]
  ],
  // Iceland
  [
    [-24, 66], [-14, 66.3], [-13.5, 64.2], [-22, 63.5], [-24.5, 65], [-24, 66]
  ],
  // South America
  [
    [-77, 9], [-75, 11], [-68, 11], [-61, 10], [-50, 2], [-44, -2],
    [-35, -6], [-38, -13], [-39, -18], [-41, -22], [-48, -26], [-53, -33],
    [-58, -38], [-62, -41], [-65, -45], [-67, -50], [-68, -55], [-74, -52],
    [-75, -45], [-73, -37], [-71, -30], [-70, -18], [-76, -14], [-81, -5],
    [-80, 1], [-77, 9]
  ],
  // UK & Ireland
  [
    [-6, 58.5], [-2, 57.5], [1.5, 52.5], [1, 51], [-5, 50], [-5.5, 54], [-6, 58.5]
  ],
  [
    [-10, 54.5], [-6, 55], [-6, 52], [-10, 51.5], [-10, 54.5]
  ],
  // Eurasia (Europe + Asia + India + SE Asia + Kamchatka + Arabian Peninsula)
  [
    [-9, 37], [-9, 43], [-2, 43.5], [-4.5, 48.5], [2, 51], [8, 54],
    [10, 57], [8, 54.5], [14, 54], [21, 56], [28, 60], [21, 63],
    [25, 65], [18, 60], [12, 56], [5, 60], [10, 65], [18, 70],
    [28, 71], [40, 68], [43, 66], [55, 68], [68, 71], [75, 73],
    [90, 75], [105, 77], [125, 73], [145, 71], [170, 69], [178, 66],
    [163, 60], [160, 51], [156, 53], [158, 59], [142, 59], [140, 52],
    [135, 45], [131, 43], [129, 35], [126, 37], [124, 40], [121, 39],
    [118, 38], [122, 37], [121, 31], [120, 25], [114, 22], [108, 21],
    [109, 13], [105, 9], [102, 13], [100, 13], [103, 2], [100, 5],
    [98, 16], [94, 16], [91, 22], [88, 21], [85, 19], [80, 13],
    [77, 8], [74, 15], [72, 21], [68, 24], [62, 25], [56, 27],
    [49, 30], [50, 26], [55, 24], [60, 22], [52, 15], [44, 12.5],
    [40, 20], [35, 29], [33, 31], [35, 33], [36, 36], [27, 37],
    [26, 40], [23, 37.5], [20, 40], [15, 45], [13, 45], [16, 40],
    [15, 38], [12, 42], [9, 44], [5, 43], [3, 42], [-2, 36.5],
    [-5.5, 36], [-9, 37]
  ],
  // Africa
  [
    [-17, 15], [-16, 22], [-13, 28], [-6, 35.8], [3, 37], [10, 37],
    [11, 33], [20, 32], [25, 31.5], [32, 31.5], [34, 28], [38, 20],
    [43, 12], [51, 12], [49, 5], [41, -2], [40, -11], [35, -18],
    [35, -24], [31, -30], [26, -34], [18.5, -34.5], [17, -28], [14, -22],
    [12, -16], [12, -6], [9, 0], [9, 4], [3, 6], [-4, 5],
    [-8, 4.5], [-13, 9], [-17, 15]
  ],
  // Madagascar
  [
    [49, -12], [50.5, -16], [47, -25], [44, -25], [44, -18], [47, -14], [49, -12]
  ],
  // Sri Lanka
  [
    [80, 9.8], [81.8, 7.5], [80.5, 6], [79.8, 7.5], [80, 9.8]
  ],
  // Japan (Honshu, Hokkaido, Kyushu)
  [
    [141, 45.5], [145, 43.5], [141, 42], [140, 43.5], [141, 45.5]
  ],
  [
    [140.5, 41], [141, 38], [140, 35], [136, 34.5], [131, 34],
    [130, 31.5], [132, 33], [136, 36], [139, 38.5], [140.5, 41]
  ],
  // Taiwan & Philippines
  [
    [121, 25], [122, 23.5], [120.8, 22], [120.2, 23.5], [121, 25]
  ],
  [
    [120.5, 18.5], [122.5, 16], [124, 13], [126, 9], [125, 6],
    [122, 7], [121, 13], [119.8, 16], [120.5, 18.5]
  ],
  // Indonesia (Sumatra, Java, Borneo, Sulawesi, New Guinea)
  [
    [95.5, 5.5], [100, 1], [106, -5.8], [104, -6], [99, -1], [95.5, 5.5]
  ],
  [
    [105.5, -6.2], [110, -6.8], [114.5, -8.2], [113, -8.8], [106, -7.2], [105.5, -6.2]
  ],
  [
    [109, 2], [115, 4.5], [118.5, 4.5], [117.5, -1], [114.5, -4],
    [110, -3], [109, 2]
  ],
  [
    [120, 1], [125, 1.5], [122, -2], [123, -5], [119.5, -5.5], [119, -1], [120, 1]
  ],
  [
    [131, -1], [136, -2], [141, -2.5], [147, -6], [150, -10],
    [147, -9.5], [141, -8], [136, -5], [131, -1]
  ],
  // Australia & Tasmania
  [
    [114, -22], [122, -17], [130, -12], [136, -12], [137, -15],
    [141, -17], [142.5, -11], [146, -18], [150, -23], [153.5, -28],
    [150, -37], [146, -39], [140, -38], [136, -34], [130, -32],
    [122, -34], [115, -34], [113, -26], [114, -22]
  ],
  [
    [145, -40.8], [148.2, -41], [147, -43.5], [145.2, -43], [145, -40.8]
  ],
  // New Zealand (North & South Islands)
  [
    [173, -35], [178, -37.5], [175, -41.5], [174, -39], [173, -35]
  ],
  [
    [173.5, -41], [174, -42.5], [170.5, -46], [166.5, -46], [168, -44], [171, -41.5], [173.5, -41]
  ],
  // Antarctica
  [
    [-180, -76], [-150, -77], [-120, -74], [-90, -72], [-65, -64],
    [-58, -64], [-60, -73], [-30, -76], [0, -70], [40, -68],
    [75, -69], [110, -66], [145, -67], [170, -72], [170, -78],
    [180, -78], [180, -90], [-180, -90]
  ]
];

/**
 * Major mountain chains [lon, lat, radiusDeg, heightWeight] for realistic relief & snow caps
 */
const MOUNTAIN_RANGES: [number, number, number, number][] = [
  // Himalayas & Tibetan Plateau
  [82, 30, 14, 1.0],
  [90, 32, 12, 0.95],
  [75, 35, 10, 0.9],
  // Andes (South America)
  [-75, -8, 6, 0.85],
  [-70, -18, 7, 0.9],
  [-69, -28, 6, 0.9],
  [-71, -40, 5, 0.75],
  // Rocky Mountains & Coast Ranges
  [-116, 52, 8, 0.75],
  [-110, 42, 9, 0.8],
  [-106, 38, 8, 0.75],
  [-148, 62, 7, 0.85], // Alaska Range
  // European Alps & Caucasus
  [10, 46.5, 5, 0.8],
  [44, 42, 5, 0.75],
  // East African Highlands & Ethiopian Plateau
  [38, 9, 7, 0.65],
  [36, -3, 6, 0.65],
];

export interface EarthTextureBundle {
  albedoMap: THREE.Texture;
  bumpMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  cloudsMap: THREE.Texture;
  nightLightsMap: THREE.Texture;
  cutawayWallMap: THREE.Texture;
  dispose: () => void;
}

/**
 * Generates high-definition 2048x1024 photorealistic Earth textures
 * (Albedo Blue Marble, Topographic Bump Map, Specular/Roughness Ocean Map,
 * Atmospheric Cloud Layer, and Night City Lights) AND attempts to upgrade
 * with official Three.js / NASA Blue Marble satellite maps when online.
 */
export function createRealisticEarthTextures(
  onUpgradeLoaded?: () => void
): EarthTextureBundle {
  const width = 2048;
  const height = 1024;

  // 1. Create Land-Ocean Mask Canvas first
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d')!;

  maskCtx.fillStyle = '#000000';
  maskCtx.fillRect(0, 0, width, height);

  const mapCoords = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * width,
    ((90 - lat) / 180) * height,
  ];

  // Draw slightly blurred outer coastal shelf mask in B channel, sharp land in R channel
  maskCtx.save();
  maskCtx.filter = 'blur(8px)';
  maskCtx.fillStyle = '#0000ff'; // Coastal continental shelf
  for (const poly of WORLD_LANDMASS_POLYGONS) {
    maskCtx.beginPath();
    const [sx, sy] = mapCoords(poly[0][0], poly[0][1]);
    maskCtx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = mapCoords(poly[i][0], poly[i][1]);
      maskCtx.lineTo(px, py);
    }
    maskCtx.closePath();
    maskCtx.fill();
  }
  maskCtx.restore();

  // Draw crisp landmass in Red + Green channel
  maskCtx.fillStyle = '#ff0000';
  for (const poly of WORLD_LANDMASS_POLYGONS) {
    maskCtx.beginPath();
    const [sx, sy] = mapCoords(poly[0][0], poly[0][1]);
    maskCtx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = mapCoords(poly[i][0], poly[i][1]);
      maskCtx.lineTo(px, py);
    }
    maskCtx.closePath();
    maskCtx.fill();
  }

  const maskData = maskCtx.getImageData(0, 0, width, height).data;

  // Prepare output canvases
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  const albedoImg = albedoCtx.createImageData(width, height);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  const bumpImg = bumpCtx.createImageData(width, height);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(width, height);

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nightCtx = nightCanvas.getContext('2d')!;
  const nightImg = nightCtx.createImageData(width, height);

  // Pixel-by-pixel synthesis of NASA Blue Marble biomes, bathymetry, elevation, and roughness
  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const absLat = Math.abs(lat);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      const landMask = maskData[idx] / 255; // 1 on land, 0 on ocean
      const shelfMask = maskData[idx + 2] / 255; // 1 near coast

      // Multi-scale terrain fractal noise
      const nx = (lon + 180) * 0.045;
      const ny = (lat + 90) * 0.045;
      const n1 = fbm(nx, ny, 4);
      const n2 = fbm(nx * 2.7 + 13.4, ny * 2.7 + 7.1, 3);

      // Coastline organic perturbation so edges look like natural fractal fjords/bays
      const isLand = landMask > 0.48 - (n2 - 0.5) * 0.28;

      if (!isLand) {
        // --- OCEAN & BATHYMETRY ---
        // Deep abyss vs mid-ocean ridge vs turquoise continental shelf
        const shelfFactor = Math.max(0, Math.min(1, shelfMask * 1.4 + (n1 - 0.5) * 0.25));
        const tropicCoral = Math.max(0, 1 - absLat / 35) * Math.pow(shelfFactor, 2.2);

        // Deep sapphire blue (#071b3b) -> Ocean blue (#0d3166) -> Turquoise shelf (#1ca3b8)
        let r = 7 + shelfFactor * 16 + tropicCoral * 28 + n1 * 8;
        let g = 26 + shelfFactor * 48 + tropicCoral * 95 + n1 * 14;
        let b = 58 + shelfFactor * 68 + tropicCoral * 75 + n1 * 22;

        // Arctic / Southern Ocean sea ice near poles
        if (absLat > 74 + (n1 - 0.5) * 8) {
          const iceBlend = Math.min(1, (absLat - 72) / 10);
          r = r * (1 - iceBlend) + 230 * iceBlend;
          g = g * (1 - iceBlend) + 238 * iceBlend;
          b = b * (1 - iceBlend) + 248 * iceBlend;
        }

        albedoImg.data[idx] = Math.min(255, r);
        albedoImg.data[idx + 1] = Math.min(255, g);
        albedoImg.data[idx + 2] = Math.min(255, b);
        albedoImg.data[idx + 3] = 255;

        // Ocean elevation (flat water level with subtle mid-ocean ridge bump)
        const waterBump = Math.floor(30 + shelfFactor * 20);
        bumpImg.data[idx] = waterBump;
        bumpImg.data[idx + 1] = waterBump;
        bumpImg.data[idx + 2] = waterBump;
        bumpImg.data[idx + 3] = 255;

        // Ocean roughness: glossy specular water (low roughness = 45/255 ≈ 0.18)
        roughImg.data[idx] = 45;
        roughImg.data[idx + 1] = 45;
        roughImg.data[idx + 2] = 45;
        roughImg.data[idx + 3] = 255;

        // Dark ocean at night
        nightImg.data[idx] = 2;
        nightImg.data[idx + 1] = 4;
        nightImg.data[idx + 2] = 10;
        nightImg.data[idx + 3] = 255;
      } else {
        // --- CONTINENTAL LAND BIOMES & TOPOGRAPHY ---
        // Calculate mountain elevation
        let mountainElev = 0;
        for (const [mlon, mlat, mrad, mweight] of MOUNTAIN_RANGES) {
          const dLon = (lon - mlon) * Math.cos((lat * Math.PI) / 180);
          const dLat = lat - mlat;
          const dist = Math.sqrt(dLon * dLon + dLat * dLat);
          if (dist < mrad) {
            const falloff = 1 - dist / mrad;
            mountainElev = Math.max(mountainElev, falloff * falloff * mweight);
          }
        }
        const totalElev = Math.min(1, 0.25 + n1 * 0.45 + mountainElev * 0.65);

        // Determine climate & biome
        // 1. Desert belts (Sahara, Arabia, Australian Outback, Gobi, Sonora/Atacama)
        let desertFactor = 0;
        // Sahara & Arabian desert (lat 14..33, lon -17..60)
        if (lat > 13 && lat < 33 && lon > -18 && lon < 62) {
          desertFactor = Math.max(desertFactor, 0.88 - Math.abs(lat - 23) / 14);
        }
        // Central Asia / Gobi / Taklamakan (lat 36..48, lon 55..112)
        if (lat > 35 && lat < 48 && lon > 52 && lon < 112) {
          desertFactor = Math.max(desertFactor, 0.72 * n1);
        }
        // Australian Outback (lat -31..-18, lon 114..144)
        if (lat > -31 && lat < -18 && lon > 114 && lon < 144) {
          desertFactor = Math.max(desertFactor, 0.85);
        }
        // SW North America / Sonora (lat 22..37, lon -117..-102)
        if (lat > 22 && lat < 37 && lon > -117 && lon < -102) {
          desertFactor = Math.max(desertFactor, 0.7);
        }
        // Namib / Kalahari (lat -29..-18, lon 12..26)
        if (lat > -29 && lat < -18 && lon > 12 && lon < 26) {
          desertFactor = Math.max(desertFactor, 0.72);
        }

        // 2. Tropical Rainforest (Amazon, Congo, Indonesia) near equator
        const rainforestFactor = Math.max(0, 1 - absLat / 18) * (1 - desertFactor * 0.9);

        // 3. Boreal Taiga & Temperate Forest (lat 42..66)
        const borealFactor = Math.max(0, 1 - Math.abs(absLat - 54) / 16) * (1 - desertFactor * 0.8);

        // Base Temperate Grassland / Savanna olive-green
        let r = 68 + n2 * 35;
        let g = 104 + n2 * 32;
        let b = 50 + n2 * 18;

        // Blend Tropical Rainforest (Deep lush emerald #1c4d26)
        r = r * (1 - rainforestFactor) + (26 + n1 * 22) * rainforestFactor;
        g = g * (1 - rainforestFactor) + (78 + n1 * 34) * rainforestFactor;
        b = b * (1 - rainforestFactor) + (32 + n1 * 18) * rainforestFactor;

        // Blend Boreal Forest (Dark pine green #24422c)
        r = r * (1 - borealFactor * 0.7) + 36 * (borealFactor * 0.7);
        g = g * (1 - borealFactor * 0.7) + 68 * (borealFactor * 0.7);
        b = b * (1 - borealFactor * 0.7) + 42 * (borealFactor * 0.7);

        // Blend Arid Desert Sands (Warm golden ochre/terracotta #c9a16b)
        const dClamp = Math.max(0, Math.min(1, desertFactor + (n2 - 0.5) * 0.2));
        r = r * (1 - dClamp) + (198 + n1 * 38) * dClamp;
        g = g * (1 - dClamp) + (156 + n1 * 32) * dClamp;
        b = b * (1 - dClamp) + (102 + n1 * 24) * dClamp;

        // Blend High Mountain Rock & Alpine Snow Caps
        if (mountainElev > 0.25) {
          const rockFactor = Math.min(1, (mountainElev - 0.25) * 1.8);
          r = r * (1 - rockFactor) + (115 + n2 * 40) * rockFactor;
          g = g * (1 - rockFactor) + (106 + n2 * 38) * rockFactor;
          b = b * (1 - rockFactor) + (98 + n2 * 36) * rockFactor;

          if (mountainElev + n2 * 0.25 > 0.68) {
            const snowPeak = Math.min(1, (mountainElev + n2 * 0.25 - 0.68) * 3.0);
            r = r * (1 - snowPeak) + 245 * snowPeak;
            g = g * (1 - snowPeak) + 248 * snowPeak;
            b = b * (1 - snowPeak) + 252 * snowPeak;
          }
        }

        // Polar Ice Caps (Antarctica, Greenland, High Arctic Tundra)
        const isGreenland = lat > 60 && lat < 84 && lon > -73 && lon < -17;
        if (absLat > 68 + (n1 - 0.5) * 8 || isGreenland) {
          const polarSnow = isGreenland ? 0.92 : Math.min(1, (absLat - 66) / 10);
          r = r * (1 - polarSnow) + 242 * polarSnow;
          g = g * (1 - polarSnow) + 246 * polarSnow;
          b = b * (1 - polarSnow) + 252 * polarSnow;
        }

        albedoImg.data[idx] = Math.max(0, Math.min(255, r));
        albedoImg.data[idx + 1] = Math.max(0, Math.min(255, g));
        albedoImg.data[idx + 2] = Math.max(0, Math.min(255, b));
        albedoImg.data[idx + 3] = 255;

        // Topographic elevation heightmap (80..255)
        const bumpVal = Math.min(255, Math.floor(85 + totalElev * 170));
        bumpImg.data[idx] = bumpVal;
        bumpImg.data[idx + 1] = bumpVal;
        bumpImg.data[idx + 2] = bumpVal;
        bumpImg.data[idx + 3] = 255;

        // Land roughness: matte surface (215/255 ≈ 0.84)
        roughImg.data[idx] = 215;
        roughImg.data[idx + 1] = 215;
        roughImg.data[idx + 2] = 215;
        roughImg.data[idx + 3] = 255;

        // Night City Lights (coastal & temperate population centers)
        const popLat = absLat > 8 && absLat < 56 ? 1 : 0;
        const coastalBias = 1 - Math.min(1, shelfMask * 0.5);
        const citySignal = popLat * (1 - desertFactor) * (1 - mountainElev) * fbm(lon * 0.6, lat * 0.6, 3);
        if (citySignal > 0.58 + coastalBias * 0.08) {
          const glow = Math.min(1, (citySignal - 0.58) * 5.5);
          nightImg.data[idx] = Math.floor(255 * glow);
          nightImg.data[idx + 1] = Math.floor(195 * glow);
          nightImg.data[idx + 2] = Math.floor(95 * glow);
        } else {
          nightImg.data[idx] = 4;
          nightImg.data[idx + 1] = 6;
          nightImg.data[idx + 2] = 12;
        }
        nightImg.data[idx + 3] = 255;
      }
    }
  }

  albedoCtx.putImageData(albedoImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  nightCtx.putImageData(nightImg, 0, 0);

  // 2. Generate Realistic Cloud Layer Canvas (1024x512)
  const cloudW = 1024;
  const cloudH = 512;
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = cloudW;
  cloudCanvas.height = cloudH;
  const cloudCtx = cloudCanvas.getContext('2d')!;
  const cloudImg = cloudCtx.createImageData(cloudW, cloudH);

  for (let y = 0; y < cloudH; y++) {
    const lat = 90 - (y / cloudH) * 180;
    const absLat = Math.abs(lat);
    // Atmospheric circulation bands (ITCZ equator + mid-latitude storm tracks)
    const bandWeight =
      0.65 +
      0.35 * Math.exp(-(lat * lat) / 120) +
      0.3 * Math.exp(-Math.pow(absLat - 48, 2) / 180);

    for (let x = 0; x < cloudW; x++) {
      const lon = (x / cloudW) * 360 - 180;
      const idx = (y * cloudW + x) * 4;

      // Swirling trade-wind domain-warped FBM clouds
      const warpX = fbm(lon * 0.025, lat * 0.04, 3) * 18;
      const warpY = fbm(lon * 0.025 + 5.2, lat * 0.04 + 1.3, 3) * 10;
      const cVal = fbm((lon + warpX) * 0.035, (lat + warpY) * 0.05, 5) * bandWeight;

      const alpha = Math.max(0, Math.min(255, Math.floor((cVal - 0.47) * 520)));
      cloudImg.data[idx] = 255;
      cloudImg.data[idx + 1] = 255;
      cloudImg.data[idx + 2] = 255;
      cloudImg.data[idx + 3] = alpha;
    }
  }
  cloudCtx.putImageData(cloudImg, 0, 0);

  // 3. Generate Cross-Sectional Earth Interior Wall Texture (Crust -> Mantle -> Core)
  const wallSize = 1024;
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = wallSize;
  wallCanvas.height = wallSize;
  const wallCtx = wallCanvas.getContext('2d')!;
  const cx = wallSize / 2;
  const cy = wallSize / 2;
  const maxR = wallSize / 2;

  const radGrad = wallCtx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  // Inner Solid Core (0 - 19% radius: 5150-6371 km depth)
  radGrad.addColorStop(0.0, '#fffbeb');
  radGrad.addColorStop(0.18, '#fde047');
  radGrad.addColorStop(0.19, '#ca8a04');
  // Outer Liquid Core (19% - 54.6% radius: 2890-5150 km depth)
  radGrad.addColorStop(0.195, '#fb923c');
  radGrad.addColorStop(0.54, '#ea580c');
  radGrad.addColorStop(0.546, '#9a3412');
  // Lower Mantle / Mesosphere (54.6% - 89.6% radius: 660-2890 km depth)
  radGrad.addColorStop(0.55, '#dc2626');
  radGrad.addColorStop(0.88, '#991b1b');
  // Transition Zone & Asthenosphere Upper Mantle (89.6% - 98.5% radius: 65-660 km depth)
  radGrad.addColorStop(0.896, '#b91c1c');
  radGrad.addColorStop(0.98, '#f97316');
  // Lithosphere Crust (98.5% - 100% radius: 0-65 km depth)
  radGrad.addColorStop(0.985, '#334155');
  radGrad.addColorStop(1.0, '#0f172a');

  wallCtx.fillStyle = radGrad;
  wallCtx.fillRect(0, 0, wallSize, wallSize);

  // Draw crisp seismic discontinuity boundary rings (Core-Mantle Gutenberg boundary, 660km ring, Moho)
  const boundaryRadii = [0.191, 0.546, 0.896, 0.985];
  boundaryRadii.forEach((ratio) => {
    wallCtx.beginPath();
    wallCtx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
    wallCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    wallCtx.lineWidth = 2;
    wallCtx.stroke();
  });

  // Convert canvases to Three.js Textures
  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.ClampToEdgeWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;

  const cloudsMap = new THREE.CanvasTexture(cloudCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.wrapS = THREE.RepeatWrapping;
  cloudsMap.wrapT = THREE.ClampToEdgeWrapping;

  const nightLightsMap = new THREE.CanvasTexture(nightCanvas);
  nightLightsMap.colorSpace = THREE.SRGBColorSpace;
  nightLightsMap.wrapS = THREE.RepeatWrapping;
  nightLightsMap.wrapT = THREE.ClampToEdgeWrapping;

  const cutawayWallMap = new THREE.CanvasTexture(wallCanvas);
  cutawayWallMap.colorSpace = THREE.SRGBColorSpace;

  // Attempt seamless upgrade from high-resolution satellite CDN if reachable in user's browser
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  const CDN_BASE = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets';

  loader.load(
    `${CDN_BASE}/earth_atmos_2048.jpg`,
    (satTex) => {
      if (satTex.image) {
        albedoCtx.drawImage(satTex.image, 0, 0, width, height);
        albedoMap.needsUpdate = true;
        onUpgradeLoaded?.();
      }
    },
    undefined,
    () => {
      // Quietly retain high-res procedural Blue Marble if offline/blocked
    }
  );

  loader.load(
    `${CDN_BASE}/earth_normal_2048.jpg`,
    (normTex) => {
      if (normTex.image) {
        bumpCtx.drawImage(normTex.image, 0, 0, width, height);
        bumpMap.needsUpdate = true;
        onUpgradeLoaded?.();
      }
    },
    undefined,
    () => {}
  );

  loader.load(
    `${CDN_BASE}/earth_clouds_1024.png`,
    (cldTex) => {
      if (cldTex.image) {
        cloudCtx.clearRect(0, 0, cloudW, cloudH);
        cloudCtx.drawImage(cldTex.image, 0, 0, cloudW, cloudH);
        cloudsMap.needsUpdate = true;
        onUpgradeLoaded?.();
      }
    },
    undefined,
    () => {}
  );

  loader.load(
    `${CDN_BASE}/earth_lights_2048.png`,
    (lightTex) => {
      if (lightTex.image) {
        nightCtx.drawImage(lightTex.image, 0, 0, width, height);
        nightLightsMap.needsUpdate = true;
        onUpgradeLoaded?.();
      }
    },
    undefined,
    () => {}
  );

  return {
    albedoMap,
    bumpMap,
    roughnessMap,
    cloudsMap,
    nightLightsMap,
    cutawayWallMap,
    dispose: () => {
      albedoMap.dispose();
      bumpMap.dispose();
      roughnessMap.dispose();
      cloudsMap.dispose();
      nightLightsMap.dispose();
      cutawayWallMap.dispose();
    },
  };
}

/**
 * Generates a realistic convective mantle texture for spherical mantle shells.
 */
export function createProceduralMantleTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const img = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;
      const n = fbm(u * 12, v * 6, 4);
      const hotPlume = Math.pow(n, 2.2);

      img.data[idx] = Math.min(255, Math.floor(140 + hotPlume * 115));
      img.data[idx + 1] = Math.min(255, Math.floor(25 + hotPlume * 155));
      img.data[idx + 2] = Math.min(255, Math.floor(5 + hotPlume * 45));
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
