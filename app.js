import { WORLD, LEVELS, newRun, nextLevel, step } from './game.js';
const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const levelText = document.querySelector('#level'), livesText = document.querySelector('#lives'), timerText = document.querySelector('#timer'), notice = document.querySelector('#notice');
let run = newRun(), input = { x: 0, y: 0 }, last = performance.now(), tiltActive = false, paused = false;
const keys = new Set();
function updateKeyboard(){ input.x = (keys.has('ArrowRight')||keys.has('d')?1:0) - (keys.has('ArrowLeft')||keys.has('a')?1:0); input.y = (keys.has('ArrowDown')||keys.has('s')?1:0) - (keys.has('ArrowUp')||keys.has('w')?1:0); }
addEventListener('keydown', e => { if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);updateKeyboard();} if(e.key===' '){ paused=!paused; syncUI(); }});
addEventListener('keyup', e => { keys.delete(e.key); updateKeyboard(); });
canvas.addEventListener('pointerdown', e => { const r=canvas.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*WORLD.width, y=(e.clientY-r.top)/r.height*WORLD.height; input={x:Math.abs(x-160)>Math.abs(y-260)?Math.sign(x-160):0,y:Math.abs(y-260)>=Math.abs(x-160)?Math.sign(y-260):0}; });
canvas.addEventListener('pointerup',()=>{if(!tiltActive)input={x:0,y:0};});
async function enableTilt(){
  try { if(typeof DeviceOrientationEvent==='undefined') throw new Error('not available'); if(typeof DeviceOrientationEvent.requestPermission==='function' && await DeviceOrientationEvent.requestPermission()!=='granted') throw new Error('not permitted'); tiltActive=true; document.querySelector('#tilt').textContent='tilt on'; }
  catch { tiltActive=false; notice.textContent='tilt unavailable — use arrows, WASD, or board edges'; }
}
addEventListener('deviceorientation', e => { if(!tiltActive || e.gamma == null || e.beta == null) return; input.x=Math.max(-1,Math.min(1,e.gamma/25)); input.y=Math.max(-1,Math.min(1,e.beta/25)); });
document.querySelector('#tilt').onclick=enableTilt;
document.querySelector('#restart').onclick=()=>{run=newRun(run.levelIndex);paused=false;notice.textContent='';syncUI();};
document.querySelector('#pause').onclick=()=>{paused=!paused;syncUI();};
document.querySelector('#theme').onclick=()=>{const light=document.documentElement.dataset.theme==='light';document.documentElement.dataset.theme=light?'dark':'light';document.querySelector('#theme').textContent=light?'☾':'☀';};
document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
function syncUI(){ const level=LEVELS[run.levelIndex]; levelText.textContent=`level ${String(run.levelIndex+1).padStart(2,'0')} / ${level.name}`;livesText.textContent='● '.repeat(run.lives).trim()||'—';timerText.textContent=run.remaining.toFixed(1);document.querySelector('#pause').textContent=paused?'resume':'pause'; }
function draw(){const cs=getComputedStyle(document.documentElement), bg=cs.getPropertyValue('--board'), line=cs.getPropertyValue('--line'), accent=cs.getPropertyValue('--accent'), text=cs.getPropertyValue('--text'), danger=cs.getPropertyValue('--danger');ctx.fillStyle=bg;ctx.fillRect(0,0,320,520);ctx.strokeStyle=line;ctx.lineWidth=1;for(let i=20;i<320;i+=20){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,520);ctx.stroke()}for(let i=20;i<520;i+=20){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(320,i);ctx.stroke()}
const level=LEVELS[run.levelIndex];ctx.fillStyle=text;level.obstacles.forEach(r=>ctx.fillRect(r.x,r.y,r.w,r.h));ctx.fillStyle=accent;ctx.beginPath();ctx.arc(level.goal.x,level.goal.y,WORLD.goalRadius,0,Math.PI*2);ctx.fill();ctx.fillStyle=danger;run.enemies.forEach(e=>{ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill()});const g=ctx.createRadialGradient(run.marble.x-4,run.marble.y-5,2,run.marble.x,run.marble.y,13);g.addColorStop(0,'#fff');g.addColorStop(.35,'#b9c3cc');g.addColorStop(1,'#33404a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(run.marble.x,run.marble.y,WORLD.marbleRadius,0,Math.PI*2);ctx.fill();}
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(!paused&&run.status==='playing')run=step(run,input,dt);if(run.status==='cleared'){notice.textContent=`level clear · ${LEVELS[run.levelIndex+1].name}`;paused=true;setTimeout(()=>{run=nextLevel(run);paused=false;notice.textContent=''},900)}else if(run.status==='won'){notice.textContent='all four mazes cleared';paused=true}else if(run.status==='lost'){notice.textContent='run ended · restart to try again';paused=true}syncUI();draw();requestAnimationFrame(frame)}syncUI();requestAnimationFrame(frame);
