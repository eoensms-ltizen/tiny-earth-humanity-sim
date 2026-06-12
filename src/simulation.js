const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export const BIOMES = {
  ocean: { label: "해양", color: 0x1e6f8f, buildable: false },
  plains: { label: "평원", color: 0x69a84f, buildable: true },
  forest: { label: "삼림", color: 0x287045, buildable: true },
  desert: { label: "사막", color: 0xc7a75a, buildable: true },
  mountain: { label: "산악", color: 0x8e8b7a, buildable: true },
  tundra: { label: "동토", color: 0x98b9b5, buildable: true },
  reef: { label: "연안", color: 0x38a7a1, buildable: false }
};

export const BUILDINGS = {
  road: {
    name: "도로",
    icon: "route",
    color: 0xd8c58b,
    footprint: 0.045,
    height: 0.04,
    cost: { goods: 2 },
    upkeep: {},
    desc: "연결"
  },
  habitat: {
    name: "거주지",
    icon: "home",
    color: 0xf2e8cf,
    footprint: 0.07,
    height: 0.16,
    cost: { goods: 14, ore: 5 },
    upkeep: { energy: 1 },
    housing: 24,
    desc: "주거"
  },
  farm: {
    name: "농장",
    icon: "wheat",
    color: 0x8fca57,
    footprint: 0.075,
    height: 0.08,
    cost: { goods: 7 },
    upkeep: { energy: 0.4 },
    desc: "식량"
  },
  mine: {
    name: "광산",
    icon: "pickaxe",
    color: 0xa58d72,
    footprint: 0.065,
    height: 0.15,
    cost: { goods: 8 },
    upkeep: { energy: 0.7 },
    desc: "광석"
  },
  power: {
    name: "발전소",
    icon: "zap",
    color: 0xf6c85f,
    footprint: 0.07,
    height: 0.18,
    cost: { goods: 10, ore: 4 },
    upkeep: {},
    desc: "전력"
  },
  factory: {
    name: "공장",
    icon: "factory",
    color: 0xb6bdc6,
    footprint: 0.075,
    height: 0.2,
    cost: { goods: 18, ore: 12 },
    upkeep: { energy: 2 },
    requires: "steamLogistics",
    desc: "부품"
  },
  lab: {
    name: "연구소",
    icon: "microscope",
    color: 0x70d6ff,
    footprint: 0.064,
    height: 0.18,
    cost: { goods: 16, ore: 4 },
    upkeep: { energy: 1.5, goods: 0.5 },
    requires: "publicScience",
    desc: "과학"
  },
  clinic: {
    name: "의료원",
    icon: "heart-pulse",
    color: 0xff7b9c,
    footprint: 0.066,
    height: 0.15,
    cost: { goods: 18 },
    upkeep: { energy: 1, goods: 0.4 },
    requires: "publicScience",
    desc: "건강"
  },
  preserve: {
    name: "보전구",
    icon: "sprout",
    color: 0x4dd577,
    footprint: 0.08,
    height: 0.07,
    cost: { goods: 12 },
    upkeep: {},
    requires: "climateRepair",
    desc: "생태"
  },
  monument: {
    name: "의회",
    icon: "landmark",
    color: 0xc8a2ff,
    footprint: 0.062,
    height: 0.22,
    cost: { goods: 22, ore: 8 },
    upkeep: { energy: 0.8 },
    requires: "worldCharter",
    desc: "통합"
  },
  ark: {
    name: "궤도 방주",
    icon: "rocket",
    color: 0xffffff,
    footprint: 0.055,
    height: 0.32,
    cost: { goods: 90, ore: 65, science: 140 },
    upkeep: { energy: 5 },
    requires: "orbitalArk",
    unique: true,
    desc: "엔딩"
  }
};

export const POLICIES = {
  balanced: { label: "균형", icon: "scale", modifiers: { food: 1, ore: 1, goods: 1, science: 1, unity: 1, pollution: 1 } },
  industry: { label: "산업", icon: "factory", modifiers: { food: 0.96, ore: 1.18, goods: 1.22, science: 0.96, unity: 0.94, pollution: 1.18 } },
  science: { label: "과학", icon: "atom", modifiers: { food: 0.96, ore: 1, goods: 0.97, science: 1.28, unity: 0.98, pollution: 1 } },
  ecology: { label: "생태", icon: "leaf", modifiers: { food: 1.07, ore: 0.9, goods: 0.9, science: 1.02, unity: 1.08, pollution: 0.74 } },
  civic: { label: "공동체", icon: "users", modifiers: { food: 1.02, ore: 0.96, goods: 0.96, science: 0.98, unity: 1.28, pollution: 0.94 } }
};

export const TECHS = [
  {
    id: "seedAgronomy",
    name: "종자 농학",
    era: "정착 시대",
    cost: 70,
    text: "농장 효율 +20%, 식량 위기 완화"
  },
  {
    id: "steamLogistics",
    name: "증기 물류",
    era: "도시 시대",
    cost: 100,
    text: "공장 건설, 도로 연결 효율 상승"
  },
  {
    id: "publicScience",
    name: "공공 과학",
    era: "산업 시대",
    cost: 140,
    text: "연구소와 의료원 건설"
  },
  {
    id: "cleanGrid",
    name: "청정 전력망",
    era: "전력 시대",
    cost: 190,
    text: "발전 효율 +35%, 공해 감소"
  },
  {
    id: "climateRepair",
    name: "기후 복원",
    era: "복원 시대",
    cost: 250,
    text: "보전구 건설, 생태 회복"
  },
  {
    id: "worldCharter",
    name: "세계 헌장",
    era: "통합 시대",
    cost: 330,
    text: "의회 건설, 불안정 억제"
  },
  {
    id: "orbitalArk",
    name: "궤도 방주",
    era: "항성 시대",
    cost: 430,
    text: "방주 건설과 행성 지속 엔딩"
  }
];

export const GOALS = [
  {
    id: "stabilize",
    title: "정착 안정화",
    text: "식량 80, 전력 흑자, 인구 28명 달성",
    check: (state) => state.resources.food >= 80 && state.energy.balance >= 0 && state.population >= 28
  },
  {
    id: "industrialBase",
    title: "산업 기반",
    text: "공장 1개, 광산 2개, 부품 60 확보",
    check: (state) => countBuildings(state).factory >= 1 && countBuildings(state).mine >= 2 && state.resources.goods >= 60
  },
  {
    id: "publicCare",
    title: "공공 체계",
    text: "연구소와 의료원 건설, 건강 70 이상",
    check: (state) => countBuildings(state).lab >= 1 && countBuildings(state).clinic >= 1 && state.health >= 70
  },
  {
    id: "planetaryRepair",
    title: "행성 복원",
    text: "생태 65 이상, 보전구 3개, 통합 65 이상",
    check: (state) => state.environment >= 65 && countBuildings(state).preserve >= 3 && state.unity >= 65
  },
  {
    id: "orbitalFuture",
    title: "궤도 미래",
    text: "방주를 완성하고 지속 문명 조건 달성",
    check: (state) => state.gameOver?.victory === true
  }
];

const RESOURCE_LABELS = {
  food: "식량",
  ore: "광석",
  goods: "부품",
  energy: "전력",
  science: "과학"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmt(value) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 100) return Math.round(value).toString();
  return value.toFixed(1).replace(".0", "");
}

function hasFinalConsonant(word) {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function objectParticle(word) {
  if (["지", "소", "구", "회", "주", "로"].some((ending) => word.endsWith(ending))) return "를";
  if (["장", "산", "원"].some((ending) => word.endsWith(ending))) return "을";
  return hasFinalConsonant(word) ? "을" : "를";
}

function directionParticle(word) {
  return hasFinalConsonant(word) ? "으로" : "로";
}

function seededNoise(x, y, z, salt = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + salt * 44.131) * 43758.5453123;
  return n - Math.floor(n);
}

function fractalNoise(point, salt) {
  let amp = 0.56;
  let freq = 1;
  let total = 0;
  let norm = 0;
  for (let i = 0; i < 5; i += 1) {
    total += amp * seededNoise(point.x * freq, point.y * freq, point.z * freq, salt + i * 11);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return total / norm;
}

export function generateTiles(count = 260) {
  const tiles = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const point = { x, y, z };
    const latitude = Math.asin(y) / (Math.PI / 2);
    const elevation = fractalNoise(point, 3);
    const moisture = fractalNoise(point, 17);
    const heat = clamp(1 - Math.abs(latitude) * 0.88 + (fractalNoise(point, 29) - 0.5) * 0.35, 0, 1);
    const isOcean = elevation < 0.38;
    const coast = elevation >= 0.34 && elevation < 0.38;
    let biome = "plains";

    if (isOcean && coast) biome = "reef";
    else if (isOcean) biome = "ocean";
    else if (elevation > 0.78) biome = "mountain";
    else if (heat < 0.22) biome = "tundra";
    else if (moisture > 0.63) biome = "forest";
    else if (heat > 0.68 && moisture < 0.42) biome = "desert";

    const fertilityBase = biome === "forest" ? 0.85 : biome === "plains" ? 0.72 : biome === "tundra" ? 0.38 : biome === "desert" ? 0.22 : 0.08;
    const oreBase = biome === "mountain" ? 0.92 : biome === "desert" ? 0.52 : biome === "tundra" ? 0.48 : biome === "forest" ? 0.28 : 0.34;
    const wind = clamp(0.35 + Math.abs(latitude) * 0.35 + seededNoise(x, y, z, 41) * 0.3, 0, 1);
    const solar = clamp(heat * 0.82 + (biome === "desert" ? 0.2 : 0), 0, 1);

    tiles.push({
      id: i,
      point,
      biome,
      elevation,
      moisture,
      heat,
      fertility: clamp(fertilityBase + (moisture - 0.5) * 0.22, 0.05, 1),
      ore: clamp(oreBase + (elevation - 0.5) * 0.35, 0.05, 1),
      wind,
      solar,
      building: null,
      connected: false,
      alert: null,
      damaged: 0,
      yields: { food: 0, ore: 0, goods: 0, science: 0, energy: 0 }
    });
  }

  for (const tile of tiles) {
    const sorted = tiles
      .filter((other) => other.id !== tile.id)
      .map((other) => ({
        id: other.id,
        distance: (tile.point.x - other.point.x) ** 2 + (tile.point.y - other.point.y) ** 2 + (tile.point.z - other.point.z) ** 2
      }))
      .sort((a, b) => a.distance - b.distance);
    tile.neighbors = sorted.slice(0, 6).map((entry) => entry.id);
  }

  const start = tiles
    .filter((tile) => BIOMES[tile.biome].buildable)
    .sort((a, b) => {
      const aScore = a.fertility * 1.8 + a.ore * 0.6 + a.wind * 0.25 - Math.abs(a.point.y) * 0.5;
      const bScore = b.fertility * 1.8 + b.ore * 0.6 + b.wind * 0.25 - Math.abs(b.point.y) * 0.5;
      return bScore - aScore;
    })[0];

  start.building = "habitat";
  start.connected = true;
  start.isCapital = true;

  const firstFarm = start.neighbors
    .map((id) => tiles[id])
    .filter((tile) => BIOMES[tile.biome].buildable)
    .sort((a, b) => b.fertility - a.fertility)[0];
  if (firstFarm) firstFarm.building = "farm";

  const firstPower = start.neighbors
    .map((id) => tiles[id])
    .filter((tile) => BIOMES[tile.biome].buildable && !tile.building)
    .sort((a, b) => b.wind + b.solar - (a.wind + a.solar))[0];
  if (firstPower) firstPower.building = "power";

  return tiles;
}

export function createSimulation(tileCount = 260) {
  return {
    tiles: generateTiles(tileCount),
    resources: {
      food: 70,
      ore: 26,
      goods: 42,
      science: 0
    },
    monthIndex: 0,
    year: 1,
    population: 18,
    birthDebt: 0,
    health: 72,
    unity: 62,
    environment: 84,
    unrest: 12,
    pollution: 8,
    housing: 24,
    energy: { produced: 0, used: 0, balance: 0 },
    logistics: 0,
    policy: "balanced",
    autoMode: false,
    autoCooldown: 0,
    autoFocus: "균형 성장",
    autoLastAction: "수동 운영",
    speed: 3,
    paused: false,
    selectedTileId: null,
    selectedTool: null,
    log: [
      { tone: "good", text: "첫 거주지가 작은 지구의 온대 평원에 자리 잡았다." },
      { tone: "info", text: "도로로 연결망을 늘리고, 식량과 전력을 먼저 안정화해야 한다." }
    ],
    techIndex: 0,
    techProgress: 0,
    completedTechs: new Set(),
    modifiers: {
      farmShock: 0,
      solarStorm: 0,
      laborBoost: 0,
      epidemic: 0
    },
    gameOver: null,
    tickSerial: 0,
    lastDelta: {}
  };
}

export function currentTech(state) {
  return TECHS[state.techIndex] ?? null;
}

export function hasTech(state, id) {
  return state.completedTechs.has(id);
}

export function getEra(state) {
  const tech = currentTech(state);
  if (state.gameOver?.victory) return "지속 문명";
  if (!tech) return "항성 시대";
  return tech.era;
}

export function costText(cost) {
  return Object.entries(cost)
    .map(([key, value]) => `${RESOURCE_LABELS[key] ?? key} ${value}`)
    .join(" · ");
}

export function canBuild(state, tile, buildingId) {
  const building = BUILDINGS[buildingId];
  if (!building) return { ok: false, reason: "알 수 없음" };
  if (!tile) return { ok: false, reason: "타일 없음" };
  if (!BIOMES[tile.biome].buildable) return { ok: false, reason: "해양" };
  if (tile.building) return { ok: false, reason: tile.building === buildingId ? "이미 건설" : "점유" };
  if (building.unique && state.tiles.some((candidate) => candidate.building === buildingId)) return { ok: false, reason: "이미 존재" };
  if (building.requires && !hasTech(state, building.requires)) return { ok: false, reason: "연구 필요" };

  for (const [resource, amount] of Object.entries(building.cost)) {
    if ((state.resources[resource] ?? 0) < amount) {
      return { ok: false, reason: `${RESOURCE_LABELS[resource] ?? resource} 부족` };
    }
  }

  if (buildingId === "farm" && tile.fertility < 0.18) return { ok: false, reason: "척박함" };
  if (buildingId === "mine" && tile.ore < 0.22) return { ok: false, reason: "광맥 부족" };
  return { ok: true, reason: "" };
}

export function buildOnTile(state, tileId, buildingId) {
  const tile = state.tiles[tileId];
  const check = canBuild(state, tile, buildingId);
  if (!check.ok) {
    pushLog(state, "warn", `${BUILDINGS[buildingId]?.name ?? "건물"} 건설 실패: ${check.reason}`);
    return false;
  }

  const building = BUILDINGS[buildingId];
  for (const [resource, amount] of Object.entries(building.cost)) {
    state.resources[resource] -= amount;
  }
  tile.building = buildingId;
  tile.damaged = 0;
  tile.alert = null;

  pushLog(state, "good", `${BIOMES[tile.biome].label} 타일에 ${building.name}${objectParticle(building.name)} 건설했다.`);
  if (buildingId === "ark") {
    evaluateEndings(state, true);
  }
  return true;
}

export function setPolicy(state, policyId) {
  if (!POLICIES[policyId]) return;
  state.policy = policyId;
  pushLog(state, "info", `문명 중점이 ${POLICIES[policyId].label}${directionParticle(POLICIES[policyId].label)} 바뀌었다.`);
}

export function pushLog(state, tone, text) {
  state.log.unshift({ tone, text });
  state.log = state.log.slice(0, 8);
}

export function countBuildings(state) {
  const counts = Object.fromEntries(Object.keys(BUILDINGS).map((key) => [key, 0]));
  for (const tile of state.tiles) {
    if (tile.building) counts[tile.building] += 1;
  }
  return counts;
}

function foodMonths(state) {
  return state.population > 0 ? state.resources.food / Math.max(1, state.population * 0.28) : 0;
}

function connectedNeighborScore(state, tile) {
  return tile.neighbors.reduce((score, id) => {
    const neighbor = state.tiles[id];
    if (neighbor?.connected) return score + 1.5;
    if (neighbor?.building) return score + 0.5;
    return score;
  }, 0);
}

function scoreTileForBuilding(state, tile, buildingId) {
  if (!tile || !BIOMES[tile.biome].buildable || tile.building) return -Infinity;
  if (!canBuild(state, tile, buildingId).ok) return -Infinity;
  const connection = connectedNeighborScore(state, tile);
  const centerBias = 1 - Math.abs(tile.point.y) * 0.25;

  if (buildingId === "farm") return tile.fertility * 8 + connection + centerBias;
  if (buildingId === "mine") return tile.ore * 8 + connection * 0.8 + (tile.biome === "mountain" ? 1.5 : 0);
  if (buildingId === "power") return (tile.wind + tile.solar) * 4 + connection + (tile.biome === "desert" ? 0.8 : 0);
  if (buildingId === "habitat") return tile.fertility * 2 + tile.wind + connection * 1.6 + centerBias;
  if (buildingId === "factory") return connection * 2.4 + tile.ore * 1.2 + (tile.connected ? 2 : 0);
  if (buildingId === "lab") return connection * 2.2 + tile.wind + tile.solar + (tile.biome === "tundra" ? 0.7 : 0);
  if (buildingId === "clinic") return connection * 2.3 + tile.fertility + (tile.connected ? 2 : 0);
  if (buildingId === "preserve") return tile.fertility * 4 + (tile.biome === "forest" ? 2 : 0) + connection * 0.5;
  if (buildingId === "monument") return connection * 2.8 + centerBias + (tile.connected ? 2 : 0);
  if (buildingId === "ark") return connection * 3 + tile.wind + (tile.biome === "mountain" ? 1 : 0);
  if (buildingId === "road") {
    const builtNeighbors = tile.neighbors.filter((id) => state.tiles[id]?.building).length;
    return connection * 2 + builtNeighbors * 1.2 + centerBias;
  }
  return connection + centerBias;
}

function bestTileForBuilding(state, buildingId) {
  return state.tiles
    .map((tile) => ({ tile, score: scoreTileForBuilding(state, tile, buildingId) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score)[0]?.tile ?? null;
}

function chooseAutoPolicy(state, counts) {
  if (state.environment < 48 && hasTech(state, "climateRepair")) return "ecology";
  if (state.resources.food < state.population * 1.2 || state.lastDelta.food < -1.5) return "ecology";
  if (state.unrest > 55 || state.unity < 45) return "civic";
  if (hasTech(state, "publicScience") && counts.lab > 0 && state.resources.goods > 25) return "science";
  if (state.resources.goods < 45 || state.resources.ore < 25) return "industry";
  return "balanced";
}

function chooseAutoBuild(state, counts) {
  const months = foodMonths(state);
  const housingPressure = state.housing > 0 ? state.population / state.housing : 2;

  if (hasTech(state, "orbitalArk") && !counts.ark) return { id: "ark", reason: "최종 방주 준비" };
  if (months < 4.5 || state.lastDelta.food < -0.5) return { id: "farm", reason: "식량 병목" };
  if (state.energy.balance < 2) return { id: "power", reason: "전력 예비율 부족" };
  if (housingPressure > 0.84) return { id: "habitat", reason: "주거 압력" };
  if (counts.mine < 2 || state.resources.ore < 24 || state.lastDelta.ore < 1) return { id: "mine", reason: "광석 공급망" };
  if (state.logistics < 0.82) return { id: "road", reason: "물류 연결망" };
  if (hasTech(state, "steamLogistics") && counts.factory < Math.max(1, Math.floor(state.population / 46))) return { id: "factory", reason: "부품 생산" };
  if (hasTech(state, "publicScience") && counts.lab < Math.max(1, Math.floor(state.population / 55))) return { id: "lab", reason: "연구 가속" };
  if (hasTech(state, "publicScience") && (state.health < 72 || counts.clinic < Math.floor(state.population / 70))) return { id: "clinic", reason: "공공 보건" };
  if (hasTech(state, "climateRepair") && (state.environment < 72 || counts.preserve < 3)) return { id: "preserve", reason: "생태 복원" };
  if (hasTech(state, "worldCharter") && (state.unity < 70 || counts.monument < 1)) return { id: "monument", reason: "세계 통합" };
  if (counts.farm <= counts.mine) return { id: "farm", reason: "식량 비축" };
  if (counts.power < counts.factory + counts.lab + 2) return { id: "power", reason: "전력망 확장" };
  return { id: "road", reason: "권역 확장" };
}

function autoDirectorPhase(state) {
  if (!state.autoMode || state.gameOver) return;
  const counts = countBuildings(state);
  const policyId = chooseAutoPolicy(state, counts);
  if (policyId !== state.policy) {
    state.policy = policyId;
    state.autoLastAction = `정책: ${POLICIES[policyId].label}`;
    pushLog(state, "info", `자동 운영관이 ${POLICIES[policyId].label} 중점으로 전환했다.`);
  }

  state.autoCooldown = Math.max(0, state.autoCooldown - 1);
  const choice = chooseAutoBuild(state, counts);
  state.autoFocus = choice.reason;

  if (state.autoCooldown > 0) return;
  const tile = bestTileForBuilding(state, choice.id);
  if (!tile) {
    state.autoLastAction = `${BUILDINGS[choice.id]?.name ?? "건물"} 후보지 또는 자원 대기`;
    return;
  }
  if (buildOnTile(state, tile.id, choice.id)) {
    state.selectedTileId = tile.id;
    state.autoCooldown = choice.id === "road" ? 1 : 2;
    state.autoLastAction = `${BUILDINGS[choice.id].name} 배치`;
  }
}

export function setAutoMode(state, enabled) {
  state.autoMode = enabled;
  state.autoLastAction = enabled ? "자동 운영 시작" : "수동 운영";
  pushLog(state, enabled ? "good" : "info", enabled ? "자동 운영관이 병목을 추적하기 시작했다." : "자동 운영관이 대기 상태로 전환됐다.");
}

export function getAutoPlan(state) {
  const counts = countBuildings(state);
  const choice = chooseAutoBuild(state, counts);
  return {
    enabled: state.autoMode,
    focus: state.autoFocus,
    next: BUILDINGS[choice.id]?.name ?? "대기",
    reason: choice.reason,
    lastAction: state.autoLastAction,
    cooldown: state.autoCooldown
  };
}

export function getStrategicGoals(state) {
  const firstOpenIndex = GOALS.findIndex((goal) => !goal.check(state));
  return GOALS.map((goal, index) => ({
    ...goal,
    complete: goal.check(state),
    active: index === firstOpenIndex || (firstOpenIndex === -1 && index === GOALS.length - 1)
  }));
}

export function getWorldMood(state) {
  const stability = clamp((state.health + state.unity + state.environment + (100 - state.unrest)) / 4, 0, 100);
  let label = "안정";
  let tone = "good";
  if (stability < 38) {
    label = "붕괴 위험";
    tone = "bad";
  } else if (stability < 58) {
    label = "긴장";
    tone = "warn";
  } else if (state.autoMode) {
    label = "자동 순항";
    tone = "info";
  }
  return { stability, label, tone, foodMonths: foodMonths(state) };
}

function calcConnectivity(state) {
  const connected = new Set();
  const starts = state.tiles.filter((tile) => tile.building === "habitat" || tile.isCapital).map((tile) => tile.id);
  const queue = [...starts];
  for (const id of starts) connected.add(id);

  while (queue.length) {
    const id = queue.shift();
    const tile = state.tiles[id];
    for (const neighborId of tile.neighbors) {
      const neighbor = state.tiles[neighborId];
      if (!neighbor.building || connected.has(neighborId)) continue;
      const roadBonus = tile.building === "road" || neighbor.building === "road" || tile.building === "habitat" || neighbor.building === "habitat";
      const reachChance = hasTech(state, "steamLogistics") ? 0.18 : 0.08;
      if (roadBonus || Math.abs(tile.point.y - neighbor.point.y) < reachChance) {
        connected.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  let occupied = 0;
  for (const tile of state.tiles) {
    tile.connected = connected.has(tile.id);
    if (tile.building) occupied += 1;
  }
  state.logistics = occupied ? connected.size / occupied : 1;
}

function efficiencyForTile(state, tile) {
  let efficiency = tile.connected ? 1 : 0.36;
  if (tile.damaged > 0) efficiency *= 0.55;
  if (state.modifiers.solarStorm > 0 && BUILDINGS[tile.building]?.upkeep?.energy) efficiency *= 0.75;
  return efficiency;
}

function productionPhase(state) {
  const policy = POLICIES[state.policy].modifiers;
  const deltas = { food: 0, ore: 0, goods: 0, science: 0 };
  const counts = Object.fromEntries(Object.keys(BUILDINGS).map((key) => [key, 0]));
  let housing = 0;
  let powerProduced = 0;
  let powerDemand = 0;
  let rawFood = 0;
  let rawOre = 0;
  let factoryCapacity = 0;
  let scienceCapacity = 0;
  let clinicCare = 0;
  let preserveCare = 0;
  let unityCare = 0;
  let pollution = 0;

  for (const tile of state.tiles) {
    tile.yields = { food: 0, ore: 0, goods: 0, science: 0, energy: 0 };
    if (!tile.building) continue;
    const building = BUILDINGS[tile.building];
    counts[tile.building] += 1;
    const eff = efficiencyForTile(state, tile);
    for (const [resource, amount] of Object.entries(building.upkeep ?? {})) {
      if (resource === "energy") powerDemand += amount * eff;
    }

    if (tile.building === "habitat") {
      housing += building.housing;
      unityCare += 0.4 * eff;
    }

    if (tile.building === "farm") {
      const tech = hasTech(state, "seedAgronomy") ? 1.2 : 1;
      const shock = state.modifiers.farmShock > 0 ? 0.58 : 1;
      const amount = (4.4 + tile.fertility * 7.2) * tech * shock * policy.food * eff;
      rawFood += amount;
      tile.yields.food = amount;
    }

    if (tile.building === "mine") {
      const amount = (2.4 + tile.ore * 6.6) * policy.ore * eff;
      rawOre += amount;
      tile.yields.ore = amount;
      pollution += 0.55 * policy.pollution * eff;
    }

    if (tile.building === "power") {
      const tech = hasTech(state, "cleanGrid") ? 1.35 : 1;
      const storm = state.modifiers.solarStorm > 0 ? 0.46 : 1;
      const amount = (3.6 + tile.wind * 3.4 + tile.solar * 3.2) * tech * storm * eff;
      powerProduced += amount;
      tile.yields.energy = amount;
      pollution += (hasTech(state, "cleanGrid") ? 0.08 : 0.28) * policy.pollution * eff;
    }

    if (tile.building === "factory") {
      const labor = state.modifiers.laborBoost > 0 ? 1.25 : 1;
      factoryCapacity += 5.4 * policy.goods * labor * eff;
      pollution += 1.25 * policy.pollution * eff;
    }

    if (tile.building === "lab") {
      scienceCapacity += 4.6 * policy.science * eff;
      pollution += 0.05 * eff;
    }

    if (tile.building === "clinic") {
      clinicCare += 2.6 * eff;
    }

    if (tile.building === "preserve") {
      preserveCare += (2.5 + tile.fertility * 1.4) * eff;
    }

    if (tile.building === "monument") {
      unityCare += 2.4 * policy.unity * eff;
    }

    if (tile.building === "ark") {
      scienceCapacity += 7.5 * eff;
      unityCare += 2.6 * eff;
    }
  }

  const energyRatio = powerDemand <= 0 ? 1 : clamp(powerProduced / powerDemand, 0.25, 1.25);
  const oreAvailable = state.resources.ore + rawOre;
  const oreNeeded = factoryCapacity * 0.82;
  const actualGoods = Math.min(factoryCapacity * energyRatio, oreAvailable / 0.82);
  const oreConsumed = actualGoods * 0.82;
  rawOre -= oreConsumed;

  const goodsMaintenance = Object.entries(counts).reduce((sum, [id, count]) => {
    const upkeep = BUILDINGS[id].upkeep?.goods ?? 0;
    return sum + upkeep * count;
  }, 0);
  const actualScience = Math.max(0, scienceCapacity * energyRatio - goodsMaintenance * 0.2);
  const foodNeed = state.population * (0.28 + (state.health > 75 ? 0.02 : 0));
  const foodNet = rawFood - foodNeed;

  deltas.food = foodNet;
  deltas.ore = rawOre;
  deltas.goods = actualGoods - goodsMaintenance;
  deltas.science = actualScience;

  state.resources.food = clamp(state.resources.food + deltas.food, -20, 999);
  state.resources.ore = clamp(state.resources.ore + deltas.ore, 0, 999);
  state.resources.goods = clamp(state.resources.goods + deltas.goods, 0, 999);
  state.resources.science = clamp(state.resources.science + deltas.science, 0, 999);

  state.housing = housing;
  state.energy = { produced: powerProduced, used: powerDemand, balance: powerProduced - powerDemand };

  const housingRatio = housing <= 0 ? 0 : state.population / housing;
  const foodPressure = state.resources.food < 0 ? -8 : state.resources.food < foodNeed * 2 ? -2.8 : 1.5;
  const energyPressure = powerDemand > 0 && energyRatio < 0.92 ? -4.5 : 0.8;
  const crowding = housingRatio > 1 ? -(housingRatio - 1) * 9 : 1.2;
  const clinic = clinicCare - (state.modifiers.epidemic > 0 ? 7 : 0);
  const envPenalty = (100 - state.environment) * 0.045;

  state.health = clamp(state.health + (foodPressure + energyPressure + crowding + clinic - envPenalty) * 0.08, 0, 100);
  state.unity = clamp(state.unity + (unityCare + policy.unity - Math.max(0, housingRatio - 1) * 4 - Math.max(0, state.unrest - 45) * 0.08) * 0.08, 0, 100);
  state.pollution = clamp(state.pollution + pollution - preserveCare * 0.92 - (hasTech(state, "climateRepair") ? 0.35 : 0.08), 0, 100);
  state.environment = clamp(100 - state.pollution - state.population * 0.035 + preserveCare * 0.24, 0, 100);

  const unrestPressure = (housingRatio > 1 ? (housingRatio - 1) * 17 : -1.8) + (state.health < 45 ? 4 : -1) + (state.unity < 40 ? 3.6 : -1) + (state.resources.food < 0 ? 7 : 0);
  state.unrest = clamp(state.unrest + unrestPressure * 0.08, 0, 100);

  let growth = 0.002 + (state.health - 50) * 0.0008 + (state.unity - 50) * 0.00045 - Math.max(0, housingRatio - 1) * 0.015 - (state.resources.food < 0 ? 0.04 : 0);
  if (state.environment < 25) growth -= 0.01;
  if (state.unrest > 70) growth -= 0.015;
  state.birthDebt += state.population * growth;
  if (state.birthDebt >= 1) {
    const births = Math.floor(state.birthDebt);
    state.population += births;
    state.birthDebt -= births;
  } else if (state.birthDebt <= -1) {
    const deaths = Math.min(state.population, Math.ceil(Math.abs(state.birthDebt)));
    state.population -= deaths;
    state.birthDebt += deaths;
    if (deaths > 0) pushLog(state, "bad", `위기로 ${deaths}명이 줄었다.`);
  }

  if (state.resources.food < -5) {
    state.resources.food = 0;
    const loss = Math.max(1, Math.round(state.population * 0.035));
    state.population = Math.max(0, state.population - loss);
    state.health = clamp(state.health - 7, 0, 100);
    pushLog(state, "bad", `식량 배급 실패로 ${loss}명이 사망했다.`);
  }

  state.lastDelta = deltas;
}

function researchPhase(state) {
  const tech = currentTech(state);
  if (!tech) return;
  const monthly = Math.min(state.resources.science, Math.max(1.2, state.lastDelta.science * 0.72 + 1.1));
  state.resources.science = Math.max(0, state.resources.science - monthly * 0.32);
  state.techProgress += monthly;
  if (state.techProgress >= tech.cost) {
    state.completedTechs.add(tech.id);
    state.techIndex += 1;
    state.techProgress = 0;
    pushLog(state, "good", `${tech.name} 연구가 완료되어 ${TECHS[state.techIndex]?.era ?? "항성 시대"}에 진입했다.`);
  }
}

function damageRandomBuilding(state, severity = 1) {
  const candidates = state.tiles.filter((tile) => tile.building && tile.building !== "road" && tile.building !== "ark");
  if (!candidates.length) return null;
  const tile = candidates[Math.floor(Math.random() * candidates.length)];
  tile.damaged = Math.max(tile.damaged, severity);
  tile.alert = "damage";
  return tile;
}

function eventPhase(state) {
  if (state.monthIndex % 9 !== 0 || Math.random() > 0.42) return;
  const events = [];

  events.push(() => {
    const gain = Math.max(2, Math.round(state.population * 0.08));
    state.population += gain;
    state.unity = clamp(state.unity + 2, 0, 100);
    pushLog(state, "info", `이주민 ${gain}명이 합류했다.`);
  });

  events.push(() => {
    state.modifiers.farmShock = 5;
    pushLog(state, "warn", "계절성 병충해가 번져 몇 달간 농장 생산이 줄어든다.");
  });

  events.push(() => {
    state.modifiers.solarStorm = 3;
    pushLog(state, "warn", "태양 폭풍이 전력망을 흔들었다.");
  });

  events.push(() => {
    state.modifiers.laborBoost = 4;
    state.unity = clamp(state.unity + 4, 0, 100);
    pushLog(state, "good", "장인 조합이 표준 부품 설계를 공유했다.");
  });

  events.push(() => {
    const tile = damageRandomBuilding(state, 2);
    if (tile) pushLog(state, "bad", `운석 파편이 ${BUILDINGS[tile.building].name}에 피해를 냈다.`);
  });

  if (state.health < 55) {
    events.push(() => {
      state.modifiers.epidemic = 5;
      state.health = clamp(state.health - 8, 0, 100);
      pushLog(state, "bad", "감염병이 번져 의료 부담이 커졌다.");
    });
  }

  if (state.environment > 70) {
    events.push(() => {
      state.unity = clamp(state.unity + 7, 0, 100);
      state.resources.science += 12;
      pushLog(state, "good", "푸른 계절이 찾아와 세계 회의가 힘을 얻었다.");
    });
  }

  events[Math.floor(Math.random() * events.length)]();
}

function repairPhase(state) {
  for (const key of Object.keys(state.modifiers)) {
    state.modifiers[key] = Math.max(0, state.modifiers[key] - 1);
  }
  for (const tile of state.tiles) {
    if (tile.damaged > 0 && tile.connected && state.resources.goods >= 1.2) {
      state.resources.goods -= 1.2;
      tile.damaged = Math.max(0, tile.damaged - 1);
      if (tile.damaged === 0) tile.alert = null;
    }
  }
}

function evaluateEndings(state, forcedArk = false) {
  if (state.gameOver) return;
  const arkBuilt = state.tiles.some((tile) => tile.building === "ark");
  if ((forcedArk || arkBuilt) && state.environment >= 55 && state.unity >= 55 && state.population >= 80) {
    state.gameOver = {
      victory: true,
      title: "지속 문명 달성",
      text: "인류는 작은 지구의 생태계를 유지한 채 궤도 방주를 완성했다. 행성은 고향으로 남고, 문명은 다음 궤도로 확장된다."
    };
    pushLog(state, "good", "궤도 방주가 점화되었다.");
  } else if (arkBuilt && !forcedArk) {
    pushLog(state, "warn", "방주는 준비되었지만 인구, 통합, 생태 조건이 아직 부족하다.");
  }

  if (state.population <= 0) {
    state.gameOver = {
      victory: false,
      title: "인류 소멸",
      text: "인구가 사라졌다. 남은 것은 조용한 기반 시설과 기록뿐이다."
    };
  }

  if (state.environment <= 5 && state.health <= 25) {
    state.gameOver = {
      victory: false,
      title: "생태권 붕괴",
      text: "행성 회복력이 한계를 넘었다. 식량, 건강, 통합이 동시에 무너졌다."
    };
  }

  if (state.unrest >= 98 && state.unity <= 18) {
    state.gameOver = {
      victory: false,
      title: "세계 정부 해체",
      text: "단일 인류의 합의가 무너져 행성 규모 운영이 중단되었다."
    };
  }
}

export function advanceMonth(state) {
  if (state.gameOver) return;
  state.tickSerial += 1;
  calcConnectivity(state);
  productionPhase(state);
  researchPhase(state);
  eventPhase(state);
  repairPhase(state);
  autoDirectorPhase(state);

  state.monthIndex += 1;
  if (state.monthIndex >= 12) {
    state.monthIndex = 0;
    state.year += 1;
    pushLog(state, "info", `${state.year}년차가 시작되었다.`);
  }

  evaluateEndings(state);
}

export function getDateLabel(state) {
  return `${state.year}년 ${MONTHS[state.monthIndex]}`;
}

export function getBuildList(state) {
  return Object.entries(BUILDINGS).map(([id, building]) => ({
    id,
    ...building,
    unlocked: !building.requires || hasTech(state, building.requires)
  }));
}

export function getTileSummary(tile) {
  if (!tile) return null;
  return {
    biome: BIOMES[tile.biome].label,
    building: tile.building ? BUILDINGS[tile.building].name : "비어 있음",
    fertility: Math.round(tile.fertility * 100),
    ore: Math.round(tile.ore * 100),
    wind: Math.round(tile.wind * 100),
    solar: Math.round(tile.solar * 100),
    connected: tile.connected,
    damaged: tile.damaged
  };
}

export function getMetrics(state) {
  const tech = currentTech(state);
  return [
    { id: "population", icon: "users", label: "인구", value: fmt(state.population), trend: state.birthDebt },
    { id: "food", icon: "wheat", label: "식량", value: fmt(state.resources.food), trend: state.lastDelta.food ?? 0 },
    { id: "goods", icon: "package", label: "부품", value: fmt(state.resources.goods), trend: state.lastDelta.goods ?? 0 },
    { id: "ore", icon: "gem", label: "광석", value: fmt(state.resources.ore), trend: state.lastDelta.ore ?? 0 },
    { id: "energy", icon: "zap", label: "전력", value: fmt(state.energy.balance), trend: state.energy.balance },
    { id: "health", icon: "heart-pulse", label: "건강", value: fmt(state.health), trend: state.health - 50 },
    { id: "environment", icon: "leaf", label: "생태", value: fmt(state.environment), trend: state.environment - 50 },
    { id: "unity", icon: "landmark", label: "통합", value: fmt(state.unity), trend: state.unity - 50 },
    { id: "science", icon: "flask-conical", label: "과학", value: tech ? `${Math.round((state.techProgress / tech.cost) * 100)}%` : "완료", trend: state.lastDelta.science ?? 0 }
  ];
}

export function getStatusLine(state) {
  const foodMonths = state.population > 0 ? state.resources.food / Math.max(1, state.population * 0.28) : 0;
  const power = state.energy.balance >= 0 ? "전력 여유" : "전력 부족";
  const housing = state.population <= state.housing ? "주거 안정" : "과밀";
  const logistics = state.logistics > 0.82 ? "연결망 양호" : "연결망 취약";
  return `${housing} · ${power} · 식량 ${fmt(foodMonths)}개월 · ${logistics} · 불안 ${fmt(state.unrest)}`;
}
