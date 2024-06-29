const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const startGameButton = document.getElementById('startGameButton');
const restartGameButton = document.getElementById('restartGameButton');
const scoreDisplay = document.getElementById('score');
const openingSlideshow = document.getElementById('openingSlideshow');
const endingVideo = document.getElementById('endingVideo');
const loadingMessage = document.getElementById('loadingMessage');
const backgroundMusic = document.getElementById('backgroundMusic');
const endMessage = document.getElementById('endMessage');
let bullets = [];
let aliens = [];
let score = 0;
let gameRunning = false;

startGameButton.addEventListener('click', () => {
    startGameButton.style.display = 'none';
    loadingMessage.style.display = 'block';
    playOpeningSlideshow();
});

restartGameButton.addEventListener('click', () => {
    restartGame();
});

function restartGame() {
    gameRunning = true;
    restartGameButton.style.display = 'none';
    endMessage.style.display = 'none';
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    while (bullets.length > 0) {
        bullets.pop().remove();
    }
    while (aliens.length > 0) {
        aliens.pop().remove();
    }
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

function playOpeningSlideshow() {
    openingSlideshow.style.display = 'block';
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    const video = openingSlideshow.querySelector('video');
    video.play();

    video.addEventListener('ended', () => {
        openingSlideshow.style.display = 'none';
        loadingMessage.style.display = 'none';
        if (!gameRunning) {
            startGame();
        }
    });
}

function startGame() {
    gameRunning = true;
    backgroundMusic.play();
    spawnAliens();
    handlePlayerMovement();

    // Start ending video after 8 seconds if game is not restarted
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
        }
    }, 8000);
}

function endGame() {
    gameRunning = false;
    backgroundMusic.pause();
    endMessage.style.display = 'block';
    restartGameButton.style.display = 'block';
    scoreDisplay.style.fontSize = '36px';
    scoreDisplay.style.backgroundColor = 'orange';

    // Show ending video and restart button after 8 seconds
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
            restartGameButton.style.display = 'block';
        }
    }, 8000);
}

function playEndingVideo() {
    gameRunning = false;
    endingVideo.style.display = 'block';
    endingVideo.play();
    endingVideo.addEventListener('ended', () => {
        endingVideo.style.display = 'none';
    });
}

function handlePlayerMovement() {
    let playerX = window.innerWidth / 2;
    let isShooting = false;

    function updatePlayerPosition(event) {
        if (!gameRunning) return;
        playerX = event.clientX;
        player.style.transform = `translateX(${playerX}px)`;
    }

    function shootBullet() {
        if (!gameRunning || isShooting) return;
        isShooting = true;
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = `${playerX}px`;
        gameContainer.appendChild(bullet);
        bullets.push(bullet);

        moveBullet(bullet);
    }

    function moveBullet(bullet) {
        if (!gameRunning) return;
        let bulletY = window.innerHeight - 200;
        const bulletMoveInterval = setInterval(() => {
            bulletY -= 10;
            bullet.style.top = `${bulletY}px`;

            // Check for collision with aliens
            for (let i = 0; i < aliens.length; i++) {
                const alien = aliens[i];
                if (isCollision(bullet, alien)) {
                    handleCollision(bullet, alien);
                    return;
                }
            }

            // Remove bullet if it goes offscreen
            if (bulletY < -20) {
                clearInterval(bulletMoveInterval);
                bullet.remove();
                bullets.splice(bullets.indexOf(bullet), 1);
                isShooting = false;
            }
        }, 30);
    }

    function spawnAliens() {
        if (!gameRunning) return;
        const alien = document.createElement('div');
        alien.className = 'alien';
        const alienX = Math.random() * window.innerWidth;
        alien.style.left = `${alienX}px`;
        gameContainer.appendChild(alien);
        aliens.push(alien);

        moveAlien(alien);
    }

    function moveAlien(alien) {
        if (!gameRunning) return;
        let alienY = 0;
        const alienMoveInterval = setInterval(() => {
            alienY += 5;
            alien.style.top = `${alienY}px`;

            // Check for collision with player
            if (isCollision(player, alien)) {
                handleGameOver();
                return;
            }

            // Remove alien if it goes offscreen
            if (alienY > window.innerHeight) {
                clearInterval(alienMoveInterval);
                alien.remove();
                aliens.splice(aliens.indexOf(alien), 1);
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        }, 30);
    }

    function handleCollision(bullet, alien) {
        bullet.remove();
        bullets.splice(bullets.indexOf(bullet), 1);
        alien.remove();
        aliens.splice(aliens.indexOf(alien), 1);
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        showExplosion(alien);
    }

    function showExplosion(alien) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = alien.style.left;
        explosion.style.top = alien.style.top;
        gameContainer.appendChild(explosion);
        setTimeout(() => {
            explosion.remove();
        }, 1000);
    }

    function isCollision(obj1, obj2) {
        const rect1 = obj1.getBoundingClientRect();
        const rect2 = obj2.getBoundingClientRect();
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }

    window.addEventListener('mousemove', updatePlayerPosition);
    window.addEventListener('click', shootBullet);
}

// Start the game initially
startGameButton.style.display = 'block';
