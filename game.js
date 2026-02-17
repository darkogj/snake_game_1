// Modern Snake Game - JavaScript

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('score-value');
const highScoreValue = document.getElementById('high-score-value');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100;

// Game state
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;

// Initialize high score display
highScoreValue.textContent = highScore;

// Snake colors
const snakeHeadColor = '#00d4ff';
const snakeBodyColor = '#0099cc';
const snakeBodyAltColor = '#006688';
const foodColor = '#ff6b6b';
const foodGlowColor = 'rgba(255, 107, 107, 0.4)';
const gridColor = 'rgba(255, 255, 255, 0.02)';

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreValue.textContent = score;
    generateFood();
    draw();
}

// Generate food at random position
function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

// Draw the game
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw food with glow
    drawFood();
    
    // Draw snake
    drawSnake();
}

// Draw grid lines
function drawGrid() {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

// Draw food with glow effect
function drawFood() {
    // Glow effect
    ctx.shadowColor = foodColor;
    ctx.shadowBlur = 15;
    
    // Food circle
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
        food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
        GRID_SIZE / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Draw snake
function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const isEven = index % 2 === 0;
        
        // Shadow for depth
        ctx.shadowColor = isHead ? snakeHeadColor : 'transparent';
        ctx.shadowBlur = isHead ? 10 : 0;
        
        // Main body
        ctx.fillStyle = isHead ? snakeHeadColor : 
                        (isEven ? snakeBodyColor : snakeBodyAltColor);
        
        // Rounded rectangle
        const x = segment.x * GRID_SIZE + 1;
        const y = segment.y * GRID_SIZE + 1;
        const size = GRID_SIZE - 2;
        const radius = isHead ? 8 : 5;
        
        roundRect(ctx, x, y, size, size, radius);
        ctx.fill();
        
        // Eyes for head
        if (isHead) {
            ctx.shadowBlur = 0;
            drawEyes(segment);
        }
    });
    
    ctx.shadowBlur = 0;
}

// Draw snake eyes
function drawEyes(head) {
    const centerX = head.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = head.y * GRID_SIZE + GRID_SIZE / 2;
    const eyeOffset = 4;
    const eyeSize = 3;
    
    ctx.fillStyle = '#1a1a2e';
    
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction.x === 1) {
        eye1X = centerX + eyeOffset; eye1Y = centerY - eyeOffset;
        eye2X = centerX + eyeOffset; eye2Y = centerY + eyeOffset;
    } else if (direction.x === -1) {
        eye1X = centerX - eyeOffset; eye1Y = centerY - eyeOffset;
        eye2X = centerX - eyeOffset; eye2Y = centerY + eyeOffset;
    } else if (direction.y === -1) {
        eye1X = centerX - eyeOffset; eye1Y = centerY - eyeOffset;
        eye2X = centerX + eyeOffset; eye2Y = centerY - eyeOffset;
    } else {
        eye1X = centerX - eyeOffset; eye1Y = centerY + eyeOffset;
        eye2X = centerX + eyeOffset; eye2Y = centerY + eyeOffset;
    }
    
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
}

// Helper function to draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
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

// Update game state
function update() {
    direction = { ...nextDirection };
    
    // Calculate new head position
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= TILE_COUNT ||
        newHead.y < 0 || newHead.y >= TILE_COUNT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreValue.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreValue.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        generateFood();
    } else {
        // Remove tail
        snake.pop();
    }
    
    draw();
}

// Game loop
function gameStep() {
    if (!gamePaused) {
        update();
    }
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        overlay.classList.add('hidden');
        initGame();
        gameLoop = setInterval(gameStep, GAME_SPEED);
    }
}

// Pause game
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (gamePaused) {
            overlayTitle.textContent = 'PAUSED';
            overlaySubtitle.textContent = 'Press SPACE to Resume';
            overlay.classList.remove('hidden');
            pauseBtn.textContent = 'Resume';
        } else {
            overlay.classList.add('hidden');
            pauseBtn.textContent = 'Pause';
        }
    }
}

// Restart game
function restartGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    gamePaused = false;
    overlayTitle.textContent = 'Press SPACE to Start';
    overlaySubtitle.textContent = 'Use Arrow Keys or WASD to move';
    overlay.classList.remove('hidden');
    pauseBtn.textContent = 'Pause';
    initGame();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    overlayTitle.textContent = 'Game Over!';
    overlaySubtitle.textContent = `Final Score: ${score} | Press SPACE to Restart`;
    overlay.classList.remove('hidden');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
        case ' ':
            e.preventDefault();
            if (!gameRunning) {
                startGame();
            } else {
                togglePause();
            }
            break;
    }
});

// Button controls
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Initialize display
initGame();
