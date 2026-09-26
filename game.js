export const WORLD = { width: 320, height: 520, marbleRadius: 12, goalRadius: 19 };

export const LEVELS = [
  { name: 'first roll', start: { x: 54, y: 462 }, goal: { x: 267, y: 58 }, obstacles: [
    { x: 32, y: 330, w: 180, h: 18 }, { x: 144, y: 174, w: 144, h: 18 }
  ], enemies: [], time: 50 },
  { name: 'switchback', start: { x: 52, y: 465 }, goal: { x: 271, y: 54 }, obstacles: [
    { x: 31, y: 396, w: 208, h: 18 }, { x: 81, y: 278, w: 207, h: 18 },
    { x: 31, y: 157, w: 200, h: 18 }, { x: 202, y: 90, w: 18, h: 86 }
  ], enemies: [{ x: 264, y: 342, r: 14, axis: 'y', span: 80, speed: 0.85 }], time: 55 },
  { name: 'crossfire', start: { x: 52, y: 465 }, goal: { x: 269, y: 52 }, obstacles: [
    { x: 31, y: 421, w: 215, h: 18 }, { x: 90, y: 331, w: 198, h: 18 },
    { x: 31, y: 238, w: 199, h: 18 }, { x: 91, y: 143, w: 197, h: 18 },
    { x: 31, y: 68, w: 159, h: 18 }, { x: 145, y: 255, w: 18, h: 76 }
  ], enemies: [{ x: 258, y: 374, r: 14, axis: 'y', span: 68, speed: 1.2 }, { x: 65, y: 200, r: 14, axis: 'x', span: 55, speed: 1.05 }], time: 60 },
  { name: 'marble storm', start: { x: 52, y: 465 }, goal: { x: 270, y: 52 }, obstacles: [
    { x: 31, y: 431, w: 174, h: 18 }, { x: 113, y: 365, w: 175, h: 18 },
    { x: 31, y: 298, w: 189, h: 18 }, { x: 98, y: 230, w: 190, h: 18 },
    { x: 31, y: 162, w: 198, h: 18 }, { x: 121, y: 93, w: 167, h: 18 },
    { x: 52, y: 315, w: 18, h: 76 }, { x: 252, y: 177, w: 18, h: 70 }
  ], enemies: [{ x: 245, y: 404, r: 14, axis: 'x', span: 78, speed: 1.55 }, { x: 55, y: 265, r: 14, axis: 'y', span: 75, speed: 1.35 }, { x: 245, y: 120, r: 14, axis: 'x', span: 65, speed: 1.7 }], time: 65 }
];

export function newRun(levelIndex = 0) {
  const level = LEVELS[levelIndex];
  return { levelIndex, marble: { ...level.start, vx: 0, vy: 0 }, enemies: level.enemies.map(e => ({ ...e, origin: e[e.axis], direction: 1 })), remaining: level.time, lives: 3, status: 'playing' };
}
export function circlesOverlap(a, ar, b, br) { return Math.hypot(a.x - b.x, a.y - b.y) < ar + br; }
export function pointInExpandedRect(point, r, padding) { return point.x > r.x - padding && point.x < r.x + r.w + padding && point.y > r.y - padding && point.y < r.y + r.h + padding; }
export function moveEnemies(enemies, dt) { return enemies.map(e => { const next = { ...e }; next[e.axis] += e.direction * e.speed * dt * 60; if (Math.abs(next[e.axis] - next.origin) > next.span) { next.direction *= -1; next[e.axis] = next.origin + Math.sign(next[e.axis] - next.origin) * next.span; } return next; }); }
export function step(run, input, dt) {
  if (run.status !== 'playing') return run;
  const level = LEVELS[run.levelIndex], m = { ...run.marble };
  m.vx = (m.vx + input.x * 0.21 * dt * 60) * Math.pow(.89, dt * 60);
  m.vy = (m.vy + input.y * 0.21 * dt * 60) * Math.pow(.89, dt * 60);
  m.x += m.vx * dt * 60; m.y += m.vy * dt * 60;
  let collided = m.x < WORLD.marbleRadius || m.x > WORLD.width - WORLD.marbleRadius || m.y < WORLD.marbleRadius || m.y > WORLD.height - WORLD.marbleRadius || level.obstacles.some(r => pointInExpandedRect(m, r, WORLD.marbleRadius));
  const enemies = moveEnemies(run.enemies, dt);
  collided ||= enemies.some(e => circlesOverlap(m, WORLD.marbleRadius, e, e.r));
  if (collided) return { ...run, lives: run.lives - 1, marble: { ...level.start, vx: 0, vy: 0 }, enemies, status: run.lives <= 1 ? 'lost' : 'playing' };
  if (circlesOverlap(m, WORLD.marbleRadius, level.goal, WORLD.goalRadius)) return { ...run, marble: m, enemies, status: run.levelIndex === LEVELS.length - 1 ? 'won' : 'cleared' };
  const remaining = Math.max(0, run.remaining - dt);
  return { ...run, marble: m, enemies, remaining, status: remaining === 0 ? 'lost' : 'playing' };
}
export function nextLevel(run) { return newRun(Math.min(run.levelIndex + 1, LEVELS.length - 1)); }
