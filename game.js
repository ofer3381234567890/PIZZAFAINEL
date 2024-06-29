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

    document.addEventListener('mousemove', (event) => {
        playerX = event.clientX;
    });

    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            playerX = event.touches[0].clientX;
        }
    });

    document.addEventListener('mousedown', () => {
        isShooting = true;
    });

    document.addEventListener('touchstart', () => {
        isShooting = true;
    });

    document.addEventListener('mouseup', () => {
        isShooting = false;
    });

    document.addEventListener('touchend', () => {
        isShooting = false;
    });

    function updatePlayer() {
        player.style.transform = `translateX(${playerX}px)`;
        if (isShooting) {
            shootBullet();
        }
        if (gameRunning) {
            requestAnimationFrame(updatePlayer);
        }
    }

    updatePlayer();
}

function shootBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 5}px`;
    bullet.style.bottom = '200px';
    gameContainer.appendChild(bullet);
    bullets.push(bullet);

    function moveBullet() {
        if (bullet.offsetTop <= 0) {
            bullet.remove();
            bullets = bullets.filter(b => b !== bullet);
        } else {
            bullet.style.top = `${bullet.offsetTop - 5}px`;
            requestAnimationFrame(moveBullet);
        }
    }

    moveBullet();
}

function spawnAliens() {
    function createAlien() {
        const alien = document.createElement('div');
        alien.classList.add('alien');
        alien.style.left = `${Math.random() * (window.innerWidth - 75)}px`;
        alien.style.top = `-75px`;
        gameContainer.appendChild(alien);
        aliens.push(alien);

        function moveAlien() {
            if (alien.offsetTop >= window.innerHeight) {
                alien.remove();
                aliens = aliens.filter(a => a !== alien);
                endGame();
            } else {
                alien.style.top = `${alien.offsetTop + 2}px`;
                requestAnimationFrame(moveAlien);
            }
        }

        moveAlien();
    }

    function spawnAlienWave() {
        if (gameRunning) {
            createAlien();
            setTimeout(spawnAlienWave, Math.random() * 1000 + 500);
        }
    }

    spawnAlienWave();
}

function detectCollisions() {
    bullets.forEach(bullet => {
        aliens.forEach(alien => {
            if (isCollision(bullet, alien)) {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                bullet.remove();
                alien.remove();
                bullets = bullets.filter(b => b !== bullet);
                aliens = aliens.filter(a => a !== alien);
            }
        });
    });

    if (gameRunning) {
        requestAnimationFrame(detectCollisions);
    }
}

function isCollision(bullet, alien) {
    const bulletRect = bullet.getBoundingClientRect();
    const alienRect = alien.getBoundingClientRect();

    return !(
        bulletRect.top > alienRect.bottom ||
        bulletRect.bottom < alienRect.top ||
        bulletRect.left > alienRect.right ||
        bulletRect.right < alienRect.left
    );
}

detectCollisions();
