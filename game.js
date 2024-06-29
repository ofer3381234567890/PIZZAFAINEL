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
let slideshowTimer;

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

    setTimeout(() => {
        openingSlideshow.style.display = 'none';
        loadingMessage.style.display = 'none';
        if (!gameRunning) {
            startGame();
        }
    }, video.duration * 1000);
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
        restartGameButton.style.display = 'block';
    });
}

function spawnAliens() {
    const alien = document.createElement('div');
    alien.className = 'alien';
    alien.style.left = `${Math.random() * (gameContainer.clientWidth - 75)}px`;
    aliens.push(alien);
    gameContainer.appendChild(alien);

    setTimeout(() => {
        if (gameRunning) {
            moveAlien(alien);
        }
    }, 1000 + Math.random() * 3000);
}

function moveAlien(alien) {
    const speed = 1 + Math.random() * 2;
    const interval = setInterval(() => {
        if (gameRunning) {
            const alienRect = alien.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            if (alienRect.top > window.innerHeight) {
                clearInterval(interval);
                alien.remove();
                const index = aliens.indexOf(alien);
                if (index !== -1) {
                    aliens.splice(index, 1);
                }
                if (gameRunning) {
                    spawnAliens();
                }
            } else {
                alien.style.top = `${alien.offsetTop + speed}px`;
                // Check for collision with player
                if (checkCollision(alien, player)) {
                    clearInterval(interval);
                    endGame();
                }
            }
        } else {
            clearInterval(interval);
        }
    }, 10);
}

function handlePlayerMovement() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            movePlayer('left');
        } else if (event.key === 'ArrowRight') {
            movePlayer('right');
        } else if (event.key === ' ') {
            shoot();
        }
    });

    gameContainer.addEventListener('click', (event) => {
        if (event.target === gameContainer) {
            shoot();
        }
    });
}

function movePlayer(direction) {
    const playerRect = player.getBoundingClientRect();
    if (direction === 'left' && playerRect.left > 0) {
        player.style.transform = 'translateX(-100%)';
    } else if (direction === 'right' && playerRect.right < gameContainer.clientWidth) {
        player.style.transform = 'translateX(0)';
    }
}

function shoot() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    const playerRect = player.getBoundingClientRect();
    bullet.style.left = `${playerRect.left + playerRect.width / 2 - 5}px`;
    bullet.style.bottom = `${playerRect.bottom}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);

    const interval = setInterval(() => {
        if (gameRunning) {
            bullet.style.bottom = `${bullet.offsetTop + 10}px`;
            const bulletRect = bullet.getBoundingClientRect();

            // Check for collision with aliens
            aliens.forEach((alien, index) => {
                if (checkCollision(bullet, alien)) {
                    clearInterval(interval);
                    bullet.remove();
                    bullets.splice(bullets.indexOf(bullet), 1);
                    alien.remove();
                    aliens.splice(index, 1);
                    score++;
                    scoreDisplay.textContent = `Score: ${score}`;
                    // Add explosion effect
                    const explosion = document.createElement('img');
                    explosion.src = 'explosion.gif';
                    explosion.className = 'explosion';
                    explosion.style.position = 'absolute';
                    explosion.style.width = '100px';
                    explosion.style.height = '100px';
                    explosion.style.left = `${alien.getBoundingClientRect().left}px`;
                    explosion.style.top = `${alien.getBoundingClientRect().top}px`;
                    gameContainer.appendChild(explosion);
                    setTimeout(() => {
                        explosion.remove();
                    }, 1000);
                }
            });

            // Remove bullet if it goes out of view
            if (bulletRect.bottom < 0) {
                clearInterval(interval);
                bullet.remove();
                bullets.splice(bullets.indexOf(bullet), 1);
            }
        } else {
            clearInterval(interval);
            bullet.remove();
            bullets.splice(bullets.indexOf(bullet), 1);
        }
    }, 10);
}

function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}
