// FartCoin Dash — built with LittleJS (fully playable & responsive)
'use strict';

let player, coins=[], clouds=[];
let score=0, gameTimeLeft=60, running=false;
let worldSize = 20;

// init engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

function gameInit() {
  // center camera, make it responsive
  updateCamera();
  window.addEventListener('resize', updateCamera);

  // create player
  player = new EngineObject(vec2(0,0), vec2(1,1));
  player.color = new Color(0,1,0);
}

function updateCamera() {
  const scale = Math.min(innerWidth, innerHeight)/20;
  cameraScale = Math.max(20, scale);
  cameraPos = vec2(0,0);
}

function resetGame() {
  coins.length = 0;
  clouds.length = 0;
  score = 0;
  gameTimeLeft = 60;
  player.pos = vec2(0,0);
  running = true;
  for (let i=0;i<8;i++) spawnCoin();
  for (let i=0;i<4;i++) spawnCloud();
}

function spawnCoin() {
  const pos = randInCircle(vec2(0,0), worldSize);
  const c = new EngineObject(pos, vec2(0.6,0.6));
  c.color = new Color(1,1,0);
  c.type='coin';
  coins.push(c);
}

function spawnCloud() {
  const pos = randInCircle(vec2(0,0), worldSize);
  const c = new EngineObject(pos, vec2(1.2,1.2));
  c.color = new Color(0.7,0.7,0.7);
  c.type='cloud';
  c.velocity = randInCircle(vec2(0,0),0.02);
  clouds.push(c);
}

function gameUpdate() {
  if(!running) return;

  const speed = 0.07;
  const dx = (keyIsDown(39)||keyIsDown(68)) - (keyIsDown(37)||keyIsDown(65));
  const dy = (keyIsDown(38)||keyIsDown(87)) - (keyIsDown(40)||keyIsDown(83));
  player.pos = player.pos.add(vec2(dx,dy).scale(speed));

  // coin pickup
  coins.forEach(c=>{
    if(player.pos.distance(c.pos)<1){
      score+=10;
      soundPlay(sfxCoin());
      c.pos = randInCircle(vec2(0,0), worldSize);
    }
  });

  // cloud movement and collision
  clouds.forEach(c=>{
    c.pos = c.pos.add(c.velocity);
    if(Math.abs(c.pos.x)>worldSize || Math.abs(c.pos.y)>worldSize)
      c.velocity = c.velocity.neg();

    if(player.pos.distance(c.pos)<1.1){
      score=Math.max(0,score-15);
      soundPlay(sfxHit());
    }
  });

  // timer
  gameTimeLeft -= timeDelta; // ✅ latest API variable
  if(gameTimeLeft<=0){
    running=false;
    setTimeout(()=>alert(`Game Over!\nFartCoins collected: ${score}`),100);
  }
}

function gameUpdatePost(){}

function gameRender() {
  // HUD
  drawTextScreen(`Score: ${score}`, vec2(10,20), 20, new Color(0,1,0));
  drawTextScreen(`Time: ${Math.ceil(gameTimeLeft)}`, vec2(220,20), 20, new Color(1,1,1));
  if(!running)
    drawTextScreenCentered('Press Start to Play', vec2(0.5,0.5), 30, new Color(1,1,1));
}

function gameRenderPost(){}

// Helper to center screen text (based on screen coords)
function drawTextScreenCentered(text, posNorm, size, color){
  const pos = vec2(mainCanvas.width*posNorm.x - text.length*size*0.3, 
                   mainCanvas.height*posNorm.y);
  drawTextScreen(text,pos,size,color);
}

// --- simple sounds ---
function sfxCoin(){ return new Sound([.5,,.3,,.2,.3,,,.3]); }
function sfxHit(){  return new Sound([.3,,.2,,.5,.4,,,.3]); }

// button start
document.getElementById('startBtn').onclick=()=>resetGame();
