/**
 * Renderer.js - 渲染模块
 * 处理 Canvas 渲染、背景、特效和 UI 绘制
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 设置 Canvas 尺寸
        this.resize();
        
        // 背景粒子效果
        this.particles = [];
        this.initParticles();
    }
    
    /**
     * 调整 Canvas 尺寸（响应式）
     */
    resize() {
        // 根据屏幕大小调整
        const maxWidth = Math.min(600, window.innerWidth - 40);
        const maxHeight = Math.min(800, window.innerHeight - 100);
        
        // 保持 3:4 比例
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight * 0.75;
        
        // 重新初始化粒子
        this.initParticles();
    }
    
    /**
     * 初始化背景粒子
     */
    initParticles() {
        this.particles = [];
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedY: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    /**
     * 更新背景粒子
     */
    updateParticles() {
        for (const particle of this.particles) {
            particle.y += particle.speedY;
            
            // 循环
            if (particle.y > this.canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    /**
     * 渲染背景
     */
    renderBackground() {
        // 清空画布
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        const gridSize = 40;
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // 绘制背景粒子
        this.updateParticles();
        for (const particle of this.particles) {
            this.ctx.fillStyle = `rgba(74, 158, 255, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    /**
     * 渲染游戏结束特效
     */
    renderGameOverEffect() {
        // 闪烁效果
        const flash = Math.sin(Date.now() / 100) * 0.3 + 0.5;
        this.ctx.fillStyle = `rgba(255, 74, 74, ${flash * 0.2})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 渲染得分提示（当障碍物被躲过时）
     */
    renderScorePopup(x, y, text) {
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * 渲染玩家
     */
    renderPlayer(player) {
        player.render(this.ctx);
    }
    
    /**
     * 渲染障碍物
     */
    renderObstacles(obstacleManager) {
        obstacleManager.render(this.ctx);
    }
    
    /**
     * 完整渲染循环
     */
    render(player, obstacleManager, score, highScore) {
        // 背景
        this.renderBackground();
        
        // 游戏元素
        this.renderPlayer(player);
        this.renderObstacles(obstacleManager);
        
        // 更新 UI 显示（通过 DOM）
        this.updateUI(score, highScore);
    }
    
    /**
     * 更新 UI 元素
     */
    updateUI(score, highScore) {
        const scoreEl = document.getElementById('score');
        const highScoreEl = document.getElementById('high-score');
        
        if (scoreEl) scoreEl.textContent = score;
        if (highScoreEl) highScoreEl.textContent = highScore;
    }
    
    /**
     * 显示游戏结束界面
     */
    showGameOver(finalScore, finalHighScore) {
        const gameOverEl = document.getElementById('game-over');
        const finalScoreEl = document.getElementById('final-score');
        const finalHighScoreEl = document.getElementById('final-high-score');
        
        if (gameOverEl) {
            gameOverEl.style.display = 'block';
        }
        if (finalScoreEl) finalScoreEl.textContent = finalScore;
        if (finalHighScoreEl) finalHighScoreEl.textContent = finalHighScore;
    }
    
    /**
     * 隐藏游戏结束界面
     */
    hideGameOver() {
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl) {
            gameOverEl.style.display = 'none';
        }
    }
    
    /**
     * 隐藏开始界面
     */
    hideStartScreen() {
        const startScreenEl = document.getElementById('start-screen');
        if (startScreenEl) {
            startScreenEl.style.display = 'none';
        }
    }
    
    /**
     * 获取 Canvas 高度（用于游戏逻辑）
     */
    getHeight() {
        return this.canvas.height;
    }
    
    /**
     * 获取 Canvas 宽度（用于游戏逻辑）
     */
    getWidth() {
        return this.canvas.width;
    }
}
