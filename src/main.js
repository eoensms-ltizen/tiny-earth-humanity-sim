import {
  Atom,
  Activity,
  BadgeCheck,
  Bot,
  BrainCircuit,
  CircleGauge,
  Factory,
  FlaskConical,
  Gem,
  Globe2,
  Hammer,
  Hand,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  Microscope,
  MousePointerClick,
  Orbit,
  Package,
  Pause,
  Pickaxe,
  Play,
  Rocket,
  RotateCcw,
  Route,
  Scale,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Sprout,
  Target,
  Users,
  WandSparkles,
  Wheat,
  Workflow,
  Zap,
  createIcons
} from "lucide";
import "./styles.css";
import {
  BIOMES,
  BUILDINGS,
  POLICIES,
  TECHS,
  advanceMonth,
  buildOnTile,
  canBuild,
  costText,
  createSimulation,
  currentTech,
  getAutoPlan,
  getBuildList,
  getDateLabel,
  getEra,
  getMetrics,
  getStrategicGoals,
  getStatusLine,
  getTileSummary,
  getWorldMood,
  setAutoMode,
  setPolicy
} from "./simulation.js";
import { WorldView } from "./world.js";

let state = createSimulation();
let accumulator = 0;
let lastTime = performance.now();
let lastRenderedTick = -1;

const els = {
  canvas: document.querySelector("#world"),
  metricStrip: document.querySelector("#metricStrip"),
  buildTools: document.querySelector("#buildTools"),
  tileInspector: document.querySelector("#tileInspector"),
  researchView: document.querySelector("#researchView"),
  policyButtons: document.querySelector("#policyButtons"),
  statusLine: document.querySelector("#statusLine"),
  eventLog: document.querySelector("#eventLog"),
  autoButton: document.querySelector("#autoButton"),
  directorView: document.querySelector("#directorView"),
  goalsView: document.querySelector("#goalsView"),
  eraLabel: document.querySelector("#eraLabel"),
  dateLabel: document.querySelector("#dateLabel"),
  pauseButton: document.querySelector("#pauseButton"),
  speedButtons: document.querySelector("#speedButtons"),
  endModal: document.querySelector("#endModal"),
  endTitle: document.querySelector("#endTitle"),
  endText: document.querySelector("#endText"),
  restartButton: document.querySelector("#restartButton")
};

const iconSet = {
  Activity,
  Atom,
  BadgeCheck,
  Bot,
  BrainCircuit,
  CircleGauge,
  Factory,
  FlaskConical,
  Gem,
  Globe2,
  Hammer,
  Hand,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  Microscope,
  MousePointerClick,
  Orbit,
  Package,
  Pause,
  Pickaxe,
  Play,
  Rocket,
  RotateCcw,
  Route,
  Scale,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Sprout,
  Target,
  Users,
  WandSparkles,
  Wheat,
  Workflow,
  Zap
};

const world = new WorldView(els.canvas, {
  onTileClick(tileId) {
    const tile = state.tiles[tileId];
    state.selectedTileId = tileId;
    world.setSelected(tileId);
    if (state.selectedTool) {
      const placed = buildOnTile(state, tileId, state.selectedTool);
      if (placed) {
        world.updateMood(state);
        world.refreshTiles(state.tiles);
        renderAll(true);
      } else {
        renderInspector();
        renderLog();
      }
      return;
    }
    renderInspector();
  }
});

world.setTiles(state.tiles);
world.updateMood(state);

function signedTrend(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return "flat";
  return value > 0 ? "up" : "down";
}

function renderMetrics() {
  els.metricStrip.innerHTML = getMetrics(state)
    .map(
      (metric) => `
        <div class="metric ${signedTrend(metric.trend)}">
          <i data-lucide="${metric.icon}"></i>
          <div>
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
          </div>
        </div>
      `
    )
    .join("");
}

function renderBuildTools() {
  const selectedTile = state.selectedTileId === null ? null : state.tiles[state.selectedTileId];
  els.buildTools.innerHTML = getBuildList(state)
    .map((building) => {
      const check = selectedTile ? canBuild(state, selectedTile, building.id) : { ok: building.unlocked, reason: building.unlocked ? "" : "연구 필요" };
      const disabled = !building.unlocked;
      return `
        <button type="button" class="tool-button ${state.selectedTool === building.id ? "active" : ""}" data-building="${building.id}" ${disabled ? "disabled" : ""} title="${building.name} · ${costText(building.cost)}">
          <i data-lucide="${building.icon}"></i>
          <span>${building.name}</span>
          <small>${building.unlocked ? building.desc : "잠김"}</small>
          ${selectedTile && !check.ok ? `<em>${check.reason}</em>` : ""}
        </button>
      `;
    })
    .join("");

  els.buildTools.querySelectorAll("button[data-building]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedTool = state.selectedTool === button.dataset.building ? null : button.dataset.building;
      renderBuildTools();
      renderInspector();
      createIcons({ icons: iconSet });
    });
  });
}

function meter(label, value, className = "") {
  const width = Math.max(0, Math.min(100, value));
  return `
    <div class="meter ${className}">
      <span>${label}</span>
      <div><b style="width:${width}%"></b></div>
      <strong>${Math.round(value)}</strong>
    </div>
  `;
}

function renderInspector() {
  const tile = state.selectedTileId === null ? null : state.tiles[state.selectedTileId];
  if (!tile) {
    els.tileInspector.innerHTML = `
      <div class="empty-state">
        <i data-lucide="mouse-pointer-click"></i>
        <span>행성 타일을 선택</span>
      </div>
    `;
    renderBuildTools();
    return;
  }

  const summary = getTileSummary(tile);
  const building = tile.building ? BUILDINGS[tile.building] : null;
  const biome = BIOMES[tile.biome];
  const selected = state.selectedTool ? BUILDINGS[state.selectedTool] : null;
  const buildCheck = selected ? canBuild(state, tile, state.selectedTool) : null;

  els.tileInspector.innerHTML = `
    <div class="tile-heading">
      <div class="biome-chip" style="--chip:#${biome.color.toString(16).padStart(6, "0")}"></div>
      <div>
        <h2>${summary.biome}</h2>
        <span>${summary.connected ? "연결됨" : "고립"} · ${summary.building}</span>
      </div>
    </div>
    <div class="tile-stats">
      ${meter("비옥도", summary.fertility, "food")}
      ${meter("광맥", summary.ore, "ore")}
      ${meter("풍력", summary.wind, "energy")}
      ${meter("일사", summary.solar, "energy")}
    </div>
    <div class="selected-build">
      ${
        selected
          ? `<i data-lucide="${selected.icon}"></i><div><strong>${selected.name}</strong><span>${costText(selected.cost)}</span></div>`
          : `<i data-lucide="hand"></i><div><strong>조사 모드</strong><span>건설 도구를 다시 누르면 해제</span></div>`
      }
    </div>
    ${
      building
        ? `<div class="building-card"><i data-lucide="${building.icon}"></i><div><strong>${building.name}</strong><span>${tile.damaged > 0 ? "수리 중" : "운영 중"} · ${tile.connected ? "물류 연결" : "저효율"}</span></div></div>`
        : ""
    }
    ${
      selected
        ? `<button class="primary-action" id="buildHere" type="button" ${buildCheck.ok ? "" : "disabled"}>
            <i data-lucide="${selected.icon}"></i>
            ${buildCheck.ok ? "이곳에 건설" : buildCheck.reason}
          </button>`
        : ""
    }
  `;

  const buildHere = els.tileInspector.querySelector("#buildHere");
  if (buildHere) {
    buildHere.addEventListener("click", () => {
      if (buildOnTile(state, tile.id, state.selectedTool)) {
        world.updateMood(state);
        world.refreshTiles(state.tiles);
        renderAll(true);
      } else {
        renderInspector();
        renderLog();
      }
    });
  }
  renderBuildTools();
}

function renderResearch() {
  const tech = currentTech(state);
  if (!tech) {
    els.researchView.innerHTML = `
      <div class="research-complete">
        <strong>연구 완료</strong>
        <span>모든 시대 기술 확보</span>
      </div>
    `;
    return;
  }
  const progress = Math.min(100, (state.techProgress / tech.cost) * 100);
  const next = TECHS[state.techIndex + 1];
  els.researchView.innerHTML = `
    <div class="research-main">
      <div>
        <strong>${tech.name}</strong>
        <span>${tech.text}</span>
      </div>
      <b>${Math.round(progress)}%</b>
    </div>
    <div class="progress"><span style="width:${progress}%"></span></div>
    <small>${next ? `다음: ${next.name}` : "최종 연구"}</small>
  `;
}

function renderPolicy() {
  els.policyButtons.innerHTML = Object.entries(POLICIES)
    .map(
      ([id, policy]) => `
        <button type="button" data-policy="${id}" class="${state.policy === id ? "active" : ""}" title="${policy.label}">
          <i data-lucide="${policy.icon}"></i>
          <span>${policy.label}</span>
        </button>
      `
    )
    .join("");
  els.policyButtons.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      setPolicy(state, button.dataset.policy);
      renderAll(true);
    });
  });
}

function renderDirector() {
  const plan = getAutoPlan(state);
  const mood = getWorldMood(state);
  const stability = Math.round(mood.stability);
  els.directorView.innerHTML = `
    <div class="director-head ${plan.enabled ? "on" : ""}">
      <div>
        <strong>${plan.enabled ? "자동 운영 중" : "수동 운영"}</strong>
        <span>${mood.label} · 안정도 ${stability}</span>
      </div>
      <i data-lucide="${plan.enabled ? "bot" : "hand"}"></i>
    </div>
    <div class="director-bars">
      <div class="world-stability ${mood.tone}">
        <span style="width:${stability}%"></span>
      </div>
    </div>
    <div class="director-grid">
      <div><span>다음 건설</span><strong>${plan.next}</strong></div>
      <div><span>판단 근거</span><strong>${plan.reason}</strong></div>
      <div><span>현재 중점</span><strong>${plan.focus}</strong></div>
      <div><span>최근 조치</span><strong>${plan.lastAction}</strong></div>
    </div>
  `;
}

function renderGoals() {
  els.goalsView.innerHTML = getStrategicGoals(state)
    .map(
      (goal) => `
        <div class="goal-row ${goal.complete ? "complete" : ""} ${goal.active ? "active" : ""}">
          <i data-lucide="${goal.complete ? "badge-check" : goal.active ? "sparkles" : "circle-gauge"}"></i>
          <div>
            <strong>${goal.title}</strong>
            <span>${goal.text}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderLog() {
  els.statusLine.textContent = getStatusLine(state);
  els.eventLog.innerHTML = state.log
    .map((entry) => `<div class="${entry.tone}"><span></span>${entry.text}</div>`)
    .join("");
}

function renderClock() {
  els.eraLabel.textContent = getEra(state);
  els.dateLabel.textContent = getDateLabel(state);
  els.autoButton.classList.toggle("active", state.autoMode);
  els.autoButton.innerHTML = `<i data-lucide="${state.autoMode ? "bot" : "wand-sparkles"}"></i>${state.autoMode ? "자동" : "수동"}`;
  els.pauseButton.classList.toggle("active", state.paused);
  els.pauseButton.innerHTML = `<i data-lucide="${state.paused ? "play" : "pause"}"></i>`;
  els.speedButtons.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.speed) === state.speed);
  });
}

function renderEndState() {
  if (!state.gameOver) {
    els.endModal.classList.add("hidden");
    return;
  }
  els.endTitle.textContent = state.gameOver.title;
  els.endText.textContent = state.gameOver.text;
  els.endModal.classList.remove("hidden");
}

function renderAll(force = false) {
  if (!force && lastRenderedTick === state.tickSerial) return;
  lastRenderedTick = state.tickSerial;
  renderMetrics();
  renderInspector();
  renderDirector();
  renderGoals();
  renderResearch();
  renderPolicy();
  renderLog();
  renderClock();
  renderEndState();
  createIcons({ icons: iconSet });
}

els.pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  renderClock();
  createIcons({ icons: iconSet });
});

els.autoButton.addEventListener("click", () => {
  setAutoMode(state, !state.autoMode);
  state.paused = false;
  renderAll(true);
});

els.speedButtons.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    state.speed = Number(button.dataset.speed);
    state.paused = false;
    renderClock();
  });
});

els.restartButton.addEventListener("click", () => {
  state = createSimulation();
  accumulator = 0;
  lastRenderedTick = -1;
  world.setTiles(state.tiles);
  world.updateMood(state);
  world.setSelected(null);
  renderAll(true);
});

function frame(time) {
  const delta = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;

  if (!state.paused && !state.gameOver) {
    accumulator += delta * state.speed;
    while (accumulator >= 0.72) {
      advanceMonth(state);
      accumulator -= 0.72;
      world.updateMood(state);
      world.refreshTiles(state.tiles);
    }
  }

  world.updateMood(state);
  world.animate();
  renderAll();
  requestAnimationFrame(frame);
}

renderAll(true);
requestAnimationFrame(frame);
