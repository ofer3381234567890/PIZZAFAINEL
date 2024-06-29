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
    handlePlayerActions();

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

function handlePlayerActions() {
    if (isMobileDevice()) {
        gameContainer.addEventListener('touchstart', shootBullet); // Touch on mobile
    } else {
        gameContainer.addEventListener('click', shootBullet); // Left click on desktop
    }

    function shootBullet(event) {
        if (!gameRunning) return;
        
        const bullet = createBullet();
        bullets.push(bullet);
        gameContainer.appendChild(bullet);
    }
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handlePlayerMovement() {
    let playerX = window.innerWidth / 2;
    let isShooting = false;

    function updatePlayerPosition(event) {
        if (!gameRunning) return;
        const x = event.clientX || event.touches[0].clientX;
        playerX = x - player.clientWidth / 2;
        player.style.left = `${playerX}px`;
    }

    function shootBullet() {
        if (!gameRunning) return;
        if (!isShooting) {
            isShooting = true;
            const bullet = createBullet();
            bullets.push(bullet);
            gameContainer.appendChild(bullet);
            setTimeout(() => isShooting = false, 300);
        }
    }

    gameContainer.addEventListener('mousemove', updatePlayerPosition);
    gameContainer.addEventListener('touchmove', updatePlayerPosition);
}

function createBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 5}px`;
    bullet.style.top = `${player.offsetTop}px`;
    
    const bulletInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(bulletInterval);
            bullet.remove();
            return;
        }
        bullet.style.top = `${bullet.offsetTop - 10}px`;
        
        const hitAlien = aliens.find(alien => isCollision(bullet, alien));
        if (hitAlien) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            hitAlien.remove();
            aliens = aliens.filter(a => a !== hitAlien);
            bullet.remove();
            clearInterval(bulletInterval);
        } else if (bullet.offsetTop < 0) {
            bullet.remove();
            clearInterval(bulletInterval);
        }
    }, 20);

    return bullet;
}

function spawnAliens() {
    function createAlien() {
        if (!gameRunning) return;
        const alien = document.createElement('div');
        alien.classList.add('alien');
        alien.style.left = `${Math.random() * (window.innerWidth - 75)}px`;
        alien.style.top = `-75px`;
        gameContainer.appendChild(alien);
        aliens.push(alien);

        const alienInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(alienInterval);
                return;
            }
            alien.style.top = `${alien.offsetTop + 5}px`;
            if (alien.offsetTop > window.innerHeight) {
                endGame();
                clearInterval(alienInterval);
            }
        }, 50);
    }

    setInterval(createAlien, 1000);
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
