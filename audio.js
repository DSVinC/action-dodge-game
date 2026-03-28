/**
 * Audio.js - 音效管理器
 * 使用 Web Audio API 生成合成音效，无需外部文件
 */

class AudioManager {
    constructor() {
        // 初始化 AudioContext
        this.audioCtx = null;
        this.isMuted = false;
        this.isInitialized = false;
        
        // 背景音乐状态
        this.bgmOscillator = null;
        this.bgmGain = null;
        this.isBGMPlaying = false;
        this.bgmInterval = null;  // 节奏定时器（旧版）
        this.bgmTimeout = null;   // 旋律定时器（新版）
        this.bgmNotes = [];       // 音符序列
        this.bgmNoteIndex = 0;    // 当前音符索引
        this.bpm = 120;           // 节奏速度（每分钟 120 拍）
        
        // 音效配置
        this.soundConfig = {
            hit: {
                frequency: 150,
                duration: 0.1,
                type: 'square'
            },
            score: {
                frequency: 600,
                duration: 0.2,
                type: 'sine'
            },
            gameover: {
                frequency: 100,
                duration: 0.5,
                type: 'sawtooth'
            }
        };
    }
    
    /**
     * 初始化 AudioContext（需要在用户交互后调用）
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            console.log('🔊 Audio manager initialized');
        } catch (e) {
            console.warn('⚠️ Audio context not supported:', e);
        }
    }
    
    /**
     * 播放一拍"嘟"声（用于节奏 BGM）
     */
    playBeat() {
        if (!this.audioCtx || this.isMuted) return;
        
        // 播放一拍"嘟"声
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // 正弦波产生柔和的"嘟"声
        oscillator.type = 'sine';
        oscillator.frequency.value = 523;  // C5 音符（523Hz）
        
        // 音量包络：快速衰减产生短促的"嘟"声
        gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }
    
    /**
     * 播放音效
     * @param {string} type - 音效类型：'hit', 'score', 'gameover'
     */
    playSound(type) {
        if (this.isMuted) return;
        if (!this.isInitialized) this.init();
        if (!this.audioCtx) return;
        
        // 碰撞音效使用特殊的双振荡器"叮咚"声
        if (type === 'hit') {
            this.playHitSound();
            return;
        }
        
        const config = this.soundConfig[type];
        if (!config) {
            console.warn('Unknown sound type:', type);
            return;
        }
        
        // 创建振荡器
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // 设置音效参数
        oscillator.type = config.type;
        oscillator.frequency.value = config.frequency;
        
        // 设置音量包络（避免爆音）
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + config.duration);
        
        // 播放音效
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + config.duration);
        
        console.log(`🔊 Playing sound: ${type}`);
    }
    
    /**
     * 播放碰撞音效 - 清脆的"叮咚"声（双振荡器）
     */
    playHitSound() {
        if (!this.audioCtx || this.isMuted) return;
        
        // "叮咚"声：双振荡器 + 高频
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // 主频率：880Hz (A5) - 清脆的"叮"
        osc1.type = 'sine';
        osc1.frequency.value = 880;
        
        // 泛音：1174Hz (D6) - 增加"咚"的质感
        osc2.type = 'triangle';
        osc2.frequency.value = 1174;
        
        // 音量包络：快速衰减
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc1.start(this.audioCtx.currentTime);
        osc2.start(this.audioCtx.currentTime);
        osc1.stop(this.audioCtx.currentTime + 0.3);
        osc2.stop(this.audioCtx.currentTime + 0.3);
        
        console.log('🔔 Hit sound played (ding-dong)');
    }
    
    /**
     * 播放碰撞音效
     */
    playHit() {
        this.playSound('hit');
    }
    
    /**
     * 播放得分音效
     */
    playScore() {
        this.playSound('score');
    }
    
    /**
     * 播放游戏结束音效
     */
    playGameOver() {
        this.playSound('gameover');
    }
    
    /**
     * 播放背景音乐 - 超级马里奥风格 8-bit 旋律
     */
    playBGM() {
        if (!this.audioCtx) {
            this.init();
        }
        
        if (this.isBGMPlaying || !this.audioCtx) return;
        
        this.isBGMPlaying = true;
        this.bgmNoteIndex = 0;
        
        // 超级马里奥地下关卡风格旋律（简化版 8-bit）
        this.bgmNotes = [
            // 主旋律 - 欢快的 C 大调进行曲
            { freq: 293.66, duration: 0.2 },  // D4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 293.66, duration: 0.2 },  // D4
            { freq: 329.63, duration: 0.2 },  // E4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 293.66, duration: 0.2 },  // D4
            { freq: 329.63, duration: 0.4 },  // E4
            // 第二小节
            { freq: 349.23, duration: 0.2 },  // F4
            { freq: 329.63, duration: 0.2 },  // E4
            { freq: 329.63, duration: 0.2 },  // E4
            { freq: 349.23, duration: 0.2 },  // F4
            { freq: 392.00, duration: 0.2 },  // G4
            { freq: 329.63, duration: 0.2 },  // E4
            { freq: 349.23, duration: 0.2 },  // F4
            { freq: 392.00, duration: 0.4 },  // G4
            // 第三小节
            { freq: 392.00, duration: 0.15 }, // G4
            { freq: 440.00, duration: 0.15 }, // A4
            { freq: 392.00, duration: 0.15 }, // G4
            { freq: 440.00, duration: 0.15 }, // A4
            { freq: 466.16, duration: 0.15 }, // A#4
            { freq: 440.00, duration: 0.15 }, // A4
            { freq: 392.00, duration: 0.3 },  // G4
            { freq: 349.23, duration: 0.2 },  // F4
            // 第四小节
            { freq: 329.63, duration: 0.2 },  // E4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 293.66, duration: 0.2 },  // D4
            { freq: 329.63, duration: 0.4 },  // E4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 261.63, duration: 0.2 },  // C4
            { freq: 196.00, duration: 0.4 },  // G3
        ];
        
        // 立即播放第一个音符
        this.playNextNote();
        
        console.log('🎵 Mario-style 8-bit BGM started');
    }
    
    /**
     * 播放下一个音符（马里奥风格旋律）
     */
    playNextNote() {
        if (!this.isBGMPlaying || !this.audioCtx) return;
        
        const note = this.bgmNotes[this.bgmNoteIndex];
        
        // 创建振荡器播放音符
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        // 8-bit 风格：方波（square wave）
        oscillator.type = 'square';
        oscillator.frequency.value = note.freq;
        
        // 音量包络：快速衰减产生芯片音乐效果
        gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + note.duration);
        
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + note.duration);
        
        // 播放下一个音符
        this.bgmNoteIndex = (this.bgmNoteIndex + 1) % this.bgmNotes.length;
        this.bgmTimeout = setTimeout(() => {
            this.playNextNote();
        }, note.duration * 1000);
    }
    
    /**
     * 停止背景音乐
     */
    stopBGM() {
        // 清除旋律定时器
        if (this.bgmTimeout) {
            clearTimeout(this.bgmTimeout);
            this.bgmTimeout = null;
        }
        // 清除旧版节奏定时器（兼容）
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.isBGMPlaying = false;
        console.log('🔇 BGM stopped');
    }
    
    /**
     * 切换静音
     * @returns {boolean} 新的静音状态
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // 同步更新 BGM 音量
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.isMuted ? 0 : 0.1;
        }
        
        console.log(`🔇 Mute: ${this.isMuted ? 'ON' : 'OFF'}`);
        return this.isMuted;
    }
    
    /**
     * 设置静音状态
     * @param {boolean} muted - 静音状态
     */
    setMute(muted) {
        this.isMuted = muted;
    }
    
    /**
     * 获取静音状态
     * @returns {boolean} 当前静音状态
     */
    getMute() {
        return this.isMuted;
    }
}

// 创建全局实例
window.audioManager = new AudioManager();
