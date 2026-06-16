// 游戏核心变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let lastMoveTime = 0;
let movementInterval = 300;
let gameRunning = false;
let animationId = null;
let currentMode = 'easy'; // 当前游戏模式（默认简单模式）

// DOM 元素
const authModal = document.getElementById('authModal');
const userBar = document.getElementById('userBar');
const usernameDisplay = document.getElementById('usernameDisplay');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');
const scoreDisplay = document.getElementById('score');

// 初始化应用
function initApp() {
    if (Auth.isLoggedIn()) {
        showGameInterface();
    } else {
        showAuthModal();
    }
    setupAuthListeners();
}

// 显示登录/注册模态框
function showAuthModal() {
    authModal.style.display = 'flex';
    userBar.style.display = 'none';
}

// 显示游戏界面
function showGameInterface() {
    authModal.style.display = 'none';
    userBar.style.display = 'flex';
    usernameDisplay.textContent = Auth.getCurrentUser();
    updateHighScoreDisplay();
}

// 更新最高分显示
function updateHighScoreDisplay() {
    const username = Auth.getCurrentUser();
    if (username) {
        const highScore = Scores.getHighScore(username, currentMode);
        highScoreDisplay.textContent = highScore;
    }
}

// 设置认证相关监听器
function setupAuthListeners() {
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const result = Auth.login(username, password);
        handleAuthResult(result);
    });

    // 注册按钮
    document.getElementById('registerBtn').addEventListener('click', () => {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const result = Auth.register(username, password);
        handleAuthResult(result);
    });

    // 登出按钮
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Auth.logout();
        showAuthModal();
        resetGame();
    });

    // 回车键登录
    document.getElementById('authPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
}

// 处理认证结果
function handleAuthResult(result) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = result.message;
    messageEl.className = result.success ? 'auth-message success' : 'auth-message';

    if (result.success) {
        setTimeout(() => {
            showGameInterface();
            messageEl.textContent = '';
            document.getElementById('authUsername').value = '';
            document.getElementById('authPassword').value = '';
        }, 500);
    }
}

// 游戏主循环
function gameLoop(currentTime) {
    if (!gameRunning) return;

    if (currentTime - lastMoveTime < movementInterval) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    lastMoveTime = currentTime;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if(head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
       snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    drawGame();
    animationId = requestAnimationFrame(gameLoop);
}

// 游戏结束
function gameOver() {
    gameRunning = false;

    const username = Auth.getCurrentUser();
    if (username) {
        const isNewRecord = Scores.updateHighScore(username, currentMode, score);

        if (isNewRecord) {
            // 打破记录
            showCelebrateMessage(Scores.getCelebrateMessage());
            Fireworks.start();
            updateHighScoreDisplay();
        } else {
            // 未打破记录
            gameStatusDisplay.textContent = '游戏结束！得分：' + score + ' - ' + Scores.getEncourageMessage();
        }
    } else {
        gameStatusDisplay.textContent = '游戏结束！得分：' + score;
    }

    document.getElementById('startBtn').textContent = '重新开始';
}

// 显示庆祝消息
function showCelebrateMessage(message) {
    const msgEl = document.createElement('div');
    msgEl.className = 'celebrate-message';
    msgEl.textContent = message;
    document.body.appendChild(msgEl);

    setTimeout(() => {
        msgEl.remove();
    }, 3000);
}

// 开始游戏
function startGame() {
    if (gameRunning) return;

    if (dx === 0 && dy === 0) {
        dx = 1;
    }
    gameRunning = true;
    gameStatusDisplay.textContent = '游戏进行中...';
    lastMoveTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    while(snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

// 重置游戏
function resetGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    gameRunning = false;
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    gameStatusDisplay.textContent = '点击"开始游戏"开始';
    document.getElementById('startBtn').textContent = '开始游戏';
    generateFood();
    drawGame();
}

// 绘制游戏画面
function drawGame() {
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    ctx.strokeStyle = '#4a6278';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 绘制边界框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇身
    ctx.fillStyle = '#2ecc71';
    snake.forEach((segment) => {
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    // 绘制食物（根据模式显示不同形状）
    drawFood();
}

// 绘制食物（根据难度模式显示不同水果）
function drawFood() {
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    const size = gridSize;

    switch(currentMode) {
        case 'easy':
            drawApple(x, y, size);
            break;
        case 'normal':
            drawOrange(x, y, size);
            break;
        case 'hard':
            drawDurian(x, y, size);
            break;
        default:
            drawApple(x, y, size);
    }
}

// 绘制红苹果
function drawApple(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 1;

    // 苹果主体（红色）
    ctx.beginPath();
    ctx.arc(centerX, centerY + 1, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // 苹果高光
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // 苹果茎（棕色）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 1);
    ctx.lineTo(centerX + 1, centerY - radius - 3);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1; // Reset to default

    // 苹果叶子（绿色）
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY - radius - 1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
}

// 绘制橙色橙子
function drawOrange(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 1;

    // 橙子主体（橙色）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f39c12';
    ctx.fill();

    // 橙子纹理（中心点）
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#e67e22';
    ctx.fill();

    // 橙子高光
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    // 橙子顶部小茎
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius + 1, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
}

// 绘制榴莲
function drawDurian(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 1;

    // 榴莲主体（黄绿色椭圆形）
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#9acd32';
    ctx.fill();

    // 榴莲刺（多个小三角形）
    ctx.fillStyle = '#8B8B00';
    const spikeCount = 8;
    for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2;
        const spikeX = centerX + Math.cos(angle) * radius * 0.7;
        const spikeY = centerY + Math.sin(angle) * radius * 0.6;
        drawSpike(spikeX, spikeY, 3, angle);
    }

    // 榴莲柄（棕色）
    ctx.beginPath();
    ctx.moveTo(centerX - 2, y + 1);
    ctx.lineTo(centerX + 2, y + 1);
    ctx.lineTo(centerX + 1, y - 2);
    ctx.lineTo(centerX - 1, y - 2);
    ctx.closePath();
    ctx.fillStyle = '#8B4513';
    ctx.fill();
}

// 绘制榴莲刺
function drawSpike(x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // 旋转使刺指向外侧
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size/2, size/2);
    ctx.lineTo(-size/2, size/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    let moved = false;
    switch(e.key) {
        case 'ArrowUp':
            if(dy !== 1) { dx = 0; dy = -1; moved = true; }
            break;
        case 'ArrowDown':
            if(dy !== -1) { dx = 0; dy = 1; moved = true; }
            break;
        case 'ArrowLeft':
            if(dx !== 1) { dx = -1; dy = 0; moved = true; }
            break;
        case 'ArrowRight':
            if(dx !== -1) { dx = 1; dy = 0; moved = true; }
            break;
    }
    if (moved && !gameRunning && Auth.isLoggedIn()) {
        startGame();
    }
});

// 触控支持
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 30;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (diffX < 0 && dx !== 1) { dx = -1; dy = 0; }
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (diffY < 0 && dy !== 1) { dx = 0; dy = -1; }
        }
    }

    if (!gameRunning && (dx !== 0 || dy !== 0) && Auth.isLoggedIn()) {
        startGame();
    }

    touchStartX = 0;
    touchStartY = 0;
    e.preventDefault();
}, { passive: false });

// 虚拟方向键控制
document.getElementById('btnUp').addEventListener('click', () => {
    if(dy !== 1) { dx = 0; dy = -1; }
    if (!gameRunning && Auth.isLoggedIn()) startGame();
});
document.getElementById('btnDown').addEventListener('click', () => {
    if(dy !== -1) { dx = 0; dy = 1; }
    if (!gameRunning && Auth.isLoggedIn()) startGame();
});
document.getElementById('btnLeft').addEventListener('click', () => {
    if(dx !== 1) { dx = -1; dy = 0; }
    if (!gameRunning && Auth.isLoggedIn()) startGame();
});
document.getElementById('btnRight').addEventListener('click', () => {
    if(dx !== -1) { dx = 1; dy = 0; }
    if (!gameRunning && Auth.isLoggedIn()) startGame();
});

// 难度模式切换
document.getElementById('easyMode').addEventListener('click', (e) => {
    movementInterval = 300;
    currentMode = 'easy';
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    updateHighScoreDisplay();
});

document.getElementById('normalMode').addEventListener('click', (e) => {
    movementInterval = 200;
    currentMode = 'normal';
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    updateHighScoreDisplay();
});

document.getElementById('hardMode').addEventListener('click', (e) => {
    movementInterval = 100;
    currentMode = 'hard';
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    updateHighScoreDisplay();
});

// 开始和重置按钮
document.getElementById('startBtn').addEventListener('click', () => {
    if (!Auth.isLoggedIn()) {
        showAuthModal();
        return;
    }
    if (!gameRunning) {
        if (document.getElementById('startBtn').textContent === '重新开始') {
            resetGame();
        }
        startGame();
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (Auth.isLoggedIn()) {
        resetGame();
    }
});

// 初始化
generateFood();
drawGame();
initApp();
