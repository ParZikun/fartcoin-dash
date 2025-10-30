// FartCoin Dash 2D — LittleJS basic playable demo
// Move with arrow keys, collect yellow coins, avoid grey clouds

let player, coins=[], clouds=[], score=0, gameTimeLeft=60, running=false;

// initialize engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);

function gameInit() {
  cameraPos = vec2(0,0);
  cameraScale = 40;

  player = new EngineObject(vec2(0,0), vec2(1,1));
  player.color = new Color(0,1,0);
}

function resetGame() {
  coins = [];
  clouds = [];
  score = 0;
  gameTimeLeft = 60;
  player.pos = vec2(0,0);
  running = true;
  for (let i=0;i<10;i++) spawnCoin();
  for (let i=0;i<5;i++) spawnCloud();
}

function spawnCoin() {
  const c = new EngineObject(randInCircle(vec2(0,0),10), vec2(0.6,0.6));
  c.color = new Color(1,1,0);
  c.type='coin';
  coins.push(c);
}

function spawnCloud() {
  const c = new EngineObject(randInCircle(vec2(0,0),10), vec2(1.2,1.2));
  c.color = new Color(0.7,0.7,0.7);
  c.type='cloud';
  c.velocity = randInCircle(vec2(0,0),0.02);
  clouds.push(c);
}

function gameUpdate() {
  if(!running) return;

  const speed = 0.05;
  const move = vec2(
    (keyIsDown(39)-keyIsDown(37))*speed,
    (keyIsDown(38)-keyIsDown(40))*speed
  );
  player.pos = player.pos.add(move);

  // coin collision
  coins.forEach((c)=>{
    if (player.pos.distance(c.pos)<1) {
      score+=10;
      c.pos = randInCircle(vec2(0,0),10);
    }
  });

  // cloud movement & hit detection
  clouds.forEach(c=>{
    c.pos = c.pos.add(c.velocity);
    if (Math.abs(c.pos.x)>15||Math.abs(c.pos.y)>10) c.velocity = c.velocity.neg();
    if (player.pos.distance(c.pos)<1) score=Math.max(0,score-20);
  });

  gameTimeLeft -= engineDeltaTime;
  if (gameTimeLeft<=0){
    running=false;
    alert(`Game Over! Score: ${score}`);
  }
}

function gameUpdatePost(){}

function gameRender() {
  drawText(`Score: ${score}`, vec2(-18,9), 1.2, new Color(0,1,0));
  drawText(`Time: ${Math.ceil(gameTimeLeft)}`, vec2(8,9), 1.2, new Color(1,1,1));
  if(!running) drawTextCenter('Press Start', vec2(0,0), 2, new Color(1,1,1));
}

function gameRenderPost(){}

document.getElementById('startBtn').onclick = ()=> resetGame();
