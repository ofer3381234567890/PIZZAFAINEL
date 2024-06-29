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
    endingVideo.style.display = 'block';
    endingVideo.currentTime = 0;
    endingVideo.play();
    endingVideo.addEventListener('ended', () => {
        endingVideo.style.display = 'none';
        restartGameButton.style.display = 'block';
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        const bullet = createBullet();
        bullets.push(bullet);
        gameContainer.appendChild(bullet);
    }
});

function handlePlayerMovement() {
    document.addEventListener('mousemove', (event) => {
        player.style.left = `${event.clientX}px`;
    });
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${parseInt(player.style.left) + 75 / 2}px`;
    bullet.style.bottom = '200px';
    moveBullet(bullet);
    return bullet;
}

function moveBullet(bullet) {
    const interval = setInterval(() => {
        bullet.style.bottom = `${parseInt(bullet.style.bottom) + 10}px`;
        checkCollision(bullet);
        if (parseInt(bullet.style.bottom) > window.innerHeight) {
            clearInterval(interval);
            bullet.remove();
        }
    }, 50);
}

function spawnAliens() {
    setInterval(() => {
        const alien = createAlien();
        aliens.push(alien);
        gameContainer.appendChild(alien);
        moveAlien(alien);
    }, 2000);
}

function createAlien() {
    const alien = document.createElement('div');
    alien.className = 'alien';
    const alienX = Math.floor(Math.random() * (window.innerWidth - 75));
    alien.style.left = `${alienX}px`;
    alien.style.top = '0px';
    return alien;
}

function moveAlien(alien) {
    const interval = setInterval(() => {
        alien.style.top = `${parseInt(alien.style.top) + 10}px`;
        if (parseInt(alien.style.top) > window.innerHeight) {
            clearInterval(interval);
            alien.remove();
        }
        checkPlayerCollision(alien);
    }, 50);
}

function checkPlayerCollision(alien) {
    const playerRect = player.getBoundingClientRect();
    const alienRect = alien.getBoundingClientRect();
    if (isCollision(playerRect, alienRect)) {
        endGame();
    }
}

function checkCollision(bullet) {
    aliens.forEach((alien, alienIndex) => {
        if (isCollision(bullet, alien)) {
            bullet.remove();
            alien.remove();
            aliens.splice(alienIndex, 1);
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });
}

function isCollision(obj1, obj2) {
    return !(obj1.right < obj2.left ||
             obj1.left > obj2.right ||
             obj1.bottom < obj2.top ||
             obj1.top > obj2.bottom);
}
