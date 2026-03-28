/**
 * Game.js - 游戏主循环和状态管理
 * 整合所有模块，处理游戏流程
 */

class Game {
    constructor() {
        // 获取 Canvas
        this.canvas = document.getElementById('game-canvas');
        
        // 初始化渲染器
        this.renderer = new Renderer(this.canvas);
        
        // 初始化玩家
        this.player = new Player(this.renderer.getWidth(), this.renderer.getHeight());
        
        // 初始化障碍物管理器
        this.obstacleManager = new ObstacleManager(
            this.renderer.getWidth(),
            this.renderer.getHeight()
        );
        
        // 初始化音效管理器
        this.audioManager = window.audioManager || new AudioManager();
        
        // 游戏状态
        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.startTime = 0;
        this.lastScoreUpdate = 0;
        
        // 输入状态
        this.input = {
            left: false,
            right: false
        };
        
        // 触摸控制
        this.touchStartX = 0;
        this.lastTouchX = 0;
        
        // 最后一帧时间
        this.lastFrameTime = 0;
        
        // 绑定事件
        this.bindEvents();
        
        // 更新最高分显示
        this.renderer.updateUI(0, this.highScore);
    }
    
    /**
     * 绑定输入事件
     */
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        
        // 开始按钮
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // 重新开始按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.input.left = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.input.right = true;
        }
    }
    
    /**
     * 处理键盘抬起
     */
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.input.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.input.right = false;
        }
    }
    
    /**
     * 处理触摸开始
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.lastTouchX = touch.clientX;
    }
    
    /**
     * 处理触摸移动
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.lastTouchX;
        this.player.handleTouchMove(deltaX);
        this.lastTouchX = touch.clientX;
    }
    
    /**
     * 处理触摸结束
     */
    handleTouchEnd(e) {
        e.preventDefault();
        // 可以添加滑动检测逻辑
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        this.renderer.resize();
        this.player.canvasWidth = this.renderer.getWidth();
        this.player.canvasHeight = this.renderer.getHeight();
        this.obstacleManager.canvasWidth = this.renderer.getWidth();
        this.obstacleManager.canvasHeight = this.renderer.getHeight();
        this.player.reset();
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        // 初始化音效（需要在用户交互后）
        if (this.audioManager && this.audioManager.init) {
            this.audioManager.init();
        }
        
        this.isRunning = true;
        this.isGameOver = false;
        this.score = 0;
        this.startTime = Date.now();
        this.lastFrameTime = Date.now();
        this.lastScoreUpdate = 0;
        
        // 重置游戏对象
        this.player.reset();
        this.obstacleManager.reset();
        
        // 隐藏开始界面
        this.renderer.hideStartScreen();
        this.renderer.hideGameOver();
        
        // 播放背景音乐
        if (this.audioManager && this.audioManager.playBGM) {
            this.audioManager.playBGM();
        }
        
        // 启动游戏循环
        this.gameLoop();
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        this.startGame();
    }
    
    /**
     * 游戏结束
     */
    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        
        // 播放游戏结束音效
        if (this.audioManager && this.audioManager.playGameOver) {
            this.audioManager.playGameOver();
        }
        
        // 停止背景音乐
        if (this.audioManager && this.audioManager.stopBGM) {
            this.audioManager.stopBGM();
        }
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
        }
        
        // 显示游戏结束界面
        this.renderer.showGameOver(this.score, this.highScore);
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        // 计算时间增量
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 更新游戏逻辑
        this.update(deltaTime);
        
        // 渲染
        this.render();
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 更新游戏状态
     */
    update(deltaTime) {
        // 更新玩家
        this.player.update(this.input);
        
        // 更新障碍物
        this.obstacleManager.update(deltaTime);
        
        // 碰撞检测
        if (this.obstacleManager.checkCollision(this.player)) {
            // 播放碰撞音效
            if (this.audioManager && this.audioManager.playHit) {
                this.audioManager.playHit();
            }
            this.gameOver();
            return;
        }
        
        // 更新分数（基于存活时间）
        const newScore = Math.floor((Date.now() - this.startTime) / 100);
        if (newScore > this.score && newScore - this.score >= 10) {
            // 每增加 10 分播放一次得分音效
            if (this.audioManager && this.audioManager.playScore) {
                this.audioManager.playScore();
            }
        }
        this.score = newScore;
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        this.renderer.render(
            this.player,
            this.obstacleManager,
            this.score,
            this.highScore
        );
    }
    
    /**
     * 加载最高分
     */
    loadHighScore() {
        const saved = localStorage.getItem('actionGameHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }
    
    /**
     * 保存最高分
     */
    saveHighScore(score) {
        localStorage.setItem('actionGameHighScore', score.toString());
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // 暴露到全局以便调试
    window.game = game;
});
