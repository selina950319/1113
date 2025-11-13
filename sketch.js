let particles = [];
let flashAlpha = 0;
let textScale = 0;
let textAlpha = 0;
let effectTimer = 0;

function setup() {
    createCanvas(400, 400);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}

function draw() {
    background(220);

    // 更新並繪製彩帶粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) particles.splice(i, 1);
    }

    // 畫一個擴散光圈
    if (effectTimer > 0) {
        push();
        noFill();
        let r = map(effectTimer, 0, 1, 60, 300);
        stroke(255, 220, 120, 160 * effectTimer);
        strokeWeight(4 * effectTimer);
        ellipse(width / 2, height / 2, r);
        pop();
    }

    // 畫閃白遮罩（blendMode 後要恢復）
    if (flashAlpha > 0) {
        push();
        blendMode(ADD);
        noStroke();
        fill(255, 255, 255, flashAlpha);
        rect(width / 2, height / 2, width * 2, height * 2);
        pop();
        flashAlpha = max(0, flashAlpha - 8); // 逐漸褪去
    }

    // 畫放大且發光的文字
    if (textAlpha > 0) {
        push();
        translate(width / 2, height / 2);
        // glow: 多層半透明重疊
        blendMode(ADD);
        for (let i = 6; i >= 1; i--) {
            fill(255, 240, 180, textAlpha * (i / 8));
            textSize(48 * (textScale + i * 0.02));
            textStyle(BOLD);
            text('Correct!', 0, -10);
        }
        // 主文字（正常模式）
        blendMode(BLEND);
        fill(30, 120, 50, textAlpha * 255);
        textSize(48 * textScale);
        text('Correct!', 0, -10);
        pop();

        // 漸變參數
        textScale = lerp(textScale, 1.0, 0.08);
        textAlpha = max(0, textAlpha - 0.02);
        effectTimer = max(0, effectTimer - 0.02);
    }
}

function triggerCorrect() {
    // 閃光
    flashAlpha = 220;

    // 文字初始放大與透明度
    textScale = 1.6;
    textAlpha = 1.0;
    effectTimer = 1.0;

    // 生成彩帶粒子（中心向四周噴發）
    let count = 80;
    for (let i = 0; i < count; i++) {
        let a = random(TWO_PI);
        let speed = random(2, 8);
        let vx = cos(a) * speed + random(-1, 1);
        let vy = sin(a) * speed + random(-1, 1) - 1.5; // 偏向上方
        let size = random(6, 14);
        let col = color(random(40, 255), random(40, 255), random(40, 255));
        particles.push(new Confetti(createVector(width / 2 + random(-10,10), height / 2 + random(-10,10)), createVector(vx, vy), size, col));
    }
}

// 按 C 測試特效
function keyPressed() {
    if (key === 'c' || key === 'C') {
        triggerCorrect();
    }
}

// 簡單的彩帶粒子類
class Confetti {
    constructor(pos, vel, size, col) {
        this.pos = pos.copy();
        this.vel = vel.copy();
        this.size = size;
        this.col = col;
        this.life = 1.0;
        this.rot = random(TWO_PI);
        this.rotSpeed = random(-0.2, 0.2);
        this.gravity = 0.18;
    }

    update() {
        this.vel.y += this.gravity;
        this.pos.add(this.vel);
        this.rot += this.rotSpeed;
        this.life -= 0.016 + random(0, 0.01);
    }

    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rot);
        noStroke();
        fill(red(this.col), green(this.col), blue(this.col), 255 * constrain(this.life, 0, 1));
        rect(0, 0, this.size, this.size * 0.6);
        pop();
    }

    isDead() {
        return this.life <= 0 || this.pos.y > height + 50;
    }
}
