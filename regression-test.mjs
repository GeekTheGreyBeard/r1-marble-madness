import assert from 'node:assert/strict';import fs from 'node:fs';
import {LEVELS,DIFFICULTIES,newRun,step,requestJump,nextLevel,BOUNCE,BOMB,WORLD,VIEWPORT} from './game.js';
assert.equal(VIEWPORT.physicalWidth,240);assert.equal(VIEWPORT.physicalHeight,282);
const l=LEVELS[0],at=(x,y,extra={})=>({...newRun(),...extra,marble:{x,y,vx:0,vy:0}});
for(const d of DIFFICULTIES){let r=newRun(0,d);assert.equal(nextLevel(r).difficulty,d);assert.equal(step({...r,marble:{x:5,y:100,vx:-2,vy:0}},{x:0,y:0},1/60).lives,d==='pro'?2:3);const p=l.features.find(f=>f.type==='pit');assert.equal(step({...r,marble:{x:p.x,y:p.y,vx:0,vy:0}},{x:0,y:0},0).lives,d==='beginner'?3:2);}
assert.ok(step(newRun(),{x:0,y:-1},1/60).marble.y<l.start.y);
for(const [held,charge,units] of [[0,0,1],[BOUNCE.holdMs,0,3],[0,1,2],[BOUNCE.holdMs,1,6]]){const r={...newRun(),superJumps:charge};const j=requestJump(r,held);assert.equal(Math.round(r.marble.y-j.marble.y),WORLD.unit*units)}
let dizzy=step(at(l.features.find(f=>f.type==='merry').x,l.features.find(f=>f.type==='merry').y),{x:1,y:0},1/60);assert.ok(dizzy.dizzy>0);const crash=step({...dizzy,marble:{x:l.obstacles[0].x+20,y:l.obstacles[0].y+5,vx:0,vy:0}},{x:0,y:0},0);assert.equal(crash.lives,3);assert.equal(crash.dizzy,0);
const b=l.bombs[0];let r=step(at(b.x,b.y),{x:0,y:0},0);assert.equal(r.bombs[0].phase,'fuse');r=step(r,{x:0,y:0},BOMB.fuseSeconds+.01);assert.equal(r.failure,'explode');assert.equal(r.lives,2);
assert.equal(step(at(l.goal.x,l.goal.y),{x:0,y:0},0).status,'cleared');assert.equal(step({...newRun(19),marble:{...LEVELS[19].goal,vx:0,vy:0}},{x:0,y:0},0).status,'won');assert.equal(newRun(0).levelIndex,0);
const h=fs.readFileSync('index.html','utf8'),a=fs.readFileSync('app.js','utf8'),bundle=fs.readFileSync('app.bundle.js','utf8');for(const marker of ['id="splash"','id="start-menu"','id="difficulty"','id="tilt"','id="bounce"','id="restart"'])assert.ok(h.includes(marker));assert.ok(a.includes('DeviceOrientationEvent.requestPermission'));assert.ok(a.includes('20 runs cleared'));assert.ok(bundle.includes('final orbit'));
console.log('startup, tilt, bounce, difficulty, bombs, dizzy safety, progression, restart: passed');
