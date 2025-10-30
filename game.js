// FartCoin Dash 2D — LittleJS + OGP Demo
// One level, collect coins, avoid clouds, score = coins*10 - hits*20

// === CONFIG ===
const GAME_ID = 'OGP_GAME_ID_PLACEHOLDER';
const API_KEY = 'OGP_API_KEY_PLACEHOLDER';
window.ogp = window.OGP_SDK || window.OGP || mockOGP();

// Game vars
let player, coins=[], clouds=[], score=0, time=60, running=false, wallet=null;

// === LittleJS Setup ===
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['https://unpkg.com/littlejsengine/dist/engine/littlejs.png']);

function gameInit() {
  cameraPos = vec2(0,0);
  cameraScale = 40;
  // player sprite
  player = new EngineObject(vec2(0,0), vec2(1,1));
  player.color = new Color(0,1,0);
}

function resetGame() {
  coins.length = 0;
  clouds.length = 0;
  score = 0;
  time = 60;
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

  // check collisions
  coins.forEach((c,i)=>{
    if (player.pos.distance(c.pos)<1) {
      score+=10;
      c.pos = randInCircle(vec2(0,0),10);
      playSound(soundCoin);
    }
  });
  clouds.forEach(c=>{
    c.pos = c.pos.add(c.velocity);
    if (Math.abs(c.pos.x)>15||Math.abs(c.pos.y)>10) c.velocity = c.velocity.neg();
    if (player.pos.distance(c.pos)<1) {
      score=Math.max(0,score-20);
      playSound(soundHit);
    }
  });

  // countdown
  time-=engineDeltaTime;
  if (time<=0){
    running=false;
    endGame();
  }
}

function gameUpdatePost(){}

function gameRender() {
  drawText(`Score: ${score}`, vec2(-18,9), 1.2, new Color(0,1,0));
  drawText(`Time: ${Math.ceil(time)}`, vec2(8,9), 1.2, new Color(1,1,1));
  if(!running) drawTextCenter('Press Start', vec2(0,0), 2, new Color(1,1,1));
}

function gameRenderPost(){}

// === sounds ===
const soundCoin = new Sound([0,,0.06,,0.3,0.6,,0.3,0.1,,,,0.06]);
const soundHit  = new Sound([0,,0.1,0.2,0.3,0.1,,0.3,0.2,,,,0.05]);

// === DOM Buttons ===
document.getElementById('startBtn').onclick = ()=>{
  resetGame();
};

document.getElementById('connectBtn').onclick = async ()=>{
  const r = await window.ogp.connect({apiKey:API_KEY});
  wallet = r.wallet || 'mock_wallet';
  alert('Connected wallet: '+wallet);
};

// === End Game + OGP Report ===
async function endGame(){
  alert('Game Over! Score: '+score);
  try {
    const res = await window.ogp.reportScore({gameId:GAME_ID,wallet,score});
    console.log('OGP response',res);
  }catch(e){console.warn('Report failed',e);}
}

// === MOCK OGP for offline testing ===
function mockOGP(){
  return {
    async connect(){console.log('[OGP mock] connect');return{wallet:'mock_'+Math.floor(Math.random()*1e6)};},
    async reportScore({score}){console.log('[OGP mock] reportScore',score);return{success:true};}
  };
}
