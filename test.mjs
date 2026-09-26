import assert from 'node:assert/strict';
import { WORLD,VIEWPORT,LEVELS,newRun,step,nextLevel,circlesOverlap,pointInExpandedRect,requestJump,cameraFor,CAMERA_LEAD } from './game.js';
import fs from 'node:fs';
assert.equal(LEVELS.length,4,'four progressive levels');assert.ok(LEVELS[3].obstacles.length>LEVELS[0].obstacles.length,'later levels add challenges');assert.equal(VIEWPORT.physicalWidth,240,'R1 viewport is 240 pixels wide');assert.equal(VIEWPORT.physicalHeight,282,'R1 viewport is 282 pixels tall');assert.ok(WORLD.height>VIEWPORT.height,'world is larger than fixed viewport');assert.equal(circlesOverlap({x:0,y:0},10,{x:20,y:0},10),false,'tangent contact is safe');assert.equal(pointInExpandedRect({x:95,y:50},{x:100,y:40,w:30,h:20},6),true,'wall collision includes marble radius');
let run=newRun();assert.ok(cameraFor(run)<=WORLD.height-VIEWPORT.height,'camera starts in fixed-viewport bounds');run={...run,marble:{...run.marble,y:800},lastDirection:{x:0,y:-1}};const centeredCamera=cameraFor(run);assert.ok(centeredCamera<800,'look-ahead shows travel direction');assert.ok(Math.abs((run.marble.y-centeredCamera)-VIEWPORT.height/2)<=CAMERA_LEAD.forward,'marble remains centered-ish with modest lead');assert.ok(cameraFor({...run,marble:{...run.marble,y:WORLD.height}})<=WORLD.height-VIEWPORT.height,'camera never exposes space below the world');
run=newRun();let jumped=requestJump({...run,lastDirection:{x:0,y:-1}},false);assert.equal(jumped.jumpKind,'normal','bounce starts');assert.equal(Math.round(run.marble.y-jumped.marble.y),WORLD.unit,'normal bounce moves one unit');
run={...newRun(),superJumps:1,lastDirection:{x:0,y:-1}};jumped=requestJump(run,true);assert.equal(jumped.jumpKind,'super','super bounce starts');assert.equal(Math.round(run.marble.y-jumped.marble.y),WORLD.unit*3,'super bounce moves three units');assert.equal(jumped.superJumps,0,'super charge consumed');
run=newRun();run={...run,marble:{x:5,y:100,vx:-2,vy:0}};let hit=step(run,{x:0,y:0},1/60);assert.equal(hit.lives,2,'wall collision costs a life');assert.ok(['explode','crumble','melt'].includes(hit.failure),'failure animation selected');
run=newRun();run={...run,marble:{x:LEVELS[0].goal.x,y:LEVELS[0].goal.y,vx:0,vy:0}};assert.equal(step(run,{x:0,y:0},0).status,'cleared','goal clears level');assert.equal(nextLevel(newRun()).levelIndex,1,'clear advances level');run=newRun(3);run={...run,marble:{x:LEVELS[3].goal.x,y:LEVELS[3].goal.y,vx:0,vy:0}};assert.equal(step(run,{x:0,y:0},0).status,'won','last goal wins');run=newRun();run={...run,remaining:.01};assert.equal(step(run,{x:0,y:0},.02).status,'lost','timer loss works');assert.ok(step(newRun(),{x:1,y:0},1/60).marble.x>newRun().marble.x,'desktop fallback steers');console.log('scroll camera, jumps, powers, collisions, failures, progression, and fallback: ok');

const html=fs.readFileSync('./index.html','utf8'), css=fs.readFileSync('./styles.css','utf8'), app=fs.readFileSync('./app.js','utf8');
assert.match(html,/id=\"splash\"/,'opening splash exists');assert.match(html,/id=\"start-menu\"/,'start menu exists');assert.match(html,/id=\"menu\" class=\"menu-overlay\"/,'waffle overlay exists');assert.match(html,/id=\"waffle\"/,'waffle remains available during play');assert.match(css,/#r1-shell,\.canvas-wrap\{width:240px;height:282px\}/,'physical viewport remains fixed');assert.ok(!css.includes('orange bar'),'large orange header is absent');assert.match(app,/phase==='playing'&&!menuOpen&&!manualPause/,'menu state pauses the simulation');assert.match(app,/freezeAudio\(\)/,'menu state pauses audio');assert.match(html,/id=\"continue\"/,'splash uses a tap-to-continue affordance');console.log('splash/menu pause, fixed full-screen board, and centered camera: ok');

assert.match(html,/id="dpad"/,'gameplay includes a visible circular touch D-pad');
assert.match(html,/id="bounce" class="pad-action"/,'D-pad center action is present');
assert.match(app,/const continueToMenu=\(\)=>showPhase\('menu'\)/,'splash tap advances to start menu');
assert.match(app,/function startGame\(\).*showPhase\('playing'\)/,'start button advances into active gameplay');
assert.match(app,/dpad\.hidden=next!==\'playing\'/,'D-pad is shown during gameplay only');
assert.match(app,/setPadDirection\(direction,true\)/,'D-pad pointer input reaches movement controls');
assert.match(app,/jump\(run\.superJumps>0\)/,'center action uses super bounce whenever a charge is held');
assert.match(css,/\.dpad\{[^}]*border-radius:50%/,'touch controls are circular');
const origin=newRun().marble;
assert.ok(step(newRun(),{x:0,y:-1},1/60).marble.y<origin.y,'up D-pad mapping rolls up');
assert.ok(step(newRun(),{x:0,y:1},1/60).marble.y>origin.y,'down D-pad mapping rolls down');
assert.ok(step(newRun(),{x:-1,y:0},1/60).marble.x<origin.x,'left D-pad mapping rolls left');
assert.ok(step(newRun(),{x:1,y:0},1/60).marble.x>origin.x,'right D-pad mapping rolls right');
console.log('startup transitions, touch D-pad directions, and normal/super center action: ok');
