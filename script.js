let isRunning = false;
let timer = null;
let startTime = null;
let totalEarned = 0;
let salaryPerSecond = 0;
let coinsPerSecond = 0;

const toggleBtn = document.getElementById('toggleButton');
const resetBtn = document.getElementById('resetButton');
const display = document.getElementById('earnings');
const salaryInput = document.getElementById('salary');

const canvas = document.getElementById('coinCanvas');
const ctx = canvas.getContext('2d');
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 粒子系統（每個金幣是一個粒子）
const coins = [];

class Coin {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.radius = 6 + Math.random() * 4;
    this.speedY = 2 + Math.random() * 3;
    this.alpha = 1;
    this.spin = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
  }

  update() {
    this.y += this.speedY;
    this.spin += this.rotationSpeed;
    if (this.y > canvas.height + this.radius) {
      this.alpha = 0;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.spin * Math.PI) / 180);
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius);
    gradient.addColorStop(0, '#fffbbd');
    gradient.addColorStop(0.4, '#ffd700');
    gradient.addColorStop(1, '#b8860b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

let lastEmitTime = 0;

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 每幀 emit 若間隔足夠
  if (isRunning && timestamp - lastEmitTime > 1000 / coinsPerSecond) {
    if (coins.length < 300) {
      coins.push(new Coin());
    }
    lastEmitTime = timestamp;
  }

  coins.forEach((coin, index) => {
    coin.update();
    coin.draw();
    if (coin.alpha <= 0) coins.splice(index, 1);
  });

  requestAnimationFrame(animate);
}

toggleBtn.addEventListener('click', () => {
  const salary = parseFloat(salaryInput.value);
  if (!salary || salary <= 0) {
    alert('請輸入有效的月薪');
    return;
  }

  salaryPerSecond = salary / (30 * 8 * 60 * 60);
  coinsPerSecond = Math.max(1, Math.min(Math.floor(salary / 10000), 50));

  if (!isRunning) {
    isRunning = true;
    toggleBtn.textContent = '停止計算';
    startTime = Date.now();
    timer = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;
      const earnedNow = elapsedSeconds * salaryPerSecond;
      display.textContent = `已賺取：$${(totalEarned + earnedNow).toFixed(2)}`;
    }, 100);
    requestAnimationFrame(animate);
  } else {
    isRunning = false;
    toggleBtn.textContent = '開始計算';
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;
    totalEarned += elapsedSeconds * salaryPerSecond;
    clearInterval(timer);
  }
});

resetBtn.addEventListener('click', () => {
  if (timer) clearInterval(timer);
  isRunning = false;
  totalEarned = 0;
  startTime = null;
  display.textContent = '已賺取：$0';
  toggleBtn.textContent = '開始計算';
  coins.length = 0;
});
