// FartCoin Dash — Responsive LittleJS Mini Game
// Move with arrows or WASD, collect coins, avoid clouds!

let player, coins=[], clouds=[], score=0, gameTimeLeft=60, running=false;
let gameAreaSize = 20; // world size, adjusts with screen

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

function gameInit() {
  updateCamera();
  player = new EngineObject(vec2(0,0), vec2(1,1));
  player.color = new Color(0,1,0);
  window.addEventListener('resize', updateCamera);
}

function updateCamera() {
  // make camera smaller when screen is small (responsive)
  const base = Math.min(innerWidth, innerHeight);
  cameraScale = Math.max(20, base / 20);
  cameraPos = vec2(0,0);
}

function resetGame() {
  coins = [];
  clouds = [];
  score = 0;
  gameTimeLeft = 60;
  player.pos = vec2(0,0);
  running = true;
  for (let i=0;i<8;i++) spawnCoin();
  for (let i=0;i<4;i++) spawnCloud();
}

function spawnCoin() {
  const c = new EngineObject(randInCircle(vec2(0,0), gameAreaSize), vec2(0.6,0.6));
  c.color = new Color(1,1,0);
  c.type='coin';
  coins.push(c);
}

function spawnCloud() {
  const c = new EngineObject(randInCircle(vec2(0,0), gameAreaSize), vec2(1.2,1.2));
  c.color = new Color(0.7,0.7,0.7);
  c.type='cloud';
  c.velocity = randInCircle(vec2(0,0),0.015);
  clouds.push(c);
}

function gameUpdate() {
  if(!running) return;
  const speed = 0.07;
  const dx = (keyIsDown(39)||keyIsDown(68)) - (keyIsDown(37)||keyIsDown(65));
  const dy = (keyIsDown(38)||keyIsDown(87)) - (keyIsDown(40)||keyIsDown(83));
  player.pos = player.pos.add(vec2(dx, dy).scale(speed));

  // coin collision
  coins.forEach(c=>{
    if (player.pos.distance(c.pos)<1) {
      score+=10;
      c.pos = randInCircle(vec2(0,0),gameAreaSize);
    }
  });

  // clouds move & hit
  clouds.forEach(c=>{
    c.pos = c.pos.add(c.velocity);
    if (Math.abs(c.pos.x)>gameAreaSize || Math.abs(c.pos.y)>gameAreaSize)
      c.velocity = c.velocity.neg();
    if (player.pos.distance(c.pos)<1) score=Math.max(0,score-15);
  });

  gameTimeLeft -= engineDeltaTime;
  if (gameTimeLeft<=0){
    running=false;
    setTimeout(()=>alert(`Game Over! Score: ${score}`),100);
  }
}

function gameUpdatePost(){}

function gameRender() {
  drawText(`Score: ${score}`, vec2(-18,9), 1.2, new Color(0,1,0));
  drawText(`Time: ${Math.ceil(gameTimeLeft)}`, vec2(10,9), 1.2, new Color(1,1,1));
  if(!running)
    drawTextCentered('Press Start', vec2(0,0), 2, new Color(1,1,1));
}

function gameRenderPost(){}

// helper: center text draw
function drawTextCentered(text, pos, size=1, color=new Color(1,1,1)) {
  const measure = text.length * size * 0.6;
  drawText(text, vec2(pos.x - measure/2, pos.y), size, color);
}

document.getElementById('startBtn').onclick = ()=> resetGame();
