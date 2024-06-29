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
    endingVideo.style.display = 'block';
    endingVideo.play();
}

function handlePlayerMovement() {
    gameContainer.addEventListener('mousemove', (event) => {
        const x = event.clientX - gameContainer.offsetLeft;
        movePlayer(x);
    });

    gameContainer.addEventListener('touchmove', (event) => {
        const x = event.touches[0].clientX - gameContainer.offsetLeft;
        movePlayer(x);
    });

    function movePlayer(x) {
        const playerHalfWidth = player.offsetWidth / 2;
        const gameContainerWidth = gameContainer.offsetWidth;
        let positionX = x - playerHalfWidth;
        positionX = Math.max(positionX, 0);
        positionX = Math.min(positionX, gameContainerWidth - player.offsetWidth);
        player.style.left = `${positionX}px`;
    }
}

function spawnAliens() {
    const alienInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(alienInterval);
            return;
        }
        const alien = document.createElement('div');
        alien.classList.add('alien');
        alien.style.left = `${Math.random() * (gameContainer.offsetWidth - 75)}px`;
        gameContainer.appendChild(alien);
        aliens.push(alien);

        moveAlien(alien);

        function moveAlien(alien) {
            let alienPosition = 0;
            const moveAlienInterval = setInterval(() => {
                if (alienPosition > gameContainer.offsetHeight) {
                    clearInterval(moveAlienInterval);
                    alien.remove();
                    aliens = aliens.filter(a => a !== alien);
                } else {
                    alienPosition += 5;
                    alien.style.top = `${alienPosition}px`;
                    checkCollision(alien);
                }
            }, 30);
        }
    }, 2000);
}

function shootBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${parseInt(player.style.left) + player.offsetWidth / 2 - 5}px`;
    bullet.style.bottom = `${player.offsetHeight}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);

    moveBullet(bullet);

    function moveBullet(bullet) {
        let bulletPosition = player.offsetHeight;
        const moveBulletInterval = setInterval(() => {
            if (bulletPosition < 0) {
                clearInterval(moveBulletInterval);
                bullet.remove();
                bullets = bullets.filter(b => b !== bullet);
            } else {
                bulletPosition -= 10;
                bullet.style.bottom = `${bulletPosition}px`;
                checkCollision(bullet);
            }
        }, 15);
    }
}

function checkCollision(item) {
    const itemRect = item.getBoundingClientRect();
    aliens.forEach(alien => {
        const alienRect = alien.getBoundingClientRect();
        if (itemRect.bottom >= alienRect.top &&
            itemRect.top <= alienRect.bottom &&
            itemRect.right >= alienRect.left &&
            itemRect.left <= alienRect.right) {
            // Collision detected
            handleCollision(alien);
            item.remove();
            if (item.classList.contains('bullet')) {
                bullets = bullets.filter(b => b !== item);
            }
        }
    });
}

function handleCollision(alien) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.left = `${parseInt(alien.style.left) + alien.offsetWidth / 2 - 50}px`;
    explosion.style.top = `${parseInt(alien.style.top) + alien.offsetHeight / 2 - 50}px`;
    gameContainer.appendChild(explosion);
    setTimeout(() => {
        explosion.remove();
    }, 1000);

    alien.remove();
    aliens = aliens.filter(a => a !== alien);

    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    if (aliens.length === 0) {
        endGame();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        shootBullet();
    }
});

document.addEventListener('touchstart', () => {
    shootBullet();
});
