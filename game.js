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
    gameContainer.addEventListener('click', (event) => {
        if (!gameRunning) return;

        const playerCenter = player.offsetWidth / 2;
        const targetX = event.clientX - playerCenter;
        const targetY = event.clientY - playerCenter;

        player.style.left = `${targetX}px`;
        player.style.top = `${targetY}px`;
    });
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2}px`;
    bullet.style.top = `${player.offsetTop}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
    return bullet;
}

function fireBullet() {
    if (!gameRunning) return;

    const bullet = createBullet();
    const bulletInterval = setInterval(() => {
        bullet.style.top = `${bullet.offsetTop - 5}px`;

        // Check for bullet collision with aliens
        for (let alien of aliens) {
            if (isCollision(bullet, alien)) {
                createExplosion(alien.offsetLeft, alien.offsetTop);
                alien.remove();
                aliens = aliens.filter(a => a !== alien);
                bullet.remove();
                bullets = bullets.filter(b => b !== bullet);
                updateScore();
                clearInterval(bulletInterval);
                break;
            }
        }

        // Remove bullet if it goes off screen
        if (bullet.offsetTop < 0) {
            bullet.remove();
            bullets = bullets.filter(b => b !== bullet);
            clearInterval(bulletInterval);
        }
    }, 10);
}

function isCollision(bullet, alien) {
    const bulletRect = bullet.getBoundingClientRect();
    const alienRect = alien.getBoundingClientRect();
    return !(
        bulletRect.top > alienRect.bottom ||
        bulletRect.bottom < alienRect.top ||
        bulletRect.right < alienRect.left ||
        bulletRect.left > alienRect.right
    );
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.style.width = '50px';
    explosion.style.height = '50px';
    explosion.style.backgroundImage = 'url(explosion.gif)';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.position = 'absolute';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    gameContainer.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 500);
}

function spawnAliens() {
    if (!gameRunning) return;

    const alien = document.createElement('div');
    alien.className = 'alien';
    alien.style.left = `${Math.random() * (gameContainer.offsetWidth - 75)}px`;
    alien.style.top = `-75px`;
    gameContainer.appendChild(alien);
    aliens.push(alien);

    const alienInterval = setInterval(() => {
        alien.style.top = `${alien.offsetTop + 1}px`;

        if (alien.offsetTop > gameContainer.offsetHeight) {
            alien.remove();
            aliens = aliens.filter(a => a !== alien);
            clearInterval(alienInterval);
            endGame();
        }
    }, 10);

    setTimeout(spawnAliens, 2000); // Adjust alien spawn rate as needed
}

function updateScore() {
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
}

gameContainer.addEventListener('click', fireBullet);
