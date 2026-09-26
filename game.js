// The physical R1 display is 240×282. Rendering scales this logical viewport only; the world remains larger and scrolls beneath it.
export const VIEWPORT = { width: 320, height: 376, physicalWidth: 240, physicalHeight: 282 };
export const WORLD = { width: 320, height: 1400, marbleRadius: 12, goalRadius: 19, unit: 22 };
export const BOUNCE = { holdMs: 400, quickUnits: 1, longUnits: 3, airborneSeconds: .38, cooldownSeconds: .48 };
export const DIFFICULTIES = ["beginner", "standard", "pro"];
export const CAMERA_LEAD = { forward: 38, backward: -24, neutral: 0 };
const wall = (x, y, w, h = WORLD.unit, type = "wall") => ({ x, y, w, h, type });
const feature = (x, y, r, type) => ({ x, y, r, type });
// Alternating gate bars seal the exterior bypass, but leave generous opposite-side openings.
// The gaps demand crossing the board; neither outer wall has to hurt to enforce a route.
function sealGates(obstacles){let side=0;return obstacles.map(o=>{if(o.h!==WORLD.unit||o.w<160)return o;const r=side++%2===0?{...o,x:0,w:o.x+o.w}:{...o,w:WORLD.width-o.x};return r;});}
const level = (name, start, goal, obstacles, enemies, powerups, time, features = [], bombs = []) => ({ name, start, goal, obstacles:sealGates(obstacles), enemies, powerups, time, features, bombs });
export const BOMB = { triggerRadius: 25, fuseSeconds: .85, blastRadius: 42, blastSeconds: .22 };
export const LEVELS = [
  level('first roll', { x: 54, y: 1334 }, { x: 267, y: 66 }, [wall(30,1210,185),wall(125,1018,165),wall(30,835,208),wall(96,640,194),wall(30,450,205),wall(150,255,140),wall(220,950,58,11,"half"),wall(22,680,54,22,"rebound")], [], [{x:266,y:1075}], 75, [feature(262,790,18,"pit"),feature(55,550,18,"ice"),feature(260,680,22,"sand"),feature(55,360,21,"merry")], [feature(158,1148,12,"bomb"),feature(171,576,12,"bomb")]),
  level('switchback', { x: 52, y: 1335 }, { x: 270, y: 62 }, [wall(30,1245,210),wall(82,1085,206),wall(30,925,200),wall(105,760,184),wall(30,590,205),wall(110,410,178),wall(30,225,188),wall(202,925,WORLD.unit,88),wall(28,700,65,11,"half"),wall(245,480,50,22,"rebound")], [{x:264,y:1150,r:14,axis:'y',span:74,speed:.9}], [{x:54,y:700}], 82, [feature(260,1030,19,"pit"),feature(55,515,18,"sticky"),feature(255,320,15,"bumper"),feature(55,825,22,"sand"),feature(258,250,21,"merry")], [feature(159,1170,12,"bomb"),feature(160,665,12,"bomb")]),
  level('crossfire', { x: 52, y: 1335 }, { x: 269, y: 60 }, [wall(30,1260,215),wall(90,1100,198),wall(30,940,202),wall(95,780,193),wall(30,620,201),wall(104,455,185),wall(30,290,195),wall(145,941,WORLD.unit,76),wall(62,620,WORLD.unit,66),wall(225,700,64,11,"half"),wall(22,375,56,22,"rebound")], [{x:258,y:1180,r:14,axis:'y',span:68,speed:1.2},{x:225,y:520,r:14,axis:'x',span:45,speed:1.05}], [{x:262,y:860},{x:56,y:350}], 88, [feature(262,1050,20,"pit"),feature(58,845,18,"ice"),feature(250,545,16,"bumper"),feature(60,205,15,"spikes"),feature(256,870,22,"sand"),feature(57,440,21,"merry")], [feature(153,1188,12,"bomb"),feature(159,690,12,"bomb"),feature(166,368,12,"bomb")]),
  level('marble storm', { x: 52, y: 1335 }, { x: 270, y: 60 }, [wall(30,1270,174),wall(113,1120,175),wall(30,975,189),wall(98,830,190),wall(30,680,198),wall(121,530,167),wall(30,370,198),wall(116,210,172),wall(52,980,WORLD.unit,76),wall(252,720,WORLD.unit,70),wall(145,531,WORLD.unit,76),wall(228,890,62,11,"half"),wall(20,455,60,22,"rebound")], [{x:245,y:1160,r:14,axis:'x',span:35,speed:1.55},{x:55,y:740,r:14,axis:'y',span:75,speed:1.35},{x:55,y:350,r:14,axis:'x',span:30,speed:1.7}], [{x:55,y:1040},{x:262,y:575}], 96, [feature(260,1080,20,"pit"),feature(56,875,18,"sticky"),feature(250,600,16,"bumper"),feature(55,285,16,"spikes"),feature(257,440,18,"ice"),feature(256,965,22,"sand"),feature(55,620,21,"merry")], [feature(255,1150,12,"bomb"),feature(160,746,12,"bomb"),feature(55,470,12,"bomb")])
];
export function newRun(levelIndex = 0, difficulty = 'standard') {
  if (!DIFFICULTIES.includes(difficulty)) throw Error('unknown difficulty');
  const l = LEVELS[levelIndex];
  return { levelIndex, difficulty, marble:{...l.start,vx:0,vy:0}, enemies:l.enemies.map(e=>({...e,origin:e[e.axis],direction:1})), powerups:l.powerups.map(p=>({...p,collected:false})), bombs:l.bombs.map(b=>({...b,phase:'idle',time:0})), remaining:l.time,lives:3,status:'playing',airborne:0,jumpCooldown:0,jumpKind:null,superJumps:0,lastDirection:{x:0,y:-1},failure:null,dizzy:0,terrain:null,gravity:false };
}
export function circlesOverlap(a,ar,b,br){return Math.hypot(a.x-b.x,a.y-b.y)<ar+br;}
export function pointInExpandedRect(p,r,pad){return p.x>r.x-pad&&p.x<r.x+r.w+pad&&p.y>r.y-pad&&p.y<r.y+r.h+pad;}
export function moveEnemies(enemies,dt){return enemies.map(e=>{const n={...e};n[e.axis]+=n.direction*n.speed*dt*60;if(Math.abs(n[e.axis]-n.origin)>n.span){n.direction*=-1;n[e.axis]=n.origin+Math.sign(n[e.axis]-n.origin)*n.span}return n})}
function failureFor(run){return ['explode','crumble','melt'][(run.levelIndex+run.lives)%3];}
function collisionAllowed(obstacle, run){return run.airborne>0&&obstacle.h<=WORLD.unit;}
function reflected(m,old,obstacle){const n={...m};if(old.x+WORLD.marbleRadius<=obstacle.x||old.x-WORLD.marbleRadius>=obstacle.x+obstacle.w){n.x=old.x;n.vx=-m.vx*.82;}else{n.y=old.y;n.vy=-m.vy*.82;}return n;}
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
// A board unit is 22 logical world pixels, not a CSS or physical-screen pixel.
// A jump is an instantaneous, swept translation: no wall, pit or edge may be skipped.
export function requestJump(run, heldMs = 0){
  if(run.status!=='playing'||run.airborne>0||run.jumpCooldown>0)return run;
  const charged=run.superJumps>0,units=(heldMs>=BOUNCE.holdMs?BOUNCE.longUnits:BOUNCE.quickUnits)*(charged?2:1);
  const d=run.lastDirection, origin=run.marble, end={x:origin.x+d.x*units*WORLD.unit,y:origin.y+d.y*units*WORLD.unit};
  const l=LEVELS[run.levelIndex]; let destination={...origin};
  // Step no more than 1/4 radius per sample, preventing tunneling across even a thin wall.
  const samples=Math.ceil(units*WORLD.unit/3);
  for(let i=1;i<=samples;i++){
    const p={x:origin.x+(end.x-origin.x)*i/samples,y:origin.y+(end.y-origin.y)*i/samples};
    if(p.x<WORLD.marbleRadius||p.x>WORLD.width-WORLD.marbleRadius||p.y<WORLD.marbleRadius||p.y>WORLD.height-WORLD.marbleRadius)break;
    if(l.obstacles.some(r=>r.h>WORLD.unit&&pointInExpandedRect(p,r,WORLD.marbleRadius)))break;
    if(l.enemies.some(e=>circlesOverlap(p,WORLD.marbleRadius,e,e.r)))break;
    destination={...origin,x:p.x,y:p.y};
  }
  if(destination.x===origin.x&&destination.y===origin.y)return run;
  return {...run,marble:destination,airborne:BOUNCE.airborneSeconds,jumpCooldown:BOUNCE.cooldownSeconds,jumpKind:charged?'super':'normal',superJumps:run.superJumps-(charged?1:0)};
}
export function step(run,input,dt){
  if(run.status!=='playing')return run;
  const l=LEVELS[run.levelIndex],m={...run.marble};
  const terrain=l.features.find(f=>['ice','sticky','sand','merry'].includes(f.type)&&circlesOverlap(m,WORLD.marbleRadius,f,f.r));
  const drag=terrain?.type==='ice'?.97:terrain?.type==='sticky'?.65:terrain?.type==='sand'?.55:.89;
  const dizzy=Math.max(0,run.dizzy-dt), onMerry=terrain?.type==='merry'&&run.airborne<=0;
  const steer=onMerry||dizzy>0?{x:input.y,y:-input.x}:input;
  let gx=0,gy=0,gravity=false;
  if(run.difficulty!=='beginner'&&run.airborne<=0)for(const f of l.features){if(f.type!=='pit')continue;const dx=f.x-m.x,dy=f.y-m.y,dist=Math.hypot(dx,dy)||1,reach=f.r+75;
    if(dist<reach){gravity=true;const force=(run.difficulty==='pro'?2:1)*.105*(1-dist/reach);gx+=dx/dist*force;gy+=dy/dist*force;}
  }
  const steering=1;
  m.vx=(m.vx+steer.x*.21*steering*dt*60+gx*dt*60)*Math.pow(drag,dt*60);
  m.vy=(m.vy+steer.y*.21*steering*dt*60+gy*dt*60)*Math.pow(drag,dt*60);
  const old={...m};m.x+=m.vx*dt*60;m.y+=m.vy*dt*60;
  const mag=Math.hypot(input.x,input.y),lastDirection=mag>.1?{x:input.x/mag,y:input.y/mag}:run.lastDirection;
  const enemies=moveEnemies(run.enemies,dt);
  let hitWall=false,exterior=false;
  if(m.x<WORLD.marbleRadius||m.x>WORLD.width-WORLD.marbleRadius||m.y<WORLD.marbleRadius||m.y>WORLD.height-WORLD.marbleRadius){
    exterior=true;const hitX=m.x<WORLD.marbleRadius||m.x>WORLD.width-WORLD.marbleRadius,hitY=m.y<WORLD.marbleRadius||m.y>WORLD.height-WORLD.marbleRadius;m.x=clamp(m.x,WORLD.marbleRadius,WORLD.width-WORLD.marbleRadius);m.y=clamp(m.y,WORLD.marbleRadius,WORLD.height-WORLD.marbleRadius);
    if(run.difficulty==='pro')hitWall=true;
    else if(run.difficulty==='standard'){if(hitX)m.vx=-m.vx*1.3;if(hitY)m.vy=-m.vy*1.3;}
    else {m.vx=0;m.vy=0;}
  }
  for(const r of l.obstacles){if(collisionAllowed(r,run)||!pointInExpandedRect(m,r,WORLD.marbleRadius))continue;
    if(r.type==='rebound'){Object.assign(m,reflected(m,old,r));}else hitWall=true;
  }
  let pit=false,spikes=false;
  for(const f of l.features){if(!circlesOverlap(m,WORLD.marbleRadius,f,f.r))continue;
    if(f.type==='pit'&&run.difficulty!=='beginner'&&run.airborne<=0)pit=true;
    if(f.type==='spikes'&&run.airborne<=0)spikes=true;
    if(f.type==='bumper'&&run.airborne<=0){const dx=m.x-f.x,dy=m.y-f.y,len=Math.hypot(dx,dy)||1;m.x=f.x+dx/len*(f.r+WORLD.marbleRadius+1);m.y=f.y+dy/len*(f.r+WORLD.marbleRadius+1);m.vx=dx/len*3;m.vy=dy/len*3;}
  }
  // Bombs arm on grounded proximity. They warn before a radial blast, then remain spent
  // until the next life or board; airborne marbles can clear both trigger and blast.
  const bombs=run.bombs.map(b=>{
    if(b.phase==='idle'&&run.airborne<=0&&circlesOverlap(m,WORLD.marbleRadius,b,BOMB.triggerRadius))return {...b,phase:'fuse',time:BOMB.fuseSeconds};
    if(b.phase==='fuse'){const time=b.time-dt;return time<=0?{...b,phase:'blast',time:BOMB.blastSeconds}:{...b,time};}
    if(b.phase==='blast'){const time=b.time-dt;return time<=0?{...b,phase:'spent',time:0}:{...b,time};}
    return b;
  });
  const bombHit=run.airborne<=0&&bombs.some(b=>b.phase==='blast'&&circlesOverlap(m,WORLD.marbleRadius,b,BOMB.blastRadius));
  const powerups=run.powerups.map(p=>!p.collected&&circlesOverlap(m,WORLD.marbleRadius,p,14)?{...p,collected:true}:p);
  const superJumps=run.superJumps+powerups.filter((p,i)=>p.collected&&!run.powerups[i].collected).length;
  const hitEnemy=run.airborne<=0&&enemies.some(e=>circlesOverlap(m,WORLD.marbleRadius,e,e.r));
  if((hitWall||pit||spikes||hitEnemy||bombHit)&&(onMerry||dizzy>0))return {...run,marble:{...l.start,vx:0,vy:0},enemies,powerups,bombs,superJumps,lastDirection,airborne:0,jumpKind:null,dizzy:0,terrain:null,gravity:false};
  if(hitWall||pit||spikes||hitEnemy||bombHit)return {...run,lives:run.lives-1,marble:{...l.start,vx:0,vy:0},enemies,powerups,bombs:l.bombs.map(b=>({...b,phase:'idle',time:0})),superJumps,lastDirection,status:run.lives<=1?'lost':'playing',failure:bombHit?'explode':pit?'fall':exterior?'spikes':failureFor(run),airborne:0,jumpKind:null,jumpCooldown:0,dizzy:0,terrain:null,gravity:false};
  if(circlesOverlap(m,WORLD.marbleRadius,l.goal,WORLD.goalRadius))return {...run,marble:m,enemies,powerups,bombs,superJumps,status:run.levelIndex===LEVELS.length-1?'won':'cleared'};
  const remaining=Math.max(0,run.remaining-dt),airborne=Math.max(0,run.airborne-dt);
  return {...run,marble:m,enemies,powerups,bombs,superJumps,remaining,lastDirection,airborne,jumpCooldown:Math.max(0,run.jumpCooldown-dt),jumpKind:airborne>0?run.jumpKind:null,status:remaining===0?'lost':'playing',failure:remaining===0?failureFor(run):run.failure,dizzy:onMerry?Math.max(dizzy,.75):dizzy,terrain:terrain?.type||null,gravity};
}
export function nextLevel(run){return newRun(Math.min(run.levelIndex+1,LEVELS.length-1),run.difficulty);}
export function cameraFor(run, viewportHeight=VIEWPORT.height){const look=run.lastDirection.y<-.15?CAMERA_LEAD.forward:run.lastDirection.y>.15?CAMERA_LEAD.backward:CAMERA_LEAD.neutral;return Math.max(0,Math.min(WORLD.height-viewportHeight,run.marble.y-viewportHeight/2+look));}
export function smoothCamera(current,target,dt){return current+(target-current)*(1-Math.exp(-9*Math.max(0,dt)));}
