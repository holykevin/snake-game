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
let movementInterval = 200;
let gameRunning = false;
let animationId = null;
let currentMode = 'normal'; // 当前游戏模式

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

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
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
