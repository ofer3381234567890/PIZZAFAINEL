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

function spawnAliens() {
    setInterval(() => {
        const alien = document.createElement('div');
        alien.className = 'alien';
        alien.style.left = `${Math.random() * (window.innerWidth - 100)}px`;
        gameContainer.appendChild(alien);
        aliens.push(alien);

        moveAlien(alien);
    }, 1000);
}

function moveAlien(alien) {
    let alienInterval = setInterval(() => {
        const currentTop = parseInt(alien.style.top);
        if (currentTop >= window.innerHeight - 100) {
            endGame();
            clearInterval(alienInterval);
            alien.remove();
        } else {
            alien.style.top = `${currentTop + 5}px`;
            bullets.forEach(bullet => {
                if (isCollision(bullet, alien)) {
                    handleCollision(bullet, alien);
                }
            });
        }
    }, 30);
}

function handlePlayerMovement() {
    document.addEventListener('mousemove', (event) => {
        const x = event.clientX;
        const y = event.clientY;
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
    });

    document.addEventListener('click', () => {
        const bullet = createBullet();
        bullets.push(bullet);
        moveBullet(bullet);
    });
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${parseInt(player.style.left) + 60}px`;
    bullet.style.top = `${parseInt(player.style.top) - 20}px`;
    gameContainer.appendChild(bullet);
    return bullet;
}

function moveBullet(bullet) {
    let bulletInterval = setInterval(() => {
        const currentTop = parseInt(bullet.style.top);
        if (currentTop <= 0) {
            bullet.remove();
            clearInterval(bulletInterval);
            bullets = bullets.filter(b => b !== bullet);
        } else {
            bullet.style.top = `${currentTop - 5}px`;
        }
    }, 10);
}

function isCollision(bullet, alien) {
    const bulletRect = bullet.getBoundingClientRect();
    const alienRect = alien.getBoundingClientRect();
    return !(bulletRect.right < alienRect.left ||
        bulletRect.left > alienRect.right ||
        bulletRect.bottom < alienRect.top ||
        bulletRect.top > alienRect.bottom);
}

function handleCollision(bullet, alien) {
    bullet.remove();
    bullets = bullets.filter(b => b !== bullet);
    alien.remove();
    aliens = aliens.filter(a => a !== alien);
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
}
