// 烟花效果模块
const Fireworks = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    isRunning: false,

    // 初始化
    init() {
        this.canvas = document.getElementById('fireworksCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    // 调整画布大小
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // 粒子类
    createParticle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            alpha: 1,
            size: Math.random() * 5 + 3,
            decay: Math.random() * 0.015 + 0.008
        };
    },

    // 创建烟花爆炸
    createExplosion(x, y) {
        const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ffffff', '#ff69b4', '#ffd700'];
        const particleCount = 120;

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(this.createParticle(x, y, color));
        }
    },

    // 绘制粒子
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        // 添加发光效果
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    },

    // 更新粒子
    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // 重力
        particle.alpha -= particle.decay;
        return particle.alpha > 0;
    },

    // 动画循环
    animate() {
        if (!this.isRunning) return;

        // 清除画布（完全透明）
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(particle => {
            this.drawParticle(particle);
            return this.updateParticle(particle);
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    },

    // 开始烟花效果
    start() {
        this.init();
        this.isRunning = true;
        this.canvas.style.display = 'block';

        // 创建多个烟花爆炸点
        const explosionCount = 8;
        const interval = 300;

        for (let i = 0; i < explosionCount; i++) {
            setTimeout(() => {
                if (this.isRunning) {
                    const x = Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2;
                    const y = Math.random() * this.canvas.height * 0.5 + this.canvas.height * 0.1;
                    this.createExplosion(x, y);
                }
            }, i * interval);
        }

        this.animate();

        // 5秒后自动停止
        setTimeout(() => this.stop(), 5000);
    },

    // 停止烟花效果
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }
};
