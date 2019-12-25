'use strict';

import {renderText} from './services/utils-service.js';

import eventService from './services/event.service.js';

import controllers from './game-controller.js';
import gameService from './model/index.js';

var moveInterval;
var fireInterval;

var gameStatus = {
    isGameOver: true,
    isGamePaused: true
}

window.onload = async () => {
    connectEvents();
    
    ///////////////////////////////////////////////////////////////////////////////// FIX THIS
    await onRestartGame(); ////////////////////////////////////////////////////////// FIX THIS
    await onPousGame(); ///////////////////////////////////////////////////////////// FIX THIS
    renderText('.game-holder h2', 'Space Invaders'); //////////////////////////////// FIX THIS
    renderText('.game-holder .restart-button', 'Start');///////////////////////////// FIX THIS
    document.querySelector('.game-holder .resurm-button').style.display = 'none'; /// FIX THIS
    ///////////////////////////////////////////////////////////////////////////////// FIX THIS

    // init();
    setDomFunctins();
}

function connectEvents() {
    gameService.connectEvents();
    controllers.connectEvents();
}

async function init(amountOfPlayers = 1) {
    // await eventService.emit('setGame', amountOfPlayers);

    controllers.renderBoard();
    controllers.renderGameInformation();

    renderText('.game-holder h2', 'Space Invaders');
    renderText('.game-holder .restart-button', 'Start');
}

function setDomFunctins() {
    document.body.onkeydown = event => getKey(event);

    document.querySelector('.pause-btn').onclick = onPousGame;
    document.querySelector('.resurm-button').onclick = onResurmGame;
    document.querySelector('.restart-button').onclick = () => onRestartGame(1);
    document.querySelector('.restart-button-2').onclick = () => onRestartGame(2);
    
    var elUpBtn = document.querySelector('.up-btn');
    var elDownBtn = document.querySelector('.down-btn');
    var elLeftBtn = document.querySelector('.left-btn');
    var elRightBtn = document.querySelector('.right-btn');
    var elFireBtn = document.querySelector('.fire-btn');
    
    elUpBtn.onmousedown = elUpBtn.ontouchstart = () => movingInterval(() => onMovePlayer('player_1', -1, 0));
    elDownBtn.onmousedown = elDownBtn.ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 1, 0));
    elLeftBtn.onmousedown = elLeftBtn.ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 0, -1));
    elRightBtn.onmousedown = elRightBtn.ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 0, 1));    
    elFireBtn.onmousedown = elFireBtn.ontouchstart = () => firingInterval(() => onPlayerFire('player_1'));

    elUpBtn.onmouseup = elUpBtn.ontouchend = () => clearMoveInterval();
    elDownBtn.onmouseup = elDownBtn.ontouchend = () => clearMoveInterval();
    elLeftBtn.onmouseup = elLeftBtn.ontouchend = () => clearMoveInterval();
    elRightBtn.onmouseup = elRightBtn.ontouchend = () => clearMoveInterval();
    elFireBtn.onmouseup = elFireBtn.ontouchend = () => clearfireInterval();
}

function movingInterval(func) {
    if (moveInterval) return;
    func();
    moveInterval = setInterval(func, 100);
}
function clearMoveInterval() {
    clearInterval(moveInterval);
    moveInterval = null;
}
function firingInterval(func) {
    if (fireInterval) return;
    func();
    fireInterval = setInterval(func, 250);
}
function clearfireInterval() {
    clearInterval(fireInterval);
    fireInterval = null;
}

//get a key on key down
async function getKey(event) {
    event.preventDefault();
    var isGameOver = gameStatus.isGameOver;
    var isGamePaused = gameStatus.isGamePaused;

    if (isGameOver) return;
    
    if (event.code === "Escape") {
        if (isGamePaused) onResurmGame();
        else onPousGame();
    }
    
    if (isGamePaused) return;
    
    //player 1:
    if (event.code === "ArrowLeft") {
        onMovePlayer('player_1', 0, -1);
    }
    if (event.code === "ArrowRight") {
        onMovePlayer('player_1', 0, 1);
    }
    if (event.code === "ArrowUp") {
        onMovePlayer('player_1', -1, 0);
    }
    if (event.code === "ArrowDown") {
        onMovePlayer('player_1', 1, 0);
    }
    if (event.code === "Space") {
        onPlayerFire('player_1');
    }

    //player 2:
    if (event.code === "KeyA") {
        onMovePlayer('player_2', 0, -1);
    }
    if (event.code === "KeyD") {
        onMovePlayer('player_2', 0, 1);
    }
    if (event.code === "KeyW") {
        onMovePlayer('player_2', -1, 0);
    }
    if (event.code === "KeyS") {
        onMovePlayer('player_2', 1, 0);
    }
    if (event.code === "KeyH") {
        onPlayerFire('player_2');
    }
}

function onPlayerFire(playerId) {
    if (gameStatus.isGamePaused) return;
    eventService.emit('playerFire', playerId);
}

function onMovePlayer(playerId, diffI, diffJ) {
    if (gameStatus.isGamePaused) return;
    eventService.emit('movePlayer', {i: diffI, j: diffJ}, playerId);
}

function onResurmGame() {
    document.querySelector('.game-holder').style.display = 'none';
    eventService.emit('resurmGame').then(status => {
        gameStatus = status;
    });
}

async function onRestartGame(amountOfPlayers) {
    // await eventService.emit('resetGame', amountOfPlayers)
    //     .then(async status => {
    //         gameStatus = status;
    //         await init(amountOfPlayers);
    //     });
    gameStatus = await eventService.emit('resetGame', amountOfPlayers)
    await init(amountOfPlayers);

    renderText('.game-holder h2', 'Game Paused');
    renderText('.game-holder .resurm-button', 'Resurm');
    renderText('.game-holder .restart-button', 'Replay');
    document.querySelector('.game-holder .resurm-button').style.display = 'block';
    document.querySelector('.game-holder').style.display = 'none';
}

function onPousGame() {
    eventService.emit('pauseGame')
        .then(status => {
            gameStatus = status;
        })
    document.querySelector('.game-holder').style.display = 'flex';
}
