/**
 * Obstacle.js - 障碍物模块
 * 处理障碍物的生成、移动和碰撞检测
 */

class Obstacle {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        
        // 障碍物尺寸（随机宽度）
        this.width = this.randomRange(40, 80);
        this.height = this.randomRange(20, 40);
        
        // 随机 X 位置
        this.x = this.randomRange(0, canvasWidth - this.width);
        this.y = -this.height; // 从屏幕顶部外开始
        
        // 下落速度（随时间递增）
        this.speed = this.randomRange(3, 6);
        
        // 颜色
        this.color = '#ff4a4a';
        
        // 是否已移除
        this.markedForRemoval = false;
    }
    
    /**
     * 生成随机数
     */
    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 更新障碍物位置
     * @param {number} deltaTime - 时间增量
     * @param {number} difficultyMultiplier - 难度系数（随时间增加）
     */
    update(deltaTime, difficultyMultiplier = 1) {
        this.y += this.speed * difficultyMultiplier;
        
        // 如果完全离开屏幕底部，标记为移除
        if (this.y > this.canvasWidth * 1.5) { // 使用 canvasWidth 作为高度参考
            this.markedForRemoval = true;
        }
    }
    
    /**
     * 渲染障碍物
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    render(ctx) {
        // 绘制障碍物主体（带渐变）
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ff4a4a');
        
        ctx.fillStyle = gradient;
        
        // 绘制矩形（带圆角）
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 5);
        ctx.fill();
        
        // 添加警示条纹效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        const stripeWidth = 8;
        for (let i = 0; i < this.width; i += stripeWidth * 2) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i + stripeWidth, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.lineTo(this.x + i - stripeWidth, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    /**
     * 绘制圆角矩形
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    /**
     * 获取碰撞盒
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

/**
 * 障碍物管理器
 * 管理多个障碍物的生成和更新
 */
class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1000; // 初始生成间隔（毫秒）
        this.difficultyMultiplier = 1;
    }
    
    /**
     * 更新所有障碍物
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        // 生成新障碍物
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.obstacles.push(new Obstacle(this.canvasWidth));
            
            // 随着时间推移，增加生成频率
            this.spawnInterval = Math.max(400, this.spawnInterval - 20);
            
            // 增加难度
            this.difficultyMultiplier += 0.02;
        }
        
        // 更新现有障碍物
        for (const obstacle of this.obstacles) {
            obstacle.update(deltaTime, this.difficultyMultiplier);
        }
        
        // 移除离开屏幕的障碍物
        this.obstacles = this.obstacles.filter(obs => !obs.markedForRemoval);
    }
    
    /**
     * 渲染所有障碍物
     */
    render(ctx) {
        for (const obstacle of this.obstacles) {
            obstacle.render(ctx);
        }
    }
    
    /**
     * 检测与玩家的碰撞
     * @param {Player} player - 玩家对象
     * @returns {boolean} 是否发生碰撞
     */
    checkCollision(player) {
        const playerBounds = player.getBounds();
        
        for (const obstacle of this.obstacles) {
            const obsBounds = obstacle.getBounds();
            
            // AABB 碰撞检测
            if (
                playerBounds.x < obsBounds.x + obsBounds.width &&
                playerBounds.x + playerBounds.width > obsBounds.x &&
                playerBounds.y < obsBounds.y + obsBounds.height &&
                playerBounds.y + playerBounds.height > obsBounds.y
            ) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 重置障碍物管理器
     */
    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1000;
        this.difficultyMultiplier = 1;
    }
    
    /**
     * 获取当前障碍物数量
     */
    getCount() {
        return this.obstacles.length;
    }
}
