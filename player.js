/**
 * Player.js - 玩家控制模块
 * 处理玩家角色的移动和渲染
 */

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // 玩家尺寸
        this.width = 50;
        this.height = 50;
        
        // 玩家位置（底部中央）
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 20;
        
        // 移动速度
        this.speed = 8;
        this.velocityX = 0;
        
        // 颜色
        this.color = '#4a9eff';
        
        // 触摸控制
        this.touchStartX = 0;
        this.isTouching = false;
    }
    
    /**
     * 更新玩家位置
     * @param {Object} input - 输入状态 {left: boolean, right: boolean}
     */
    update(input) {
        // 键盘控制
        if (input.left) {
            this.velocityX = -this.speed;
        } else if (input.right) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }
        
        // 应用移动
        this.x += this.velocityX;
        
        // 边界检测
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    }
    
    /**
     * 处理触摸开始
     * @param {number} deltaX - 水平移动距离
     */
    handleTouchMove(deltaX) {
        this.x += deltaX;
        // 边界检测
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    }
    
    /**
     * 渲染玩家
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    render(ctx) {
        // 绘制玩家主体（带渐变效果）
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x + this.width, this.y + this.height
        );
        gradient.addColorStop(0, '#4a9eff');
        gradient.addColorStop(1, '#2a7fde');
        
        ctx.fillStyle = gradient;
        
        // 圆角矩形
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 8);
        ctx.fill();
        
        // 绘制眼睛（增加趣味性）
        ctx.fillStyle = '#fff';
        const eyeSize = 8;
        const eyeOffsetX = 12;
        const eyeOffsetY = 15;
        
        // 左眼
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 右眼
        ctx.beginPath();
        ctx.arc(this.x + this.width - eyeOffsetX, this.y + eyeOffsetY, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#000';
        const pupilSize = 4;
        
        // 左瞳孔
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX + 2, this.y + eyeOffsetY, pupilSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 右瞳孔
        ctx.beginPath();
        ctx.arc(this.x + this.width - eyeOffsetX - 2, this.y + eyeOffsetY, pupilSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 绘制圆角矩形辅助方法
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
    
    /**
     * 重置玩家位置
     */
    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.velocityX = 0;
    }
}
