// The physical R1 display is 240×282. Rendering scales this logical viewport only; the world remains larger and scrolls beneath it.
export const VIEWPORT = { width: 320, height: 376, physicalWidth: 240, physicalHeight: 282 };
export const WORLD = { width: 320, height: 1400, marbleRadius: 12, goalRadius: 19, unit: 22 };
export const CAMERA_LEAD = { forward: 38, backward: -24, neutral: 0 };
const wall = (x, y, w, h = WORLD.unit, type = "wall") => ({ x, y, w, h, type });
const feature = (x, y, r, type) => ({ x, y, r, type });
const level = (name, start, goal, obstacles, enemies, powerups, time, features = []) => ({ name, start, goal, obstacles, enemies, powerups, time, features });
export const LEVELS = [
  level('first roll', { x: 54, y: 1334 }, { x: 267, y: 66 }, [wall(30,1210,185),wall(125,1018,165),wall(30,835,208),wall(96,640,194),wall(30,450,205),wall(150,255,140),wall(220,950,58,11,"half"),wall(22,680,54,22,"rebound")], [], [{x:266,y:1075}], 75, [feature(262,790,18,"pit"),feature(55,550,18,"ice")]),
  level('switchback', { x: 52, y: 1335 }, { x: 270, y: 62 }, [wall(30,1245,210),wall(82,1085,206),wall(30,925,200),wall(105,760,184),wall(30,590,205),wall(110,410,178),wall(30,225,188),wall(202,925,WORLD.unit,88),wall(28,700,65,11,"half"),wall(245,480,50,22,"rebound")], [{x:264,y:1150,r:14,axis:'y',span:74,speed:.9}], [{x:54,y:700}], 82, [feature(260,1030,19,"pit"),feature(55,515,18,"sticky"),feature(255,320,15,"bumper")]),
  level('crossfire', { x: 52, y: 1335 }, { x: 269, y: 60 }, [wall(30,1260,215),wall(90,1100,198),wall(30,940,202),wall(95,780,193),wall(30,620,201),wall(104,455,185),wall(30,290,195),wall(145,941,WORLD.unit,76),wall(62,620,WORLD.unit,66),wall(225,700,64,11,"half"),wall(22,375,56,22,"rebound")], [{x:258,y:1180,r:14,axis:'y',span:68,speed:1.2},{x:65,y:520,r:14,axis:'x',span:55,speed:1.05}], [{x:262,y:860},{x:56,y:350}], 88, [feature(262,1050,20,"pit"),feature(58,845,18,"ice"),feature(250,545,16,"bumper"),feature(60,205,15,"spikes")]),
  level('marble storm', { x: 52, y: 1335 }, { x: 270, y: 60 }, [wall(30,1270,174),wall(113,1120,175),wall(30,975,189),wall(98,830,190),wall(30,680,198),wall(121,530,167),wall(30,370,198),wall(116,210,172),wall(52,980,WORLD.unit,76),wall(252,720,WORLD.unit,70),wall(145,531,WORLD.unit,76),wall(228,890,62,11,"half"),wall(20,455,60,22,"rebound")], [{x:245,y:1210,r:14,axis:'x',span:78,speed:1.55},{x:55,y:740,r:14,axis:'y',span:75,speed:1.35},{x:245,y:350,r:14,axis:'x',span:65,speed:1.7}], [{x:55,y:1040},{x:262,y:575}], 96, [feature(260,1080,20,"pit"),feature(56,875,18,"sticky"),feature(250,600,16,"bumper"),feature(55,285,16,"spikes"),feature(257,440,18,"ice")])
];
export function newRun(levelIndex = 0) { const l = LEVELS[levelIndex]; return { levelIndex, marble:{...l.start,vx:0,vy:0}, enemies:l.enemies.map(e=>({...e,origin:e[e.axis],direction:1})), powerups:l.powerups.map(p=>({...p,collected:false})), remaining:l.time,lives:3,status:'playing',airborne:0,jumpCooldown:0,jumpKind:null,superJumps:0,lastDirection:{x:0,y:-1},failure:null }; }
export function circlesOverlap(a,ar,b,br){return Math.hypot(a.x-b.x,a.y-b.y)<ar+br;}
export function pointInExpandedRect(p,r,pad){return p.x>r.x-pad&&p.x<r.x+r.w+pad&&p.y>r.y-pad&&p.y<r.y+r.h+pad;}
export function moveEnemies(enemies,dt){return enemies.map(e=>{const n={...e};n[e.axis]+=n.direction*n.speed*dt*60;if(Math.abs(n[e.axis]-n.origin)>n.span){n.direction*=-1;n[e.axis]=n.origin+Math.sign(n[e.axis]-n.origin)*n.span}return n})}
function failureFor(run){return ['explode','crumble','melt'][(run.levelIndex+run.lives)%3];}
function collisionAllowed(obstacle, run){const clearance=run.jumpKind==='super'?WORLD.unit*3:WORLD.unit;return run.airborne>0&&obstacle.h<=clearance;}
function reflected(m,old,obstacle){const n={...m};if(old.x+WORLD.marbleRadius<=obstacle.x||old.x-WORLD.marbleRadius>=obstacle.x+obstacle.w){n.x=old.x;n.vx=-m.vx*.82;}else{n.y=old.y;n.vy=-m.vy*.82;}return n;}
export function requestJump(run, useSuper=false){if(run.status!=='playing'||run.airborne>0||run.jumpCooldown>0)return run;const canSuper=useSuper&&run.superJumps>0;const kind=canSuper?'super':'normal',distance=canSuper?WORLD.unit*3:WORLD.unit;const d=run.lastDirection;const marble={...run.marble,x:Math.max(WORLD.marbleRadius,Math.min(WORLD.width-WORLD.marbleRadius,run.marble.x+d.x*distance)),y:Math.max(WORLD.marbleRadius,Math.min(WORLD.height-WORLD.marbleRadius,run.marble.y+d.y*distance))};return {...run,marble,airborne:canSuper?.62:.38,jumpCooldown:.48,jumpKind:kind,superJumps:run.superJumps-(canSuper?1:0)};}
export function step(run,input,dt){
  if(run.status!=='playing')return run;
  const active=input.jump?requestJump(run,input.super):run,l=LEVELS[active.levelIndex],m={...active.marble};
  const terrain=l.features.find(f=>['ice','sticky'].includes(f.type)&&circlesOverlap(m,WORLD.marbleRadius,f,f.r));
  const drag=terrain?.type==='ice'?.97:terrain?.type==='sticky'?.65:.89;
  m.vx=(m.vx+input.x*.21*dt*60)*Math.pow(drag,dt*60);
  m.vy=(m.vy+input.y*.21*dt*60)*Math.pow(drag,dt*60);
  const old={...m};m.x+=m.vx*dt*60;m.y+=m.vy*dt*60;
  const mag=Math.hypot(input.x,input.y),lastDirection=mag>.1?{x:input.x/mag,y:input.y/mag}:active.lastDirection;
  const enemies=moveEnemies(active.enemies,dt);
  const powerups=active.powerups.map(p=>!p.collected&&circlesOverlap(m,WORLD.marbleRadius,p,14)?{...p,collected:true}:p);
  const superJumps=active.superJumps+powerups.filter((p,i)=>p.collected&&!active.powerups[i].collected).length;
  let hitWall=m.x<WORLD.marbleRadius||m.x>WORLD.width-WORLD.marbleRadius||m.y<WORLD.marbleRadius||m.y>WORLD.height-WORLD.marbleRadius;
  for(const r of l.obstacles){if(collisionAllowed(r,active)||!pointInExpandedRect(m,r,WORLD.marbleRadius))continue;
    if(r.type==='rebound'){Object.assign(m,reflected(m,old,r));}else hitWall=true;
  }
  let pit=false,spikes=false;
  for(const f of l.features){if(!circlesOverlap(m,WORLD.marbleRadius,f,f.r))continue;
    if(f.type==='pit'&&active.airborne<=0)pit=true;
    if(f.type==='spikes'&&active.airborne<=0)spikes=true;
    if(f.type==='bumper'&&active.airborne<=0){const dx=m.x-f.x,dy=m.y-f.y,len=Math.hypot(dx,dy)||1;m.x=f.x+dx/len*(f.r+WORLD.marbleRadius+1);m.y=f.y+dy/len*(f.r+WORLD.marbleRadius+1);m.vx=dx/len*3;m.vy=dy/len*3;}
  }
  const hitEnemy=active.airborne<=0&&enemies.some(e=>circlesOverlap(m,WORLD.marbleRadius,e,e.r));
  if(hitWall||pit||spikes||hitEnemy)return {...active,lives:active.lives-1,marble:{...l.start,vx:0,vy:0},enemies,powerups,superJumps,lastDirection,status:active.lives<=1?'lost':'playing',failure:pit?'fall':failureFor(active),airborne:0,jumpKind:null,jumpCooldown:0};
  if(circlesOverlap(m,WORLD.marbleRadius,l.goal,WORLD.goalRadius))return {...active,marble:m,enemies,powerups,superJumps,status:active.levelIndex===LEVELS.length-1?'won':'cleared'};
  const remaining=Math.max(0,active.remaining-dt),airborne=Math.max(0,active.airborne-dt);
  return {...active,marble:m,enemies,powerups,superJumps,remaining,lastDirection,airborne,jumpCooldown:Math.max(0,active.jumpCooldown-dt),jumpKind:airborne>0?active.jumpKind:null,status:remaining===0?'lost':'playing',failure:remaining===0?failureFor(active):active.failure};
}
export function nextLevel(run){return newRun(Math.min(run.levelIndex+1,LEVELS.length-1));}
export function cameraFor(run, viewportHeight=VIEWPORT.height){const look=run.lastDirection.y<-.15?CAMERA_LEAD.forward:run.lastDirection.y>.15?CAMERA_LEAD.backward:CAMERA_LEAD.neutral;return Math.max(0,Math.min(WORLD.height-viewportHeight,run.marble.y-viewportHeight/2+look));}
