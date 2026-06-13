import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BIOMES, BUILDINGS } from "./simulation.js";

const RADIUS = 3;
const TILE_RADIUS = 0.19;
const TILE_SEGMENTS = 18;
const MAX_CITIZENS = 90;
const MAX_WILDLIFE = 56;
const WORLD_TEXTURE_WIDTH = 512;
const WORLD_TEXTURE_HEIGHT = 256;

const TEXTURE_CONTINENTS = [
  { point: { x: -0.15, y: 0.26, z: 0.94 }, radius: 0.98, strength: 1.02 },
  { point: { x: 0.68, y: 0.02, z: 0.58 }, radius: 0.78, strength: 0.92 },
  { point: { x: -0.86, y: 0.03, z: -0.26 }, radius: 0.88, strength: 0.95 },
  { point: { x: 0.45, y: -0.48, z: -0.74 }, radius: 0.52, strength: 0.72 },
  { point: { x: -0.12, y: -0.88, z: 0.32 }, radius: 0.42, strength: 0.58 }
].map((seed) => {
  const length = Math.hypot(seed.point.x, seed.point.y, seed.point.z);
  return {
    ...seed,
    point: {
      x: seed.point.x / length,
      y: seed.point.y / length,
      z: seed.point.z / length
    }
  };
});

function seededValue(seed, salt = 0) {
  const n = Math.sin(seed * 41.133 + salt * 97.719) * 43758.5453123;
  return n - Math.floor(n);
}

function makeMaterial(color, roughness = 0.8, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });
}

function makeAtmosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      color: { value: new THREE.Color(0x7bdff2) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      void main() {
        float rim = pow(0.82 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
        gl_FragColor = vec4(color, clamp(rim, 0.0, 0.38));
      }
    `
  });
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function mixRgb(a, b, t) {
  const k = clamp01(t);
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k
  ];
}

function shadeRgb(color, amount) {
  return [
    Math.max(0, Math.min(255, color[0] * amount)),
    Math.max(0, Math.min(255, color[1] * amount)),
    Math.max(0, Math.min(255, color[2] * amount))
  ];
}

function pointFromTexture(x, y, width, height) {
  const u = x / width;
  const v = y / height;
  const lon = u * Math.PI * 2;
  const lat = (0.5 - v) * Math.PI;
  const cosLat = Math.cos(lat);
  return {
    x: -Math.cos(lon) * cosLat,
    y: Math.sin(lat),
    z: Math.sin(lon) * cosLat
  };
}

function smoothWave(point, salt) {
  const a = Math.sin(point.x * 2.5 + point.y * 1.8 + point.z * 3.2 + salt) * 0.52;
  const b = Math.sin(point.x * 5.4 - point.y * 3.1 + point.z * 2.2 + salt * 1.73) * 0.31;
  const c = Math.sin(point.x * 9.2 + point.y * 4.7 - point.z * 6.1 + salt * 2.41) * 0.17;
  return clamp01(0.5 + (a + b + c) * 0.5);
}

function sampleTextureSurface(point) {
  const latitude = Math.asin(point.y) / (Math.PI / 2);
  let land = 0;
  for (const seed of TEXTURE_CONTINENTS) {
    const dot = Math.max(-1, Math.min(1, point.x * seed.point.x + point.y * seed.point.y + point.z * seed.point.z));
    const angle = Math.acos(dot);
    const falloff = clamp01(1 - angle / seed.radius);
    land = Math.max(land, Math.pow(falloff, 0.58) * seed.strength);
  }

  const shelf = (smoothWave(point, 4.2) - 0.5) * 0.13;
  const coast = (smoothWave(point, 7.8) - 0.5) * 0.08;
  const ridge = Math.pow(clamp01((smoothWave(point, 13.1) - 0.5) * 2.1), 2.1) * clamp01(land * 1.4 - 0.16);
  const elevation = clamp01(0.25 + land * 0.63 + shelf + coast + ridge * 0.19);
  const moisture = smoothWave(point, 18.6);
  const heat = clamp01(1 - Math.abs(latitude) * 0.88 + (smoothWave(point, 21.4) - 0.5) * 0.26);
  const isOcean = elevation < 0.46;
  const isCoast = elevation >= 0.4 && elevation < 0.515;
  let biome = "plains";

  if (isOcean && isCoast) biome = "reef";
  else if (isOcean) biome = "ocean";
  else if (elevation > 0.79 || ridge > 0.56) biome = "mountain";
  else if (heat < 0.22) biome = "tundra";
  else if (moisture > 0.62) biome = "forest";
  else if (heat > 0.68 && moisture < 0.44) biome = "desert";

  return { biome, elevation, heat, latitude, moisture, ridge };
}

function surfaceColor(surface, point) {
  const palette = {
    oceanDeep: [8, 48, 78],
    ocean: [18, 108, 150],
    shelf: [44, 166, 170],
    coast: [189, 176, 116],
    plains: [105, 158, 77],
    forest: [42, 120, 70],
    desert: [212, 174, 96],
    mountain: [150, 145, 124],
    tundra: [156, 188, 181],
    snow: [226, 236, 232]
  };
  const grain = smoothWave(point, 31.7);
  let color;

  if (surface.biome === "ocean" || surface.biome === "reef") {
    const shelf = clamp01((surface.elevation - 0.22) / 0.28);
    color = mixRgb(palette.oceanDeep, palette.ocean, shelf);
    color = mixRgb(color, palette.shelf, surface.biome === "reef" ? 0.62 : Math.max(0, shelf - 0.65) * 0.35);
  } else if (surface.biome === "forest") {
    color = mixRgb(palette.forest, palette.plains, surface.moisture * 0.18);
  } else if (surface.biome === "desert") {
    color = mixRgb(palette.desert, palette.coast, 0.18 + surface.heat * 0.18);
  } else if (surface.biome === "mountain") {
    color = mixRgb(palette.mountain, palette.snow, clamp01((surface.elevation - 0.72) * 2.3));
  } else if (surface.biome === "tundra") {
    color = mixRgb(palette.tundra, palette.snow, clamp01(Math.abs(surface.latitude) - 0.62));
  } else {
    color = mixRgb(palette.plains, palette.forest, clamp01(surface.moisture - 0.48) * 0.38);
  }

  if (surface.elevation >= 0.455 && surface.elevation < 0.525) {
    color = mixRgb(color, palette.coast, 0.32);
  }

  if (Math.abs(surface.latitude) > 0.86) {
    color = mixRgb(color, palette.snow, (Math.abs(surface.latitude) - 0.86) / 0.14);
  }

  const terrainLight = surface.biome === "ocean" || surface.biome === "reef"
    ? 0.88 + surface.elevation * 0.34
    : 0.92 + surface.elevation * 0.22 + surface.ridge * 0.12;
  return shadeRgb(color, terrainLight + (grain - 0.5) * 0.055);
}

function makePlanetMaps() {
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = WORLD_TEXTURE_WIDTH;
  colorCanvas.height = WORLD_TEXTURE_HEIGHT;
  const colorCtx = colorCanvas.getContext("2d");
  const colorImage = colorCtx.createImageData(colorCanvas.width, colorCanvas.height);

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = WORLD_TEXTURE_WIDTH;
  bumpCanvas.height = WORLD_TEXTURE_HEIGHT;
  const bumpCtx = bumpCanvas.getContext("2d");
  const bumpImage = bumpCtx.createImageData(bumpCanvas.width, bumpCanvas.height);

  for (let y = 0; y < colorCanvas.height; y += 1) {
    for (let x = 0; x < colorCanvas.width; x += 1) {
      const point = pointFromTexture(x + 0.5, y + 0.5, colorCanvas.width, colorCanvas.height);
      const surface = sampleTextureSurface(point);
      const color = surfaceColor(surface, point);
      const index = (y * colorCanvas.width + x) * 4;
      colorImage.data[index] = color[0];
      colorImage.data[index + 1] = color[1];
      colorImage.data[index + 2] = color[2];
      colorImage.data[index + 3] = 255;

      const landHeight = surface.biome === "ocean" || surface.biome === "reef"
        ? 35 + surface.elevation * 54
        : 108 + surface.elevation * 98 + surface.ridge * 48;
      const height = Math.max(0, Math.min(255, landHeight));
      bumpImage.data[index] = height;
      bumpImage.data[index + 1] = height;
      bumpImage.data[index + 2] = height;
      bumpImage.data[index + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImage, 0, 0);
  bumpCtx.putImageData(bumpImage, 0, 0);

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.wrapS = THREE.RepeatWrapping;
  colorTexture.wrapT = THREE.ClampToEdgeWrapping;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

  return { colorTexture, bumpTexture };
}

function makeCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let band = 0; band < 7; band += 1) {
    const y = 60 + band * 62 + Math.random() * 24;
    ctx.beginPath();
    for (let x = -60; x <= canvas.width + 60; x += 24) {
      const wave = Math.sin(x * 0.018 + band * 1.7) * 20 + Math.sin(x * 0.043 + band) * 9;
      if (x === -60) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.lineWidth = 18 + Math.random() * 12;
    ctx.strokeStyle = `rgba(235, 252, 255, ${0.12 + Math.random() * 0.08})`;
    ctx.stroke();
  }

  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 6 + Math.random() * 22;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(255,255,255,0.18)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function makeTileGeometry(tile) {
  const vertices = [0, 0, 0];
  const indices = [];
  const seed = tile.id + tile.elevation * 13;
  for (let i = 0; i < TILE_SEGMENTS; i += 1) {
    const angle = (i / TILE_SEGMENTS) * Math.PI * 2;
    const wobble = 0.84 + seededValue(seed, i) * 0.28;
    const coverage = BIOMES[tile.biome].buildable ? 1.42 : tile.biome === "reef" ? 1.26 : 1.12;
    const radius = TILE_RADIUS * coverage * wobble;
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  }
  for (let i = 1; i <= TILE_SEGMENTS; i += 1) {
    indices.push(0, i, i === TILE_SEGMENTS ? 1 : i + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function tileOpacity(tile) {
  if (tile.biome === "ocean") return 0.012;
  if (tile.biome === "reef") return 0.09;
  if (tile.building) return 0.16;
  if (tile.biome === "mountain" || tile.biome === "desert") return 0.065;
  return 0.052;
}

function makeArcPoints(a, b, lift = 0.12, steps = 16) {
  const from = new THREE.Vector3(a.x, a.y, a.z).normalize();
  const to = new THREE.Vector3(b.x, b.y, b.z).normalize();
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const point = from.clone().lerp(to, t).normalize();
    const height = RADIUS * (1.045 + Math.sin(t * Math.PI) * lift);
    points.push(point.multiplyScalar(height));
  }
  return points;
}

function makeStars() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  for (let i = 0; i < 900; i += 1) {
    const distance = 16 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push(
      distance * Math.sin(phi) * Math.cos(theta),
      distance * Math.sin(phi) * Math.sin(theta),
      distance * Math.cos(phi)
    );
    const shade = 0.62 + Math.random() * 0.38;
    colors.push(shade, shade * (0.9 + Math.random() * 0.1), shade);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.8 });
  return new THREE.Points(geometry, material);
}

function orientToNormal(object, normal, localAxis = new THREE.Vector3(0, 0, 1)) {
  object.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(localAxis, normal));
}

function normalFromTile(tile) {
  return new THREE.Vector3(tile.point.x, tile.point.y, tile.point.z).normalize();
}

function tangentBasis(normal) {
  const up = Math.abs(normal.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  return { tangent, bitangent };
}

export class WorldView {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07100f);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 3.8, 7.4);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4.6;
    this.controls.maxDistance = 10.5;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 0.75;
    this.controls.enablePan = false;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.tileMeshes = new Map();
    this.buildingMeshes = new Map();
    this.sceneryMeshes = new Map();
    this.networkLines = new THREE.Group();
    this.effectGroup = new THREE.Group();
    this.sceneryGroup = new THREE.Group();
    this.citizenGroup = new THREE.Group();
    this.wildlifeGroup = new THREE.Group();
    this.weatherGroup = new THREE.Group();
    this.effects = [];
    this.citizens = [];
    this.wildlife = [];
    this.weatherPatches = [];
    this.mood = { environment: 84, pollution: 8, autoMode: false };
    this.selectedId = null;
    this.hoveredId = null;
    this.tiles = [];
    this.clock = new THREE.Clock();

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.add(this.sceneryGroup);
    this.group.add(this.networkLines);
    this.group.add(this.effectGroup);
    this.group.add(this.citizenGroup);
    this.group.add(this.wildlifeGroup);
    this.group.add(this.weatherGroup);

    this.setupScene();
    this.bindEvents();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setupScene() {
    this.scene.add(makeStars());

    const sun = new THREE.DirectionalLight(0xfff6dc, 3.4);
    sun.position.set(5.8, 4.2, 7.2);
    sun.castShadow = true;
    this.scene.add(sun);

    const fill = new THREE.HemisphereLight(0xc4fbff, 0x1d2c23, 1.55);
    this.scene.add(fill);

    const planetMaps = makePlanetMaps();
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 0.995, 96, 64),
      new THREE.MeshStandardMaterial({
        map: planetMaps.colorTexture,
        bumpMap: planetMaps.bumpTexture,
        bumpScale: 0.085,
        color: 0xffffff,
        roughness: 0.82,
        metalness: 0,
        emissive: 0x0a2019,
        emissiveIntensity: 0.14
      })
    );
    planet.receiveShadow = true;
    this.group.add(planet);

    this.atmosphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.055, 96, 64), makeAtmosphereMaterial());
    this.group.add(this.atmosphere);

    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.018, 64, 40),
      new THREE.MeshStandardMaterial({
        map: makeCloudTexture(),
        color: 0xe4fbff,
        transparent: true,
        opacity: 0.2,
        roughness: 1,
        depthWrite: false
      })
    );
    this.group.add(this.clouds);

    this.selectedRing = new THREE.Mesh(
      new THREE.TorusGeometry(TILE_RADIUS * 1.16, 0.012, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 })
    );
    this.selectedRing.visible = false;
    this.group.add(this.selectedRing);

    this.createWeatherLayer();
  }

  bindEvents() {
    this.canvas.addEventListener("pointermove", (event) => {
      this.updatePointer(event);
      const hit = this.pickTile();
      const id = hit?.object?.userData?.tileId ?? null;
      if (id !== this.hoveredId) {
        this.hoveredId = id;
        this.updateHighlights();
      }
    });

    this.canvas.addEventListener("pointerdown", (event) => {
      this.dragStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    });

    this.canvas.addEventListener("pointerup", (event) => {
      if (!this.dragStart) return;
      const dx = Math.abs(event.clientX - this.dragStart.x);
      const dy = Math.abs(event.clientY - this.dragStart.y);
      const dt = performance.now() - this.dragStart.time;
      this.dragStart = null;
      if (dx + dy > 8 || dt > 650) return;
      this.updatePointer(event);
      const hit = this.pickTile();
      const tileId = hit?.object?.userData?.tileId;
      if (tileId !== undefined) {
        this.callbacks.onTileClick?.(tileId);
      }
    });
  }

  updatePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  pickTile() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const objects = [...this.tileMeshes.values()];
    return this.raycaster.intersectObjects(objects, false)[0];
  }

  createWeatherLayer() {
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xeefbff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    for (let i = 0; i < 18; i += 1) {
      const y = -0.65 + seededValue(i, 4) * 1.3;
      const theta = seededValue(i, 9) * Math.PI * 2;
      const r = Math.sqrt(Math.max(0.02, 1 - y * y));
      const normal = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
      const radius = 0.18 + seededValue(i, 13) * 0.26;
      const patch = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), cloudMaterial.clone());
      patch.position.copy(normal).multiplyScalar(RADIUS * (1.075 + seededValue(i, 21) * 0.035));
      orientToNormal(patch, normal);
      patch.userData.phase = seededValue(i, 31) * Math.PI * 2;
      patch.userData.speed = 0.14 + seededValue(i, 41) * 0.12;
      patch.userData.baseOpacity = 0.08 + seededValue(i, 52) * 0.15;
      this.weatherGroup.add(patch);
      this.weatherPatches.push(patch);
    }
  }

  makeScenery(tile) {
    if (tile.building || tile.scenery === "open" || tile.biome === "ocean") return null;
    const normal = normalFromTile(tile);
    const group = new THREE.Group();
    group.position.copy(normal).multiplyScalar(RADIUS * (1.052 + tile.elevation * 0.025));
    group.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));

    const add = (mesh, x, y, z) => {
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    };

    if (tile.scenery === "forest") {
      const trunk = new THREE.MeshStandardMaterial({ color: 0x5a4a32, roughness: 0.95 });
      const leaf = new THREE.MeshStandardMaterial({ color: 0x49b66b, roughness: 0.82, emissive: 0x0b2a12, emissiveIntensity: 0.12 });
      const count = 4 + Math.floor(seededValue(tile.id, 2) * 4);
      for (let i = 0; i < count; i += 1) {
        const angle = seededValue(tile.id, i + 6) * Math.PI * 2;
        const dist = 0.018 + seededValue(tile.id, i + 14) * 0.105;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.06, 5), trunk), x, 0.032, z);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.1, 7), leaf), x, 0.095, z);
      }
    } else if (tile.scenery === "mountain") {
      const rock = new THREE.MeshStandardMaterial({ color: 0xb6b2a0, roughness: 0.9, metalness: 0.02 });
      const snow = new THREE.MeshStandardMaterial({ color: 0xf1f6ef, roughness: 0.8, metalness: 0.01 });
      add(new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.22 + tile.ridge * 0.07, 7), rock), 0, 0.085, 0);
      add(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 7), snow), 0, 0.2 + tile.ridge * 0.045, 0);
      add(new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.12, 5), rock), -0.057, 0.05, 0.04);
    } else if (tile.scenery === "desert") {
      const sand = new THREE.MeshStandardMaterial({ color: 0xd7ba6e, roughness: 1 });
      add(new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.016, 0.03), sand), 0, 0.022, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.014, 0.024), sand), -0.04, 0.04, 0.045);
    } else if (tile.scenery === "reef") {
      const reef = new THREE.MeshBasicMaterial({ color: 0x66fff1, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false });
      add(new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.007, 6, 18), reef), 0, 0.018, 0);
    } else if (tile.scenery === "grassland" && tile.wildlife) {
      const flower = new THREE.MeshStandardMaterial({ color: 0xf1df85, roughness: 0.8, emissive: 0x2c2105, emissiveIntensity: 0.08 });
      for (let i = 0; i < 5; i += 1) {
        const angle = seededValue(tile.id, i + 77) * Math.PI * 2;
        const dist = 0.028 + seededValue(tile.id, i + 78) * 0.08;
        add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), flower), Math.cos(angle) * dist, 0.028, Math.sin(angle) * dist);
      }
    }

    return group.children.length ? group : null;
  }

  setTiles(tiles) {
    this.tiles = tiles;
    for (const mesh of this.tileMeshes.values()) this.group.remove(mesh);
    for (const mesh of this.buildingMeshes.values()) this.group.remove(mesh);
    this.sceneryGroup.clear();
    this.citizenGroup.clear();
    this.wildlifeGroup.clear();
    this.networkLines.clear();
    this.effectGroup.clear();
    this.effects = [];
    this.citizens = [];
    this.wildlife = [];
    this.tileMeshes.clear();
    this.buildingMeshes.clear();
    this.sceneryMeshes.clear();

    for (const tile of tiles) {
      const biome = BIOMES[tile.biome];
      const material = new THREE.MeshBasicMaterial({
        color: biome.color,
        transparent: true,
        opacity: tileOpacity(tile),
        depthWrite: false
      });
      const mesh = new THREE.Mesh(makeTileGeometry(tile), material);
      const normal = new THREE.Vector3(tile.point.x, tile.point.y, tile.point.z).normalize();
      const altitude = BIOMES[tile.biome].buildable ? tile.elevation * 0.035 : -0.012;
      mesh.position.copy(normal).multiplyScalar(RADIUS * (1.007 + altitude));
      orientToNormal(mesh, normal);
      mesh.userData.tileId = tile.id;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.tileMeshes.set(tile.id, mesh);

      const scenery = this.makeScenery(tile);
      if (scenery) {
        this.sceneryGroup.add(scenery);
        this.sceneryMeshes.set(tile.id, scenery);
      }
    }
    this.refreshTiles(tiles);
  }

  refreshTiles(tiles) {
    this.tiles = tiles;
    for (const tile of tiles) {
      const mesh = this.tileMeshes.get(tile.id);
      if (!mesh) continue;
      const biome = BIOMES[tile.biome];
      const color = new THREE.Color(biome.color);
      if (tile.connected && tile.building) color.lerp(new THREE.Color(0xf4e6aa), 0.18);
      if (tile.alert) color.lerp(new THREE.Color(0xff4e50), 0.45);
      if (tile.building === "preserve") color.lerp(new THREE.Color(0x67f59d), 0.32);
      if (this.mood.pollution > 55 && BIOMES[tile.biome].buildable) color.lerp(new THREE.Color(0x8a7761), 0.16);
      mesh.material.color.copy(color);
      mesh.scale.setScalar(tile.id === this.hoveredId ? 1.12 : 1);
      if (mesh.material.emissive?.copy) {
        mesh.material.emissive.copy(new THREE.Color(tile.connected && tile.building ? 0x1a1708 : 0x000000));
        mesh.material.emissiveIntensity = tile.connected && tile.building ? 0.28 : 0;
      }

      const current = this.buildingMeshes.get(tile.id);
      if (tile.building && !current) {
        const scenery = this.sceneryMeshes.get(tile.id);
        if (scenery) {
          this.sceneryGroup.remove(scenery);
          this.sceneryMeshes.delete(tile.id);
        }
        const building = this.makeBuilding(tile);
        this.group.add(building);
        this.buildingMeshes.set(tile.id, building);
        this.addPulse(tile, BUILDINGS[tile.building].color);
      } else if (!tile.building && current) {
        this.group.remove(current);
        this.buildingMeshes.delete(tile.id);
      } else if (tile.building && current) {
        current.userData.spin = tile.building === "power" || tile.building === "ark";
        current.traverse((child) => {
          if (child.material?.emissive) {
            child.material.emissiveIntensity = tile.connected ? 0.42 : 0.05;
          }
        });
      } else if (!tile.building && !this.sceneryMeshes.has(tile.id)) {
        const scenery = this.makeScenery(tile);
        if (scenery) {
          this.sceneryGroup.add(scenery);
          this.sceneryMeshes.set(tile.id, scenery);
        }
      }
    }
    this.refreshNetwork();
    this.updateHighlights();
  }

  makeBuilding(tile) {
    const building = BUILDINGS[tile.building];
    const normal = new THREE.Vector3(tile.point.x, tile.point.y, tile.point.z).normalize();
    const group = new THREE.Group();
    group.userData.tileId = tile.id;
    group.userData.spin = tile.building === "power" || tile.building === "ark";
    group.position.copy(normal).multiplyScalar(RADIUS * 1.045 + building.height * 0.42);
    group.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));

    const material = new THREE.MeshStandardMaterial({
      color: building.color,
      roughness: tile.building === "ark" ? 0.35 : 0.68,
      metalness: tile.building === "ark" ? 0.45 : 0.08,
      emissive: new THREE.Color(building.color).multiplyScalar(0.22),
      emissiveIntensity: tile.connected ? 0.36 : 0.04
    });

    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x27312f, roughness: 0.86, metalness: 0.02 });
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: building.color,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
      emissive: new THREE.Color(building.color).multiplyScalar(0.35),
      emissiveIntensity: tile.connected ? 0.5 : 0.1
    });
    const add = (mesh, x = 0, y = 0, z = 0) => {
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    if (tile.building === "road") {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.055), material), 0, 0, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.036, 0.05), darkMaterial), -0.085, 0.006, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.036, 0.05), darkMaterial), 0.085, 0.006, 0);
    } else if (tile.building === "farm") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 1.5, building.footprint * 1.5, building.height, 10), material), 0, 0, 0);
      const cropMaterial = new THREE.MeshStandardMaterial({ color: 0xd4e66f, roughness: 0.72, emissive: 0x1b2608, emissiveIntensity: 0.16 });
      for (let i = -2; i <= 2; i += 1) {
        add(new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.016, 0.18), cropMaterial), i * 0.036, building.height * 0.56, 0);
      }
    } else if (tile.building === "preserve") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 1.42, building.footprint * 1.42, building.height, 10), material), 0, 0, 0);
      const trunk = new THREE.MeshStandardMaterial({ color: 0x6f5a3a, roughness: 0.9 });
      const crown = new THREE.MeshStandardMaterial({ color: 0x7dff93, roughness: 0.7, emissive: 0x123d18, emissiveIntensity: 0.25 });
      for (let i = 0; i < 5; i += 1) {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 0.055;
        const z = Math.sin(angle) * 0.055;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.065, 5), trunk), x, building.height * 0.56, z);
        add(new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.075, 6), crown), x, building.height * 0.94, z);
      }
    } else if (tile.building === "power") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 0.35, building.footprint * 0.48, building.height, 8), material), 0, 0, 0);
      const hub = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), material), 0, building.height * 0.72, 0);
      const rotor = new THREE.Group();
      rotor.name = "rotor";
      rotor.position.copy(hub.position);
      for (let i = 0; i < 3; i += 1) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.21), material);
        blade.rotation.y = (i / 3) * Math.PI * 2;
        blade.position.z = 0.08;
        rotor.add(blade);
      }
      group.add(rotor);
    } else if (tile.building === "mine") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 1.05, building.footprint * 1.22, building.height * 0.62, 6), darkMaterial), 0, 0, 0);
      add(new THREE.Mesh(new THREE.ConeGeometry(building.footprint * 0.9, building.height * 0.9, 5), material), 0, building.height * 0.38, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.026, 0.036), material), 0, building.height * 0.78, 0);
    } else if (tile.building === "factory") {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.14, building.height * 0.72, 0.12), material), 0, 0.015, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, building.height * 0.74, 6), darkMaterial), -0.052, building.height * 0.36, -0.04);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, building.height * 0.58, 6), darkMaterial), 0.055, building.height * 0.28, 0.04);
    } else if (tile.building === "habitat") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 0.72, building.footprint * 0.9, building.height * 0.9, 8), material), 0, 0, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, building.height * 0.68, 7), material), -0.064, -0.006, 0.038);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, building.height * 0.62, 7), material), 0.064, -0.01, -0.034);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 8), glassMaterial), 0, building.height * 0.52, 0);
    } else if (tile.building === "lab") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 0.82, building.footprint, building.height * 0.58, 10), material), 0, -0.015, 0);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 10), glassMaterial), 0, building.height * 0.33, 0);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 6), material), 0, building.height * 0.74, 0);
    } else if (tile.building === "clinic") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint, building.footprint * 1.08, building.height, 8), material), 0, 0, 0);
      const crossMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff3d68, emissiveIntensity: 0.24, roughness: 0.42 });
      add(new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.016, 0.028), crossMaterial), 0, building.height * 0.6, 0);
      add(new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.016, 0.105), crossMaterial), 0, building.height * 0.6, 0);
    } else if (tile.building === "monument") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 1.1, building.footprint * 1.25, 0.04, 8), material), 0, -0.04, 0);
      for (let i = 0; i < 4; i += 1) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
        add(new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, building.height * 0.8, 6), material), Math.cos(angle) * 0.055, building.height * 0.25, Math.sin(angle) * 0.055);
      }
      add(new THREE.Mesh(new THREE.ConeGeometry(building.footprint * 0.9, 0.085, 8), glassMaterial), 0, building.height * 0.78, 0);
    } else if (tile.building === "ark") {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint * 0.6, building.footprint * 0.82, building.height * 0.72, 12), material), 0, -0.018, 0);
      add(new THREE.Mesh(new THREE.ConeGeometry(building.footprint * 0.72, building.height * 0.44, 12), material), 0, building.height * 0.44, 0);
      const finMaterial = new THREE.MeshStandardMaterial({ color: 0x9ee7ff, roughness: 0.4, metalness: 0.18, emissive: 0x0d5670, emissiveIntensity: 0.28 });
      for (let i = 0; i < 3; i += 1) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.088, 0.052), finMaterial);
        fin.rotation.y = (i / 3) * Math.PI * 2;
        fin.position.set(Math.cos(fin.rotation.y) * 0.054, -building.height * 0.18, Math.sin(fin.rotation.y) * 0.054);
        group.add(fin);
      }
      const flame = new THREE.PointLight(0x78e3ff, tile.connected ? 1.2 : 0.3, 1.1);
      flame.position.set(0, -building.height * 0.42, 0);
      group.add(flame);
    } else {
      add(new THREE.Mesh(new THREE.CylinderGeometry(building.footprint, building.footprint * 1.15, building.height, 6), material), 0, 0, 0);
    }

    const light = new THREE.PointLight(building.color, tile.connected ? 0.25 : 0.04, 0.8);
    light.position.set(0, building.height * 0.65, 0);
    group.add(light);

    return group;
  }

  refreshNetwork() {
    this.networkLines.clear();
    const material = new THREE.LineBasicMaterial({
      color: 0xf3d27a,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const seen = new Set();
    for (const tile of this.tiles) {
      if (!tile.building || !tile.connected) continue;
      for (const id of tile.neighbors) {
        const neighbor = this.tiles[id];
        if (!neighbor?.building || !neighbor.connected) continue;
        const key = tile.id < id ? `${tile.id}-${id}` : `${id}-${tile.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const geometry = new THREE.BufferGeometry().setFromPoints(makeArcPoints(tile.point, neighbor.point, 0.016, 6));
        const line = new THREE.Line(geometry, material);
        this.networkLines.add(line);
      }
    }
  }

  addPulse(tile, color) {
    const normal = new THREE.Vector3(tile.point.x, tile.point.y, tile.point.z).normalize();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(TILE_RADIUS * 1.2, 0.011, 8, 36),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    ring.position.copy(normal).multiplyScalar(RADIUS * 1.085);
    orientToNormal(ring, normal);
    ring.userData.life = 1;
    ring.userData.baseScale = 1;
    this.effectGroup.add(ring);
    this.effects.push(ring);
  }

  rebuildCitizens(state) {
    this.citizenGroup.clear();
    this.citizens = [];
    const activityTiles = this.tiles.filter((tile) => tile.building && tile.building !== "ark");
    if (!activityTiles.length) return;
    const target = Math.min(MAX_CITIZENS, Math.max(10, Math.round(state.population * 1.45)));
    const citizenMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0b3,
      roughness: 0.42,
      emissive: 0xffc857,
      emissiveIntensity: 0.35
    });
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      emissive: 0xfff0b3,
      emissiveIntensity: 0.26
    });

    for (let i = 0; i < target; i += 1) {
      const tile = activityTiles[Math.floor(seededValue(i, state.year + 2) * activityTiles.length)];
      const citizen = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.016, 0.05, 6), citizenMaterial);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), headMaterial);
      body.position.y = 0.026;
      head.position.y = 0.063;
      body.castShadow = true;
      head.castShadow = true;
      citizen.add(body, head);
      citizen.userData = {
        tileId: tile.id,
        phase: seededValue(i, 14) * Math.PI * 2,
        speed: 0.45 + seededValue(i, 22) * 0.55,
        radius: 0.045 + seededValue(i, 31) * 0.07,
        bob: 0.006 + seededValue(i, 43) * 0.008
      };
      this.citizenGroup.add(citizen);
      this.citizens.push(citizen);
    }
  }

  rebuildWildlife(state) {
    this.wildlifeGroup.clear();
    this.wildlife = [];
    const habitatTiles = this.tiles.filter((tile) => !tile.building && (tile.wildlife || tile.biome === "forest" || tile.biome === "reef"));
    if (!habitatTiles.length) return;
    const target = Math.min(MAX_WILDLIFE, Math.max(12, Math.round(state.environment * 0.45)));
    const wildlifeMaterial = new THREE.MeshStandardMaterial({
      color: 0xa8ffbd,
      roughness: 0.62,
      emissive: 0x57ff8a,
      emissiveIntensity: 0.22
    });
    const wildlifeHeadMaterial = new THREE.MeshStandardMaterial({
      color: 0xd6ffd8,
      roughness: 0.7,
      emissive: 0x7fff92,
      emissiveIntensity: 0.16
    });

    for (let i = 0; i < target; i += 1) {
      const tile = habitatTiles[Math.floor(seededValue(i, state.year + 77) * habitatTiles.length)];
      const dot = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.017, 7, 5), wildlifeMaterial);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 4), wildlifeHeadMaterial);
      body.scale.set(1.35, 0.78, 0.88);
      body.position.y = 0.021;
      head.position.set(0.018, 0.027, 0);
      dot.add(body, head);
      dot.userData = {
        tileId: tile.id,
        phase: seededValue(i, 88) * Math.PI * 2,
        speed: 0.18 + seededValue(i, 93) * 0.28,
        radius: 0.055 + seededValue(i, 103) * 0.085,
        bob: 0.004 + seededValue(i, 111) * 0.006
      };
      this.wildlifeGroup.add(dot);
      this.wildlife.push(dot);
    }
  }

  updateSurfaceMover(object, time, altitude) {
    const tile = this.tiles[object.userData.tileId];
    if (!tile) return;
    const normal = normalFromTile(tile);
    const { tangent, bitangent } = tangentBasis(normal);
    const phase = object.userData.phase + time * object.userData.speed;
    const radius = object.userData.radius;
    const offset = tangent
      .clone()
      .multiplyScalar(Math.cos(phase) * radius)
      .add(bitangent.clone().multiplyScalar(Math.sin(phase * 0.8) * radius * 0.65));
    const bob = Math.sin(phase * 2.4) * object.userData.bob;
    object.position.copy(normal).multiplyScalar(RADIUS * altitude + bob).add(offset);
    object.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal));
  }

  updateMood(state) {
    this.mood = {
      environment: state.environment,
      pollution: state.pollution,
      autoMode: state.autoMode
    };
    const wantedCitizens = Math.min(MAX_CITIZENS, Math.max(10, Math.round(state.population * 1.45)));
    if (Math.abs(this.citizens.length - wantedCitizens) > 3 || state.tickSerial % 16 === 1) {
      this.rebuildCitizens(state);
    }
    const wantedWildlife = Math.min(MAX_WILDLIFE, Math.max(12, Math.round(state.environment * 0.45)));
    if (Math.abs(this.wildlife.length - wantedWildlife) > 4 || state.tickSerial % 24 === 1) {
      this.rebuildWildlife(state);
    }
    if (this.atmosphere?.material?.uniforms?.color) {
      const clear = new THREE.Color(0x7bdff2);
      const stressed = new THREE.Color(0xffb06a);
      const color = clear.lerp(stressed, Math.max(0, state.pollution - 30) / 70);
      this.atmosphere.material.uniforms.color.value.copy(color);
    }
    if (this.clouds?.material) {
      this.clouds.material.opacity = 0.12 + Math.max(0, 100 - state.environment) * 0.0022;
      this.clouds.material.color.set(state.autoMode ? 0xf5fdff : 0xe4fbff);
    }
    this.renderer.toneMappingExposure = state.environment < 35 ? 0.95 : 1.08;
  }

  setSelected(tileId) {
    this.selectedId = tileId;
    this.updateHighlights();
  }

  updateHighlights() {
    for (const [id, mesh] of this.tileMeshes.entries()) {
      const tile = this.tiles[id];
      const selected = id === this.selectedId;
      const hovered = id === this.hoveredId;
      if (selected) {
        mesh.scale.setScalar(1.2);
        mesh.material.opacity = 0.56;
        if (mesh.material.emissive?.copy) {
          mesh.material.emissive.copy(new THREE.Color(0x4effd2));
          mesh.material.emissiveIntensity = 0.42;
        }
      } else if (hovered) {
        mesh.scale.setScalar(1.1);
        mesh.material.opacity = 0.32;
        if (mesh.material.emissive?.copy) {
          mesh.material.emissive.copy(new THREE.Color(0x2ee6c9));
          mesh.material.emissiveIntensity = 0.18;
        }
      } else {
        mesh.scale.setScalar(1);
        mesh.material.opacity = tileOpacity(tile);
        if (mesh.material.emissive?.copy) {
          mesh.material.emissive.copy(new THREE.Color(tile.connected && tile.building ? 0x1a1708 : 0x000000));
          mesh.material.emissiveIntensity = tile.connected && tile.building ? 0.18 : 0;
        }
      }
    }

    if (this.selectedId !== null && this.tiles[this.selectedId]) {
      const tile = this.tiles[this.selectedId];
      const normal = new THREE.Vector3(tile.point.x, tile.point.y, tile.point.z).normalize();
      this.selectedRing.visible = true;
      this.selectedRing.position.copy(normal).multiplyScalar(RADIUS * 1.031);
      orientToNormal(this.selectedRing, normal);
    } else {
      this.selectedRing.visible = false;
    }
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    const delta = this.clock.getDelta();
    this.controls.update();
    this.group.rotation.y += delta * 0.018;
    if (this.clouds) this.clouds.rotation.y += delta * 0.025;
    const time = performance.now() * 0.001;
    this.weatherGroup.rotation.y += delta * 0.032;
    this.weatherGroup.rotation.x = Math.sin(time * 0.08) * 0.025;
    for (const patch of this.weatherPatches) {
      const pulse = Math.sin(time * patch.userData.speed + patch.userData.phase) * 0.5 + 0.5;
      patch.material.opacity = patch.userData.baseOpacity * (0.55 + pulse * 0.65);
      patch.scale.setScalar(0.86 + pulse * 0.22);
    }
    for (const citizen of this.citizens) {
      this.updateSurfaceMover(citizen, time, 1.079);
    }
    for (const life of this.wildlife) {
      this.updateSurfaceMover(life, time, 1.064);
    }
    for (const mesh of this.buildingMeshes.values()) {
      if (!mesh.userData.spin) continue;
      const rotor = mesh.children.find((child) => child.name === "rotor");
      if (rotor) rotor.rotation.y += delta * 5.5;
      if (!rotor) mesh.rotation.y += delta * 0.7;
    }
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];
      effect.userData.life -= delta * 0.68;
      effect.scale.setScalar(1 + (1 - effect.userData.life) * 1.8);
      effect.material.opacity = Math.max(0, effect.userData.life) * 0.85;
      if (effect.userData.life <= 0) {
        this.effectGroup.remove(effect);
        this.effects.splice(i, 1);
      }
    }
    for (const line of this.networkLines.children) {
      line.material.opacity = 0.28 + Math.sin(performance.now() * 0.003 + line.id) * 0.08;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
