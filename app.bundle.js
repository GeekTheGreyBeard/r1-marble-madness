(() => {
  // game.js?v=20260926-2
  var VIEWPORT = { width: 320, height: 376, physicalWidth: 240, physicalHeight: 282 };
  var WORLD = { width: 320, height: 1400, marbleRadius: 12, goalRadius: 19, unit: 22 };
  var CAMERA_LEAD = { forward: 38, backward: -24, neutral: 0 };
  var wall = (x, y, w, h = WORLD.unit, type = "wall") => ({ x, y, w, h, type });
  var feature = (x, y, r, type) => ({ x, y, r, type });
  var level = (name, start, goal, obstacles, enemies, powerups, time, features = []) => ({ name, start, goal, obstacles, enemies, powerups, time, features });
  var LEVELS = [
    level("first roll", { x: 54, y: 1334 }, { x: 267, y: 66 }, [wall(30, 1210, 185), wall(125, 1018, 165), wall(30, 835, 208), wall(96, 640, 194), wall(30, 450, 205), wall(150, 255, 140), wall(220, 950, 58, 11, "half"), wall(22, 680, 54, 22, "rebound")], [], [{ x: 266, y: 1075 }], 75, [feature(262, 790, 18, "pit"), feature(55, 550, 18, "ice")]),
    level("switchback", { x: 52, y: 1335 }, { x: 270, y: 62 }, [wall(30, 1245, 210), wall(82, 1085, 206), wall(30, 925, 200), wall(105, 760, 184), wall(30, 590, 205), wall(110, 410, 178), wall(30, 225, 188), wall(202, 925, WORLD.unit, 88), wall(28, 700, 65, 11, "half"), wall(245, 480, 50, 22, "rebound")], [{ x: 264, y: 1150, r: 14, axis: "y", span: 74, speed: 0.9 }], [{ x: 54, y: 700 }], 82, [feature(260, 1030, 19, "pit"), feature(55, 515, 18, "sticky"), feature(255, 320, 15, "bumper")]),
    level("crossfire", { x: 52, y: 1335 }, { x: 269, y: 60 }, [wall(30, 1260, 215), wall(90, 1100, 198), wall(30, 940, 202), wall(95, 780, 193), wall(30, 620, 201), wall(104, 455, 185), wall(30, 290, 195), wall(145, 941, WORLD.unit, 76), wall(62, 620, WORLD.unit, 66), wall(225, 700, 64, 11, "half"), wall(22, 375, 56, 22, "rebound")], [{ x: 258, y: 1180, r: 14, axis: "y", span: 68, speed: 1.2 }, { x: 65, y: 520, r: 14, axis: "x", span: 55, speed: 1.05 }], [{ x: 262, y: 860 }, { x: 56, y: 350 }], 88, [feature(262, 1050, 20, "pit"), feature(58, 845, 18, "ice"), feature(250, 545, 16, "bumper"), feature(60, 205, 15, "spikes")]),
    level("marble storm", { x: 52, y: 1335 }, { x: 270, y: 60 }, [wall(30, 1270, 174), wall(113, 1120, 175), wall(30, 975, 189), wall(98, 830, 190), wall(30, 680, 198), wall(121, 530, 167), wall(30, 370, 198), wall(116, 210, 172), wall(52, 980, WORLD.unit, 76), wall(252, 720, WORLD.unit, 70), wall(145, 531, WORLD.unit, 76), wall(228, 890, 62, 11, "half"), wall(20, 455, 60, 22, "rebound")], [{ x: 245, y: 1210, r: 14, axis: "x", span: 78, speed: 1.55 }, { x: 55, y: 740, r: 14, axis: "y", span: 75, speed: 1.35 }, { x: 245, y: 350, r: 14, axis: "x", span: 65, speed: 1.7 }], [{ x: 55, y: 1040 }, { x: 262, y: 575 }], 96, [feature(260, 1080, 20, "pit"), feature(56, 875, 18, "sticky"), feature(250, 600, 16, "bumper"), feature(55, 285, 16, "spikes"), feature(257, 440, 18, "ice")])
  ];
  function newRun(levelIndex = 0) {
    const l = LEVELS[levelIndex];
    return { levelIndex, marble: { ...l.start, vx: 0, vy: 0 }, enemies: l.enemies.map((e) => ({ ...e, origin: e[e.axis], direction: 1 })), powerups: l.powerups.map((p) => ({ ...p, collected: false })), remaining: l.time, lives: 3, status: "playing", airborne: 0, jumpCooldown: 0, jumpKind: null, superJumps: 0, lastDirection: { x: 0, y: -1 }, failure: null };
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
    const clearance = run2.jumpKind === "super" ? WORLD.unit * 3 : WORLD.unit;
    return run2.airborne > 0 && obstacle.h <= clearance;
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
  function requestJump(run2, useSuper = false) {
    if (run2.status !== "playing" || run2.airborne > 0 || run2.jumpCooldown > 0) return run2;
    const canSuper = useSuper && run2.superJumps > 0;
    const kind = canSuper ? "super" : "normal", distance = canSuper ? WORLD.unit * 3 : WORLD.unit;
    const d = run2.lastDirection;
    const marble = { ...run2.marble, x: Math.max(WORLD.marbleRadius, Math.min(WORLD.width - WORLD.marbleRadius, run2.marble.x + d.x * distance)), y: Math.max(WORLD.marbleRadius, Math.min(WORLD.height - WORLD.marbleRadius, run2.marble.y + d.y * distance)) };
    return { ...run2, marble, airborne: canSuper ? 0.62 : 0.38, jumpCooldown: 0.48, jumpKind: kind, superJumps: run2.superJumps - (canSuper ? 1 : 0) };
  }
  function step(run2, input2, dt) {
    if (run2.status !== "playing") return run2;
    const active = input2.jump ? requestJump(run2, input2.super) : run2, l = LEVELS[active.levelIndex], m = { ...active.marble };
    const terrain = l.features.find((f) => ["ice", "sticky"].includes(f.type) && circlesOverlap(m, WORLD.marbleRadius, f, f.r));
    const drag = (terrain == null ? void 0 : terrain.type) === "ice" ? 0.97 : (terrain == null ? void 0 : terrain.type) === "sticky" ? 0.65 : 0.89;
    m.vx = (m.vx + input2.x * 0.21 * dt * 60) * Math.pow(drag, dt * 60);
    m.vy = (m.vy + input2.y * 0.21 * dt * 60) * Math.pow(drag, dt * 60);
    const old = { ...m };
    m.x += m.vx * dt * 60;
    m.y += m.vy * dt * 60;
    const mag = Math.hypot(input2.x, input2.y), lastDirection = mag > 0.1 ? { x: input2.x / mag, y: input2.y / mag } : active.lastDirection;
    const enemies = moveEnemies(active.enemies, dt);
    const powerups = active.powerups.map((p) => !p.collected && circlesOverlap(m, WORLD.marbleRadius, p, 14) ? { ...p, collected: true } : p);
    const superJumps = active.superJumps + powerups.filter((p, i) => p.collected && !active.powerups[i].collected).length;
    let hitWall = m.x < WORLD.marbleRadius || m.x > WORLD.width - WORLD.marbleRadius || m.y < WORLD.marbleRadius || m.y > WORLD.height - WORLD.marbleRadius;
    for (const r of l.obstacles) {
      if (collisionAllowed(r, active) || !pointInExpandedRect(m, r, WORLD.marbleRadius)) continue;
      if (r.type === "rebound") {
        Object.assign(m, reflected(m, old, r));
      } else hitWall = true;
    }
    let pit = false, spikes = false;
    for (const f of l.features) {
      if (!circlesOverlap(m, WORLD.marbleRadius, f, f.r)) continue;
      if (f.type === "pit" && active.airborne <= 0) pit = true;
      if (f.type === "spikes" && active.airborne <= 0) spikes = true;
      if (f.type === "bumper" && active.airborne <= 0) {
        const dx = m.x - f.x, dy = m.y - f.y, len = Math.hypot(dx, dy) || 1;
        m.x = f.x + dx / len * (f.r + WORLD.marbleRadius + 1);
        m.y = f.y + dy / len * (f.r + WORLD.marbleRadius + 1);
        m.vx = dx / len * 3;
        m.vy = dy / len * 3;
      }
    }
    const hitEnemy = active.airborne <= 0 && enemies.some((e) => circlesOverlap(m, WORLD.marbleRadius, e, e.r));
    if (hitWall || pit || spikes || hitEnemy) return { ...active, lives: active.lives - 1, marble: { ...l.start, vx: 0, vy: 0 }, enemies, powerups, superJumps, lastDirection, status: active.lives <= 1 ? "lost" : "playing", failure: pit ? "fall" : failureFor(active), airborne: 0, jumpKind: null, jumpCooldown: 0 };
    if (circlesOverlap(m, WORLD.marbleRadius, l.goal, WORLD.goalRadius)) return { ...active, marble: m, enemies, powerups, superJumps, status: active.levelIndex === LEVELS.length - 1 ? "won" : "cleared" };
    const remaining = Math.max(0, active.remaining - dt), airborne = Math.max(0, active.airborne - dt);
    return { ...active, marble: m, enemies, powerups, superJumps, remaining, lastDirection, airborne, jumpCooldown: Math.max(0, active.jumpCooldown - dt), jumpKind: airborne > 0 ? active.jumpKind : null, status: remaining === 0 ? "lost" : "playing", failure: remaining === 0 ? failureFor(active) : active.failure };
  }
  function nextLevel(run2) {
    return newRun(Math.min(run2.levelIndex + 1, LEVELS.length - 1));
  }
  function cameraFor(run2, viewportHeight = VIEWPORT.height) {
    const look = run2.lastDirection.y < -0.15 ? CAMERA_LEAD.forward : run2.lastDirection.y > 0.15 ? CAMERA_LEAD.backward : CAMERA_LEAD.neutral;
    return Math.max(0, Math.min(WORLD.height - viewportHeight, run2.marble.y - viewportHeight / 2 + look));
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
  var input = { x: 0, y: 0, jump: false, super: false };
  var last = performance.now();
  var tiltActive = false;
  var manualPause = false;
  var menuOpen = false;
  var phase = "splash";
  var audioOn = true;
  var audio = null;
  var failUntil = 0;
  var keys = /* @__PURE__ */ new Set();
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
    } catch (e) {
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
    } catch (e) {
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
  function jump(superJump = false) {
    if (!playing()) return;
    input.jump = true;
    input.super = superJump;
    sound(superJump ? "super" : "jump");
  }
  addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      e.preventDefault();
      keys.add(e.key);
      updateKeyboard();
    }
    if (e.key === " ") {
      e.preventDefault();
      jump(e.shiftKey);
    }
    if (e.key === "Escape" && phase === "playing") {
      menuOpen = !menuOpen;
      syncMenu();
    }
  });
  addEventListener("keyup", (e) => {
    keys.delete(e.key);
    updateKeyboard();
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (!playing() || tiltActive) return;
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
    } catch (e) {
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
    input.x = clamp(e.gamma / 25, -1, 1);
    input.y = clamp(e.beta / 25, -1, 1);
  });
  function showPhase(next) {
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
    run = newRun();
    manualPause = false;
    showPhase("playing");
    music();
    resumeAudio();
    syncUI();
  }
  function syncMenu() {
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
  bounceButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jump(run.superJumps > 0);
    music();
  });
  tiltButton.onclick = enableTilt;
  $("#restart").onclick = () => {
    run = newRun();
    input.x = 0;
    input.y = 0;
    manualPause = false;
    notice.textContent = "";
    menuOpen = false;
    syncMenu();
    music();
  };
  $("#pause").onclick = () => {
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
    bounceButton.textContent = run.superJumps > 0 ? `super \xD7${run.superJumps}` : "bounce";
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
    const camera = cameraFor(run, VIEWPORT.height);
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
        circle(f.x, f.y, f.r + 3, "#c45bdb");
        circle(f.x, f.y, f.r, "#040308");
        circle(f.x - 5, f.y - 6, 2, "#86539d");
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
  }
  function frame(now) {
    const dt = Math.min(0.04, (now - last) / 1e3);
    last = now;
    const previous = run;
    if (playing() && run.status === "playing") {
      run = step(run, input, dt);
      input.jump = false;
      input.super = false;
    }
    if (run.failure && run.lives < previous.lives) {
      failUntil = now + 600;
      sound("hit");
      notice.textContent = `${run.failure}! try that lane again.`;
    }
    if (run.superJumps > previous.superJumps) {
      sound("pickup");
      notice.textContent = "super bounce charged";
    }
    if (phase === "playing" && run.status === "cleared") {
      notice.textContent = `level clear \xB7 ${LEVELS[run.levelIndex + 1].name}`;
      manualPause = true;
      sound("win");
      setTimeout(() => {
        run = nextLevel(run);
        manualPause = false;
        notice.textContent = "";
        resumeAudio();
      }, 900);
    } else if (run.status === "won") {
      notice.textContent = "all four long runs cleared";
      manualPause = true;
      sound("win");
    } else if (run.status === "lost") {
      notice.textContent = `${run.failure || "run"} ended \xB7 restart to try again`;
      manualPause = true;
    }
    syncUI();
    draw();
    requestAnimationFrame(frame);
  }
  showPhase("splash");
  syncUI();
  requestAnimationFrame(frame);
})();
