(() => {
  // game.js?v=20260926-5
  var VIEWPORT = { width: 320, height: 376, physicalWidth: 240, physicalHeight: 282 };
  var WORLD = { width: 320, height: 1400, marbleRadius: 12, goalRadius: 19, unit: 22 };
  var BOUNCE = { holdMs: 400, quickUnits: 1, longUnits: 3, airborneSeconds: 0.38, cooldownSeconds: 0.48 };
  var DIFFICULTIES = ["beginner", "standard", "pro"];
  var CAMERA_LEAD = { forward: 38, backward: -24, neutral: 0 };
  var wall = (x, y, w, h = WORLD.unit, type = "wall") => ({ x, y, w, h, type });
  var feature = (x, y, r, type) => ({ x, y, r, type });
  function sealGates(obstacles) {
    let side = 0;
    return obstacles.map((o) => {
      if (o.h !== WORLD.unit || o.w < 160) return o;
      const r = side++ % 2 === 0 ? { ...o, x: 0, w: o.x + o.w } : { ...o, w: WORLD.width - o.x };
      return r;
    });
  }
  var level = (name, start, goal, obstacles, enemies, powerups, time, features = [], bombs = []) => ({ name, start, goal, obstacles: sealGates(obstacles), enemies, powerups, time, features, bombs });
  var BOMB = { triggerRadius: 25, fuseSeconds: 0.85, blastRadius: 42, blastSeconds: 0.22 };
  var LEVELS = [
    level("first roll", { x: 54, y: 1334 }, { x: 267, y: 66 }, [wall(30, 1210, 185), wall(125, 1018, 165), wall(30, 835, 208), wall(96, 640, 194), wall(30, 450, 205), wall(150, 255, 140), wall(220, 950, 58, 11, "half"), wall(22, 680, 54, 22, "rebound")], [], [{ x: 266, y: 1075 }], 75, [feature(262, 790, 18, "pit"), feature(55, 550, 18, "ice"), feature(260, 680, 22, "sand"), feature(55, 360, 21, "merry")], [feature(158, 1148, 12, "bomb"), feature(171, 576, 12, "bomb")]),
    level("switchback", { x: 52, y: 1335 }, { x: 270, y: 62 }, [wall(30, 1245, 210), wall(82, 1085, 206), wall(30, 925, 200), wall(105, 760, 184), wall(30, 590, 205), wall(110, 410, 178), wall(30, 225, 188), wall(202, 925, WORLD.unit, 88), wall(28, 700, 65, 11, "half"), wall(245, 480, 50, 22, "rebound")], [{ x: 264, y: 1150, r: 14, axis: "y", span: 74, speed: 0.9 }], [{ x: 54, y: 700 }], 82, [feature(260, 1030, 19, "pit"), feature(55, 515, 18, "sticky"), feature(255, 320, 15, "bumper"), feature(55, 825, 22, "sand"), feature(258, 250, 21, "merry")], [feature(159, 1170, 12, "bomb"), feature(160, 665, 12, "bomb")]),
    level("crossfire", { x: 52, y: 1335 }, { x: 269, y: 60 }, [wall(30, 1260, 215), wall(90, 1100, 198), wall(30, 940, 202), wall(95, 780, 193), wall(30, 620, 201), wall(104, 455, 185), wall(30, 290, 195), wall(145, 941, WORLD.unit, 76), wall(62, 620, WORLD.unit, 66), wall(225, 700, 64, 11, "half"), wall(22, 375, 56, 22, "rebound")], [{ x: 258, y: 1180, r: 14, axis: "y", span: 68, speed: 1.2 }, { x: 225, y: 520, r: 14, axis: "x", span: 45, speed: 1.05 }], [{ x: 262, y: 860 }, { x: 56, y: 350 }], 88, [feature(262, 1050, 20, "pit"), feature(58, 845, 18, "ice"), feature(250, 545, 16, "bumper"), feature(60, 205, 15, "spikes"), feature(256, 870, 22, "sand"), feature(57, 440, 21, "merry")], [feature(153, 1188, 12, "bomb"), feature(159, 690, 12, "bomb"), feature(166, 368, 12, "bomb")]),
    level("marble storm", { x: 52, y: 1335 }, { x: 270, y: 60 }, [wall(30, 1270, 174), wall(113, 1120, 175), wall(30, 975, 189), wall(98, 830, 190), wall(30, 680, 198), wall(121, 530, 167), wall(30, 370, 198), wall(116, 210, 172), wall(52, 980, WORLD.unit, 76), wall(252, 720, WORLD.unit, 70), wall(145, 531, WORLD.unit, 76), wall(228, 890, 62, 11, "half"), wall(20, 455, 60, 22, "rebound")], [{ x: 245, y: 1160, r: 14, axis: "x", span: 35, speed: 1.55 }, { x: 55, y: 740, r: 14, axis: "y", span: 75, speed: 1.35 }, { x: 55, y: 350, r: 14, axis: "x", span: 30, speed: 1.7 }], [{ x: 55, y: 1040 }, { x: 262, y: 575 }], 96, [feature(260, 1080, 20, "pit"), feature(56, 875, 18, "sticky"), feature(250, 600, 16, "bumper"), feature(55, 285, 16, "spikes"), feature(257, 440, 18, "ice"), feature(256, 965, 22, "sand"), feature(55, 620, 21, "merry")], [feature(255, 1150, 12, "bomb"), feature(160, 746, 12, "bomb"), feature(55, 470, 12, "bomb")])
  ];
  function newRun(levelIndex = 0, difficulty = "standard") {
    if (!DIFFICULTIES.includes(difficulty)) throw Error("unknown difficulty");
    const l = LEVELS[levelIndex];
    return { levelIndex, difficulty, marble: { ...l.start, vx: 0, vy: 0 }, enemies: l.enemies.map((e) => ({ ...e, origin: e[e.axis], direction: 1 })), powerups: l.powerups.map((p) => ({ ...p, collected: false })), bombs: l.bombs.map((b) => ({ ...b, phase: "idle", time: 0 })), remaining: l.time, lives: 3, status: "playing", airborne: 0, jumpCooldown: 0, jumpKind: null, superJumps: 0, lastDirection: { x: 0, y: -1 }, failure: null, dizzy: 0, terrain: null, gravity: false };
  }
  function circlesOverlap(a, ar, b, br) {
    return Math.hypot(a.x - b.x, a.y - b.y) < ar + br;
  }
  function pointInExpandedRect(p, r, pad) {
    return p.x > r.x - pad && p.x < r.x + r.w + pad && p.y > r.y - pad && p.y < r.y + r.h + pad;
  }
  function moveEnemies(enemies, dt) {
    return enemies.map((e) => {
      const n = { ...e };
      n[e.axis] += n.direction * n.speed * dt * 60;
      if (Math.abs(n[e.axis] - n.origin) > n.span) {
        n.direction *= -1;
        n[e.axis] = n.origin + Math.sign(n[e.axis] - n.origin) * n.span;
      }
      return n;
    });
  }
  function failureFor(run2) {
    return ["explode", "crumble", "melt"][(run2.levelIndex + run2.lives) % 3];
  }
  function collisionAllowed(obstacle, run2) {
    return run2.airborne > 0 && obstacle.h <= WORLD.unit;
  }
  function reflected(m, old, obstacle) {
    const n = { ...m };
    if (old.x + WORLD.marbleRadius <= obstacle.x || old.x - WORLD.marbleRadius >= obstacle.x + obstacle.w) {
      n.x = old.x;
      n.vx = -m.vx * 0.82;
    } else {
      n.y = old.y;
      n.vy = -m.vy * 0.82;
    }
    return n;
  }
  var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function requestJump(run2, heldMs = 0) {
    if (run2.status !== "playing" || run2.airborne > 0 || run2.jumpCooldown > 0) return run2;
    const charged = run2.superJumps > 0, units = (heldMs >= BOUNCE.holdMs ? BOUNCE.longUnits : BOUNCE.quickUnits) * (charged ? 2 : 1);
    const d = run2.lastDirection, origin = run2.marble, end = { x: origin.x + d.x * units * WORLD.unit, y: origin.y + d.y * units * WORLD.unit };
    const l = LEVELS[run2.levelIndex];
    let destination = { ...origin };
    const samples = Math.ceil(units * WORLD.unit / 3);
    for (let i = 1; i <= samples; i++) {
      const p = { x: origin.x + (end.x - origin.x) * i / samples, y: origin.y + (end.y - origin.y) * i / samples };
      if (p.x < WORLD.marbleRadius || p.x > WORLD.width - WORLD.marbleRadius || p.y < WORLD.marbleRadius || p.y > WORLD.height - WORLD.marbleRadius) break;
      if (l.obstacles.some((r) => r.h > WORLD.unit && pointInExpandedRect(p, r, WORLD.marbleRadius))) break;
      if (l.enemies.some((e) => circlesOverlap(p, WORLD.marbleRadius, e, e.r))) break;
      destination = { ...origin, x: p.x, y: p.y };
    }
    if (destination.x === origin.x && destination.y === origin.y) return run2;
    return { ...run2, marble: destination, airborne: BOUNCE.airborneSeconds, jumpCooldown: BOUNCE.cooldownSeconds, jumpKind: charged ? "super" : "normal", superJumps: run2.superJumps - (charged ? 1 : 0) };
  }
  function step(run2, input2, dt) {
    if (run2.status !== "playing") return run2;
    const l = LEVELS[run2.levelIndex], m = { ...run2.marble };
    const terrain = l.features.find((f) => ["ice", "sticky", "sand", "merry"].includes(f.type) && circlesOverlap(m, WORLD.marbleRadius, f, f.r));
    const drag = (terrain == null ? void 0 : terrain.type) === "ice" ? 0.97 : (terrain == null ? void 0 : terrain.type) === "sticky" ? 0.65 : (terrain == null ? void 0 : terrain.type) === "sand" ? 0.55 : 0.89;
    const dizzy = Math.max(0, run2.dizzy - dt), onMerry = (terrain == null ? void 0 : terrain.type) === "merry" && run2.airborne <= 0;
    const steer = onMerry || dizzy > 0 ? { x: input2.y, y: -input2.x } : input2;
    let gx = 0, gy = 0, gravity = false;
    if (run2.difficulty !== "beginner" && run2.airborne <= 0) for (const f of l.features) {
      if (f.type !== "pit") continue;
      const dx = f.x - m.x, dy = f.y - m.y, dist = Math.hypot(dx, dy) || 1, reach = f.r + 75;
      if (dist < reach) {
        gravity = true;
        const force = (run2.difficulty === "pro" ? 2 : 1) * 0.105 * (1 - dist / reach);
        gx += dx / dist * force;
        gy += dy / dist * force;
      }
    }
    const steering = 1;
    m.vx = (m.vx + steer.x * 0.21 * steering * dt * 60 + gx * dt * 60) * Math.pow(drag, dt * 60);
    m.vy = (m.vy + steer.y * 0.21 * steering * dt * 60 + gy * dt * 60) * Math.pow(drag, dt * 60);
    const old = { ...m };
    m.x += m.vx * dt * 60;
    m.y += m.vy * dt * 60;
    const mag = Math.hypot(input2.x, input2.y), lastDirection = mag > 0.1 ? { x: input2.x / mag, y: input2.y / mag } : run2.lastDirection;
    const enemies = moveEnemies(run2.enemies, dt);
    let hitWall = false, exterior = false;
    if (m.x < WORLD.marbleRadius || m.x > WORLD.width - WORLD.marbleRadius || m.y < WORLD.marbleRadius || m.y > WORLD.height - WORLD.marbleRadius) {
      exterior = true;
      const hitX = m.x < WORLD.marbleRadius || m.x > WORLD.width - WORLD.marbleRadius, hitY = m.y < WORLD.marbleRadius || m.y > WORLD.height - WORLD.marbleRadius;
      m.x = clamp(m.x, WORLD.marbleRadius, WORLD.width - WORLD.marbleRadius);
      m.y = clamp(m.y, WORLD.marbleRadius, WORLD.height - WORLD.marbleRadius);
      if (run2.difficulty === "pro") hitWall = true;
      else if (run2.difficulty === "standard") {
        if (hitX) m.vx = -m.vx * 1.3;
        if (hitY) m.vy = -m.vy * 1.3;
      } else {
        m.vx = 0;
        m.vy = 0;
      }
    }
    for (const r of l.obstacles) {
      if (collisionAllowed(r, run2) || !pointInExpandedRect(m, r, WORLD.marbleRadius)) continue;
      if (r.type === "rebound") {
        Object.assign(m, reflected(m, old, r));
      } else hitWall = true;
    }
    let pit = false, spikes = false;
    for (const f of l.features) {
      if (!circlesOverlap(m, WORLD.marbleRadius, f, f.r)) continue;
      if (f.type === "pit" && run2.difficulty !== "beginner" && run2.airborne <= 0) pit = true;
      if (f.type === "spikes" && run2.airborne <= 0) spikes = true;
      if (f.type === "bumper" && run2.airborne <= 0) {
        const dx = m.x - f.x, dy = m.y - f.y, len = Math.hypot(dx, dy) || 1;
        m.x = f.x + dx / len * (f.r + WORLD.marbleRadius + 1);
        m.y = f.y + dy / len * (f.r + WORLD.marbleRadius + 1);
        m.vx = dx / len * 3;
        m.vy = dy / len * 3;
      }
    }
    const bombs = run2.bombs.map((b) => {
      if (b.phase === "idle" && run2.airborne <= 0 && circlesOverlap(m, WORLD.marbleRadius, b, BOMB.triggerRadius)) return { ...b, phase: "fuse", time: BOMB.fuseSeconds };
      if (b.phase === "fuse") {
        const time = b.time - dt;
        return time <= 0 ? { ...b, phase: "blast", time: BOMB.blastSeconds } : { ...b, time };
      }
      if (b.phase === "blast") {
        const time = b.time - dt;
        return time <= 0 ? { ...b, phase: "spent", time: 0 } : { ...b, time };
      }
      return b;
    });
    const bombHit = run2.airborne <= 0 && bombs.some((b) => b.phase === "blast" && circlesOverlap(m, WORLD.marbleRadius, b, BOMB.blastRadius));
    const powerups = run2.powerups.map((p) => !p.collected && circlesOverlap(m, WORLD.marbleRadius, p, 14) ? { ...p, collected: true } : p);
    const superJumps = run2.superJumps + powerups.filter((p, i) => p.collected && !run2.powerups[i].collected).length;
    const hitEnemy = run2.airborne <= 0 && enemies.some((e) => circlesOverlap(m, WORLD.marbleRadius, e, e.r));
    if ((hitWall || pit || spikes || hitEnemy || bombHit) && (onMerry || dizzy > 0)) return { ...run2, marble: { ...l.start, vx: 0, vy: 0 }, enemies, powerups, bombs, superJumps, lastDirection, airborne: 0, jumpKind: null, dizzy: 0, terrain: null, gravity: false };
    if (hitWall || pit || spikes || hitEnemy || bombHit) return { ...run2, lives: run2.lives - 1, marble: { ...l.start, vx: 0, vy: 0 }, enemies, powerups, bombs: l.bombs.map((b) => ({ ...b, phase: "idle", time: 0 })), superJumps, lastDirection, status: run2.lives <= 1 ? "lost" : "playing", failure: bombHit ? "explode" : pit ? "fall" : exterior ? "spikes" : failureFor(run2), airborne: 0, jumpKind: null, jumpCooldown: 0, dizzy: 0, terrain: null, gravity: false };
    if (circlesOverlap(m, WORLD.marbleRadius, l.goal, WORLD.goalRadius)) return { ...run2, marble: m, enemies, powerups, bombs, superJumps, status: run2.levelIndex === LEVELS.length - 1 ? "won" : "cleared" };
    const remaining = Math.max(0, run2.remaining - dt), airborne = Math.max(0, run2.airborne - dt);
    return { ...run2, marble: m, enemies, powerups, bombs, superJumps, remaining, lastDirection, airborne, jumpCooldown: Math.max(0, run2.jumpCooldown - dt), jumpKind: airborne > 0 ? run2.jumpKind : null, status: remaining === 0 ? "lost" : "playing", failure: remaining === 0 ? failureFor(run2) : run2.failure, dizzy: onMerry ? Math.max(dizzy, 0.75) : dizzy, terrain: (terrain == null ? void 0 : terrain.type) || null, gravity };
  }
  function nextLevel(run2) {
    return newRun(Math.min(run2.levelIndex + 1, LEVELS.length - 1), run2.difficulty);
  }
  function cameraFor(run2, viewportHeight = VIEWPORT.height) {
    const look = run2.lastDirection.y < -0.15 ? CAMERA_LEAD.forward : run2.lastDirection.y > 0.15 ? CAMERA_LEAD.backward : CAMERA_LEAD.neutral;
    return Math.max(0, Math.min(WORLD.height - viewportHeight, run2.marble.y - viewportHeight / 2 + look));
  }
  function smoothCamera(current, target, dt) {
    return current + (target - current) * (1 - Math.exp(-9 * Math.max(0, dt)));
  }

  // app.js
  var $ = (s) => document.querySelector(s);
  var canvas = $("#game");
  var ctx = canvas.getContext("2d");
  var levelText = $("#level");
  var livesText = $("#lives");
  var timerText = $("#timer");
  var notice = $("#notice");
  var tiltButton = $("#tilt");
  var tiltStatus = $("#tilt-status");
  var dpad = $("#dpad");
  var bounceButton = $("#bounce");
  var run = newRun();
  var input = { x: 0, y: 0 };
  var last = performance.now();
  var tiltActive = false;
  var manualPause = false;
  var menuOpen = false;
  var phase = "splash";
  var audioOn = true;
  var audio = null;
  var failUntil = 0;
  var camera = cameraFor(run);
  var transition = null;
  var bouncePress = null;
  var selectedDifficulty = "standard";
  var keys = /* @__PURE__ */ new Set();
  var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
  var playing = () => phase === "playing" && !menuOpen && !manualPause;
  function sound(kind) {
    if (!audioOn || !playing()) return;
    try {
      audio != null ? audio : audio = new AudioContext();
      if (audio.state === "suspended") audio.resume();
      const o = audio.createOscillator(), g = audio.createGain();
      o.connect(g).connect(audio.destination);
      const map = { jump: [330, 0.07, "square"], super: [660, 0.12, "sine"], pickup: [880, 0.1, "triangle"], hit: [90, 0.18, "sawtooth"], win: [520, 0.24, "sine"] };
      const [f, d, t] = map[kind] || map.jump;
      o.frequency.setValueAtTime(f, audio.currentTime);
      if (kind === "hit") o.frequency.exponentialRampToValueAtTime(35, audio.currentTime + d);
      g.gain.setValueAtTime(0.07, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(1e-3, audio.currentTime + d);
      o.type = t;
      o.start();
      o.stop(audio.currentTime + d);
    } catch {
      audioOn = false;
      $("#audio").textContent = "audio unavailable";
    }
  }
  function music() {
    if (!audioOn || phase !== "playing") return;
    try {
      audio != null ? audio : audio = new AudioContext();
      if (audio.state === "suspended") audio.resume();
      if (audio._mm) return;
      audio._mm = setInterval(() => {
        if (playing() && run.status === "playing") sound("pickup");
      }, 1800);
    } catch {
    }
  }
  function freezeAudio() {
    if ((audio == null ? void 0 : audio.state) === "running") audio.suspend().catch(() => {
    });
  }
  function resumeAudio() {
    if (audioOn && phase === "playing" && !menuOpen && !manualPause && (audio == null ? void 0 : audio.state) === "suspended") audio.resume().catch(() => {
    });
  }
  function updateKeyboard() {
    input.x = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
    input.y = (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
  }
  function jump(heldMs = 0) {
    if (!playing() || run.status !== "playing" || transition) return;
    const next = requestJump(run, heldMs);
    if (next === run) return;
    const distance = Math.round(Math.hypot(next.marble.x - run.marble.x, next.marble.y - run.marble.y));
    run = next;
    sound(next.jumpKind === "super" ? "super" : "jump");
    notice.textContent = `${next.jumpKind === "super" ? "super \xB7 " : ""}${heldMs >= BOUNCE.holdMs ? "long" : "tap"} ${(distance / WORLD.unit).toFixed(1)} units`;
  }
  addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      e.preventDefault();
      keys.add(e.key);
      updateKeyboard();
    }
    if (e.key === " " && !e.repeat) {
      e.preventDefault();
      bouncePress = { keyboard: true, start: performance.now() };
    }
    if (e.key === "Escape" && phase === "playing") {
      menuOpen = !menuOpen;
      syncMenu();
    }
  });
  addEventListener("keyup", (e) => {
    keys.delete(e.key);
    updateKeyboard();
    if (e.key === " " && (bouncePress == null ? void 0 : bouncePress.keyboard)) {
      jump(performance.now() - bouncePress.start);
      bouncePress = null;
    }
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (!playing() || tiltActive || transition) return;
    const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * VIEWPORT.width, y = (e.clientY - r.top) / r.height * VIEWPORT.height;
    input = { ...input, x: Math.abs(x - VIEWPORT.width / 2) > Math.abs(y - VIEWPORT.height / 2) ? Math.sign(x - VIEWPORT.width / 2) : 0, y: Math.abs(y - VIEWPORT.height / 2) >= Math.abs(x - VIEWPORT.width / 2) ? Math.sign(y - VIEWPORT.height / 2) : 0 };
    music();
  });
  canvas.addEventListener("pointerup", () => {
    if (!tiltActive) {
      input.x = 0;
      input.y = 0;
    }
  });
  function setTiltStatus(text) {
    tiltStatus.textContent = text;
  }
  function syncPad() {
    dpad.classList.toggle("tilt-mode", tiltActive);
    dpad.setAttribute("aria-label", tiltActive ? "bounce control" : "touch movement and bounce controls");
    if (tiltActive) {
      input.x = 0;
      input.y = 0;
    }
  }
  async function enableTilt() {
    try {
      if (typeof DeviceOrientationEvent === "undefined") throw Error("unavailable");
      if (typeof DeviceOrientationEvent.requestPermission === "function" && await DeviceOrientationEvent.requestPermission() !== "granted") throw Error("denied");
      tiltActive = true;
      syncPad();
      tiltButton.textContent = "tilt on";
      tiltButton.setAttribute("aria-pressed", "true");
      setTiltStatus("tilt enabled \u2014 move R1 to steer");
      notice.textContent = "tilt enabled";
    } catch {
      tiltActive = false;
      syncPad();
      tiltButton.textContent = "tilt";
      tiltButton.setAttribute("aria-pressed", "false");
      setTiltStatus("tilt unavailable \u2014 use arrows, WASD, or board edges");
      notice.textContent = "tilt unavailable \u2014 fallback controls ready";
    }
  }
  addEventListener("deviceorientation", (e) => {
    if (!tiltActive || e.gamma == null || e.beta == null || !playing()) return;
    input.x = clamp2(e.gamma / 25, -1, 1);
    input.y = clamp2(e.beta / 25, -1, 1);
  });
  function showPhase(next) {
    cancelBounce();
    phase = next;
    $("#splash").hidden = next !== "splash";
    $("#start-menu").hidden = next !== "menu";
    $("#hud").hidden = next !== "playing";
    tiltButton.hidden = next !== "playing";
    $("#waffle").hidden = next !== "playing";
    dpad.hidden = next !== "playing";
    notice.textContent = "";
    if (next !== "playing") freezeAudio();
    syncMenu();
  }
  function startGame() {
    run = newRun(0, selectedDifficulty);
    camera = cameraFor(run);
    manualPause = false;
    showPhase("playing");
    transition = { kind: "enter", start: performance.now(), duration: 650 };
    notice.textContent = `enter ${LEVELS[0].name}`;
    music();
    resumeAudio();
    syncUI();
  }
  function syncMenu() {
    if (menuOpen) {
      cancelBounce();
      if (transition && !transition.pausedAt) transition.pausedAt = performance.now();
    } else if (transition == null ? void 0 : transition.pausedAt) {
      transition.start += performance.now() - transition.pausedAt;
      transition.pausedAt = 0;
    }
    const visible = phase === "playing" && menuOpen;
    $("#menu").hidden = !visible;
    $("#waffle").setAttribute("aria-expanded", String(visible));
    if (visible) freezeAudio();
    else resumeAudio();
    syncUI();
  }
  function toggleMenu() {
    if (phase !== "playing") return;
    menuOpen = !menuOpen;
    syncMenu();
  }
  function setPadDirection(direction, pressed) {
    const vectors = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [x, y] = vectors[direction];
    if (pressed && playing() && !tiltActive) {
      input.x = x;
      input.y = y;
      music();
    } else if (!tiltActive) {
      input.x = 0;
      input.y = 0;
    }
  }
  for (const button of document.querySelectorAll(".pad-dir")) {
    const direction = button.dataset.direction;
    button.addEventListener("pointerdown", (event) => {
      var _a;
      event.preventDefault();
      (_a = button.setPointerCapture) == null ? void 0 : _a.call(button, event.pointerId);
      setPadDirection(direction, true);
    });
    for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(eventName, () => setPadDirection(direction, false));
  }
  function cancelBounce() {
    bouncePress = null;
    bounceButton.classList.remove("charging");
  }
  bounceButton.addEventListener("pointerdown", (event) => {
    var _a;
    event.preventDefault();
    if (!playing()) return;
    bouncePress = { id: event.pointerId, start: performance.now() };
    (_a = bounceButton.setPointerCapture) == null ? void 0 : _a.call(bounceButton, event.pointerId);
    bounceButton.classList.add("charging");
    music();
  });
  bounceButton.addEventListener("pointerup", (event) => {
    if ((bouncePress == null ? void 0 : bouncePress.id) !== event.pointerId) return;
    const held = performance.now() - bouncePress.start;
    cancelBounce();
    jump(held);
  });
  for (const name of ["pointercancel", "lostpointercapture"]) bounceButton.addEventListener(name, () => cancelBounce());
  tiltButton.onclick = enableTilt;
  $("#restart").onclick = () => {
    cancelBounce();
    transition = null;
    run = newRun(0, selectedDifficulty);
    camera = cameraFor(run);
    input.x = 0;
    input.y = 0;
    manualPause = false;
    notice.textContent = "";
    menuOpen = false;
    syncMenu();
    music();
  };
  $("#pause").onclick = () => {
    cancelBounce();
    manualPause = !manualPause;
    if (manualPause) freezeAudio();
    else resumeAudio();
    syncUI();
  };
  $("#audio").onclick = () => {
    audioOn = !audioOn;
    $("#audio").textContent = audioOn ? "audio on" : "audio off";
    if (audioOn) {
      music();
      resumeAudio();
    } else freezeAudio();
  };
  $("#waffle").onclick = toggleMenu;
  $("#close-menu").onclick = toggleMenu;
  $("#resume").onclick = toggleMenu;
  $("#difficulty").onchange = (e) => {
    selectedDifficulty = e.target.value;
  };
  var continueToMenu = () => showPhase("menu");
  $("#continue").onclick = continueToMenu;
  $("#splash").addEventListener("pointerup", (e) => {
    if (phase === "splash" && e.target !== $("#continue")) continueToMenu();
  });
  $("#start").onclick = startGame;
  $("#start-waffle").onclick = () => {
    notice.textContent = "options are available from the waffle during play";
  };
  $("#theme").onclick = () => {
    const light = document.documentElement.dataset.theme === "light";
    document.documentElement.dataset.theme = light ? "dark" : "light";
    $("#theme").textContent = light ? "light mode" : "dark mode";
  };
  document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  function syncUI() {
    const l = LEVELS[run.levelIndex];
    levelText.textContent = `${String(run.levelIndex + 1).padStart(2, "0")} ${l.name}`;
    livesText.textContent = "\u25CF ".repeat(run.lives).trim() || "\u2014";
    timerText.textContent = run.remaining.toFixed(1);
    bounceButton.textContent = bouncePress ? performance.now() - bouncePress.start >= BOUNCE.holdMs ? "long" : "hold" : run.superJumps > 0 ? `super \xD7${run.superJumps}` : "bounce";
    $("#effect").textContent = [run.bombs.some((b) => b.phase === "fuse") ? "bomb! move away" : null, run.gravity ? "pull" : null, run.terrain === "sand" ? "sand slow" : null, run.dizzy > 0 ? "dizzy" : null].filter(Boolean).join(" \xB7 ");
    bounceButton.setAttribute("aria-label", run.superJumps > 0 ? "super bounce" : "bounce");
    $("#pause").textContent = manualPause ? "resume" : "pause";
  }
  function circle(x, y, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function draw() {
    const css = getComputedStyle(document.documentElement), bg = css.getPropertyValue("--board"), line = css.getPropertyValue("--line"), accent = css.getPropertyValue("--accent"), text = css.getPropertyValue("--text");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 240, 282);
    ctx.save();
    ctx.scale(240 / VIEWPORT.width, 282 / VIEWPORT.height);
    ctx.translate(0, -camera);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    for (let y = Math.floor(camera / 22) * 22; y < camera + VIEWPORT.height + 22; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD.width, y);
      ctx.stroke();
    }
    for (let x = 22; x < WORLD.width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, camera);
      ctx.lineTo(x, camera + VIEWPORT.height);
      ctx.stroke();
    }
    const l = LEVELS[run.levelIndex];
    ctx.fillStyle = text;
    l.obstacles.forEach((r) => {
      ctx.fillStyle = r.type === "half" ? "#f9c64b" : r.type === "rebound" ? "#52e0dd" : text;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      if (r.type === "rebound") {
        ctx.fillStyle = "#163d45";
        for (let x = r.x + 4; x < r.x + r.w - 3; x += 12) ctx.fillRect(x, r.y + 4, 5, r.h - 8);
      }
    });
    l.features.forEach((f) => {
      if (f.type === "pit") {
        if (run.difficulty === "beginner") return;
        ctx.strokeStyle = "#b66ad0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r + 8, 0, Math.PI * 1.7);
        ctx.stroke();
        circle(f.x, f.y, f.r + 3, "#c45bdb");
        circle(f.x, f.y, f.r, "#040308");
        circle(f.x - 5, f.y - 6, 2, "#86539d");
      } else if (f.type === "sand") {
        circle(f.x, f.y, f.r, "#b69351");
        circle(f.x - 6, f.y + 4, 2, "#f4dc91");
      } else if (f.type === "merry") {
        circle(f.x, f.y, f.r, "#64b7cf");
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.arc(f.x, f.y, 11, performance.now() / 500, performance.now() / 500 + 4);
        ctx.stroke();
      } else if (f.type === "ice") {
        circle(f.x, f.y, f.r, "#85d8f0");
        ctx.fillStyle = "#fff";
        ctx.fillRect(f.x - 9, f.y - 2, 17, 2);
      } else if (f.type === "sticky") {
        circle(f.x, f.y, f.r, "#9b7a42");
        circle(f.x + 4, f.y - 3, 4, "#513c29");
      } else if (f.type === "bumper") {
        circle(f.x, f.y, f.r + 2, "#68e5dd");
        circle(f.x, f.y, f.r - 5, "#116f80");
      } else {
        circle(f.x, f.y, f.r, "#dc5252");
        ctx.fillStyle = "#fff";
        ctx.fillText("\u2726", f.x - 8, f.y + 6);
      }
    });
    run.bombs.forEach((b) => {
      if (b.phase === "spent") return;
      const armed = b.phase === "fuse", burst = b.phase === "blast";
      ctx.strokeStyle = burst ? "#fff4ad" : armed ? "#ffb12b" : "#fca751";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, burst ? BOMB.blastRadius : armed ? BOMB.triggerRadius : b.r + 3, 0, Math.PI * 2);
      ctx.stroke();
      circle(b.x, b.y, b.r, burst ? "#ffe6a2" : "#24232b");
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px Helvetica";
      ctx.fillText("\u2739", b.x - 8, b.y + 5);
      ctx.fillStyle = "#ffad30";
      ctx.fillRect(b.x - 2, b.y - b.r - 5, 4, 5);
      if (armed) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Helvetica";
        ctx.fillText(String(Math.ceil(b.time * 10) / 10), b.x - 8, b.y - 17);
      }
    });
    circle(l.goal.x, l.goal.y, WORLD.goalRadius, accent);
    ctx.fillStyle = text;
    ctx.font = "20px Helvetica";
    ctx.fillText("exit", l.goal.x - 18, l.goal.y + 6);
    run.powerups.forEach((p) => {
      if (!p.collected) {
        circle(p.x, p.y, 14, accent);
        ctx.fillStyle = bg;
        ctx.font = "20px Helvetica";
        ctx.fillText("\u2605", p.x - 10, p.y + 7);
      }
    });
    run.enemies.forEach((e) => {
      circle(e.x, e.y, e.r, "#a83243");
      circle(e.x - 5, e.y - 2, 3, "#fff");
      circle(e.x + 5, e.y - 2, 3, "#fff");
      circle(e.x - 4, e.y - 1, 1.5, "#180a18");
      circle(e.x + 4, e.y - 1, 1.5, "#180a18");
      ctx.strokeStyle = "#210b1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x - 9, e.y - 8);
      ctx.lineTo(e.x - 2, e.y - 5);
      ctx.moveTo(e.x + 9, e.y - 8);
      ctx.lineTo(e.x + 2, e.y - 5);
      ctx.moveTo(e.x - 5, e.y + 8);
      ctx.quadraticCurveTo(e.x, e.y + 3, e.x + 5, e.y + 8);
      ctx.stroke();
    });
    if (run.airborne > 0) circle(run.marble.x, run.marble.y + 10, 10, "rgba(0,0,0,.35)");
    const g = ctx.createRadialGradient(run.marble.x - 5, run.marble.y - 6, 2, run.marble.x, run.marble.y, 14);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.25, "#ffe234");
    g.addColorStop(0.6, "#ff4612");
    g.addColorStop(1, "#6f35ff");
    circle(run.marble.x, run.marble.y - (run.airborne > 0 ? 12 : 0), WORLD.marbleRadius, g);
    if (performance.now() < failUntil) {
      const t = (failUntil - performance.now()) / 600;
      ctx.globalAlpha = t;
      ctx.fillStyle = accent;
      if (run.failure === "explode") {
        for (let i = 0; i < 12; i++) {
          const a = i * Math.PI / 6;
          circle(run.marble.x + Math.cos(a) * (1 - t) * 70, run.marble.y + Math.sin(a) * (1 - t) * 70, 7, accent);
        }
      } else if (run.failure === "crumble") {
        for (let i = 0; i < 8; i++) ctx.fillRect(run.marble.x - 24 + i * 6, run.marble.y + (1 - t) * 45 + i % 2 * 8, 5, 5);
      } else ctx.fillRect(run.marble.x - 18, run.marble.y, 36, 65 * (1 - t));
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (transition) {
      const t = Math.min(1, ((transition.pausedAt || performance.now()) - transition.start) / transition.duration);
      ctx.save();
      ctx.translate(120, 141);
      ctx.rotate(t * Math.PI * 2);
      ctx.strokeStyle = "#ffca43";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 12 + 90 * t, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = `rgba(6,3,18,${transition.kind === "exit" ? t * 0.75 : (1 - t) * 0.75})`;
      ctx.fillRect(0, 0, 240, 282);
    }
  }
  function frame(now) {
    const dt = Math.min(0.04, (now - last) / 1e3);
    last = now;
    const previous = run;
    if (transition && playing()) {
      const elapsed = now - transition.start;
      if (elapsed >= transition.duration) {
        if (transition.kind === "exit") {
          run = nextLevel(run);
          camera = cameraFor(run);
          transition = { kind: "enter", start: now, duration: 650 };
          notice.textContent = `enter ${LEVELS[run.levelIndex].name}`;
        } else {
          const finished = transition.kind;
          transition = null;
          if (finished === "victory") manualPause = true;
          else notice.textContent = "";
          resumeAudio();
        }
      }
    }
    if (playing() && !transition && run.status === "playing") run = step(run, input, dt);
    if (previous.dizzy > 0 && run.dizzy === 0 && run.marble.x === LEVELS[run.levelIndex].start.x && run.marble.y === LEVELS[run.levelIndex].start.y) notice.textContent = "dizzy cleared \xB7 safe reset";
    if (run.failure && run.lives < previous.lives) {
      failUntil = now + 600;
      sound("hit");
      notice.textContent = `${run.failure}! try that lane again.`;
    }
    if (run.superJumps > previous.superJumps) {
      sound("pickup");
      notice.textContent = "super bounce charged";
    }
    if (!transition && run.status === "cleared") {
      cancelBounce();
      transition = { kind: "exit", start: now, duration: 650 };
      notice.textContent = `level clear \xB7 ${LEVELS[run.levelIndex + 1].name}`;
      sound("win");
    } else if (!transition && run.status === "won" && !manualPause) {
      cancelBounce();
      transition = { kind: "victory", start: now, duration: 650 };
      notice.textContent = "all four long runs cleared";
      sound("win");
    } else if (run.status === "won" && !transition) {
      manualPause = true;
    } else if (run.status === "lost") {
      notice.textContent = `${run.failure || "run"} ended \xB7 restart to try again`;
      manualPause = true;
    }
    camera = smoothCamera(camera, cameraFor(run), dt);
    syncUI();
    draw();
    requestAnimationFrame(frame);
  }
  showPhase("splash");
  syncUI();
  requestAnimationFrame(frame);
})();
