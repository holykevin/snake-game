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
let movementInterval = 200; // 初始速度设为一般模式
let gameRunning = false; // 游戏是否运行中
let animationId = null; // 动画ID，用于取消动画

function gameLoop(currentTime) {
    if (!gameRunning) return;

    if (currentTime - lastMoveTime < movementInterval) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    lastMoveTime = currentTime;
    // 移动蛇身
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    // 吃食物检测
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    // 碰撞检测
    if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
       snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    drawGame();

    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    document.getElementById('gameStatus').textContent = '游戏结束！得分：' + score;
    document.getElementById('startBtn').textContent = '重新开始';
}

function startGame() {
    if (gameRunning) return;

    if (dx === 0 && dy === 0) {
        // 如果蛇还没移动，设置初始方向
        dx = 1;
    }
    gameRunning = true;
    document.getElementById('gameStatus').textContent = '游戏进行中...';
    lastMoveTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // 确保食物不生成在蛇身上
    while(snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

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
    document.getElementById('score').textContent = score;
    document.getElementById('gameStatus').textContent = '点击"开始游戏"开始';
    document.getElementById('startBtn').textContent = '开始游戏';
    generateFood();
    drawGame();
}

function drawGame() {
    // 清空画布
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇身
    ctx.fillStyle = '#2ecc71';
    snake.forEach((segment) => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
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
    // 如果游戏未开始，自动开始
    if (moved && !gameRunning) {
        startGame();
    }
});

// 触控支持
let touchStartX = 0;
let touchStartY = 0;
const minSwipeDistance = 30; // 最小滑动距离

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault(); // 防止页面滚动
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // 判断滑动方向（取绝对值较大的方向）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0 && dx !== -1) {
                // 向右滑动
                dx = 1; dy = 0;
            } else if (diffX < 0 && dx !== 1) {
                // 向左滑动
                dx = -1; dy = 0;
            }
        }
    } else {
        // 垂直滑动
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0 && dy !== -1) {
                // 向下滑动
                dx = 0; dy = 1;
            } else if (diffY < 0 && dy !== 1) {
                // 向上滑动
                dx = 0; dy = -1;
            }
        }
    }

    // 如果游戏未开始，自动开始
    if (!gameRunning && (dx !== 0 || dy !== 0)) {
        startGame();
    }

    touchStartX = 0;
    touchStartY = 0;
    e.preventDefault();
}, { passive: false });

// 虚拟方向键控制（移动端）
document.getElementById('btnUp').addEventListener('click', () => {
    if(dy !== 1) { dx = 0; dy = -1; }
    if (!gameRunning) startGame();
});
document.getElementById('btnDown').addEventListener('click', () => {
    if(dy !== -1) { dx = 0; dy = 1; }
    if (!gameRunning) startGame();
});
document.getElementById('btnLeft').addEventListener('click', () => {
    if(dx !== 1) { dx = -1; dy = 0; }
    if (!gameRunning) startGame();
});
document.getElementById('btnRight').addEventListener('click', () => {
    if(dx !== -1) { dx = 1; dy = 0; }
    if (!gameRunning) startGame();
});

// 难度模式切换
document.getElementById('easyMode').addEventListener('click', (e) => {
    movementInterval = 300;
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
});

document.getElementById('normalMode').addEventListener('click', (e) => {
    movementInterval = 200;
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
});

document.getElementById('hardMode').addEventListener('click', (e) => {
    movementInterval = 100;
    document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
});

// 开始和重置按钮
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        if (document.getElementById('startBtn').textContent === '重新开始') {
            resetGame();
        }
        startGame();
    }
});

document.getElementById('resetBtn').addEventListener('click', resetGame);

// 启动游戏
generateFood();
drawGame();