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
    endingVideo.onended = () => {
        endingVideo.style.display = 'none';
        restartGameButton.style.display = 'block';
    };
}

function handlePlayerMovement() {
    gameContainer.addEventListener('mousemove', (e) => {
        const xPos = e.clientX - gameContainer.getBoundingClientRect().left;
        const yPos = e.clientY - gameContainer.getBoundingClientRect().top;
        player.style.left = `${xPos}px`;
        player.style.top = `${yPos}px`;
    });

    gameContainer.addEventListener('click', () => {
        if (gameRunning) {
            shoot();
        }
    });

    gameContainer.addEventListener('touchstart', (e) => {
        if (gameRunning) {
            const touchX = e.touches[0].clientX - gameContainer.getBoundingClientRect().left;
            const touchY = e.touches[0].clientY - gameContainer.getBoundingClientRect().top;
            player.style.left = `${touchX}px`;
            player.style.top = `${touchY}px`;
            shoot();
        }
    });
}

function shoot() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${parseInt(player.style.left) + player.offsetWidth / 2}px`;
    bullet.style.bottom = `${parseInt(player.style.top) + player.offsetHeight}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);

    moveBullets();
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        const bulletInterval = setInterval(() => {
            const bulletY = parseInt(bullet.style.bottom);
            bullet.style.bottom = `${bulletY + 10}px`;
            if (bulletY > window.innerHeight) {
                bullet.remove();
                bullets.splice(index, 1);
                clearInterval(bulletInterval);
            } else {
                checkCollision(bullet);
            }
        }, 30);
    });
}

function spawnAliens() {
    const alienInterval = setInterval(() => {
        if (gameRunning) {
            const alien = document.createElement('div');
            alien.classList.add('alien');
            alien.style.left = `${Math.random() * (window.innerWidth - 75)}px`;
            alien.style.top = `${-75}px`;
            gameContainer.appendChild(alien);
            aliens.push(alien);
    
            moveAliens();
        } else {
            clearInterval(alienInterval);
        }
    }, 2000);
}

function moveAliens() {
    aliens.forEach((alien, index) => {
        const alienInterval = setInterval(() => {
            const alienY = parseInt(alien.style.top);
            alien.style.top = `${alienY + 5}px`;
            if (alienY > window.innerHeight) {
                alien.remove();
                aliens.splice(index, 1);
                clearInterval(alienInterval);
            } else {
                checkCollision(alien);
            }
        }, 30);
    });
}

function checkCollision(object) {
    const objectRect = object.getBoundingClientRect();
    bullets.forEach((bullet, bulletIndex) => {
        const bulletRect = bullet.getBoundingClientRect();
        if (objectRect.top <= bulletRect.bottom && objectRect.bottom >= bulletRect.top &&
            objectRect.left <= bulletRect.right && objectRect.right >= bulletRect.left) {
            if (object.classList.contains('alien')) {
                handleAlienHit(object);
            }
            bullet.remove();
            bullets.splice(bulletIndex, 1);
        }
    });
}

function handleAlienHit(alien) {
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.width = '75px';
    explosion.style.height = '75px';
    explosion.style.backgroundImage = "url('explosion.gif')";
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.left = alien.style.left;
    explosion.style.top = alien.style.top;
    gameContainer.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 1000);

    alien.remove();
    aliens.splice(aliens.indexOf(alien), 1);

    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
}

// Event listener for orientation change to reload the page
window.addEventListener("orientationchange", function() {
    location.reload();
});
