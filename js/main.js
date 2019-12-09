'use strict';

import {renderText} from './services/utils-service.js';

import gameService from './services/game-service.js';
import controllers from './game-controller.js';
import gameController from './game-controller.js';


var moveInterval;
var fireInterval;

window.onload = () => {
    init();
    setDomFunctins();
}

function init(amountOfPlayers = 1) {
    gameService.resetGlobalVars(amountOfPlayers);

    controllers.renderBoard();
    controllers.renderGameInformation();

    renderText('.game-holder h2', 'Space Invaders');
    renderText('.game-holder .restart-button', 'Start')
}

function setDomFunctins() {
    document.body.onkeydown = event => getKey(event);
    document.body.onmousedown = event => console.log(event);

    document.querySelector('.information-cell.pouse-btn').onclick = onPousGame;
    document.querySelector('.resurm-button').onclick = onResurmGame;
    document.querySelector('.restart-button').onclick = () => onRestartGame(1);
    document.querySelector('.restart-button-2').onclick = () => onRestartGame(2);
    
    document.querySelector('.arrow-btn.up-btn').onmousedown = () => movingInterval(() => onMovePlayer('player_1', -1, 0));
    document.querySelector('.arrow-btn.down-btn').onmousedown = () => movingInterval(() => onMovePlayer('player_1', 1, 0));
    document.querySelector('.arrow-btn.left-btn').onmousedown = () => movingInterval(() => onMovePlayer('player_1', 0, -1));
    document.querySelector('.arrow-btn.right-btn').onmousedown = () => movingInterval(() => onMovePlayer('player_1', 0, 1));
    
    document.querySelector('.fire-btn').onmousedown = () => firingInterval(() => onPlayerFire('player_1'));

    document.querySelector('.arrow-btn.up-btn').onmouseup = () => clearMoveInterval();
    document.querySelector('.arrow-btn.down-btn').onmouseup = () => clearMoveInterval();
    document.querySelector('.arrow-btn.left-btn').onmouseup = () => clearMoveInterval();
    document.querySelector('.arrow-btn.right-btn').onmouseup = () => clearMoveInterval();
    
    document.querySelector('.fire-btn').onmouseup = () => clearfireInterval();



    document.querySelector('.arrow-btn.up-btn').ontouchstart = () => movingInterval(() => onMovePlayer('player_1', -1, 0));
    document.querySelector('.arrow-btn.down-btn').ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 1, 0));
    document.querySelector('.arrow-btn.left-btn').ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 0, -1));
    document.querySelector('.arrow-btn.right-btn').ontouchstart = () => movingInterval(() => onMovePlayer('player_1', 0, 1));
    
    document.querySelector('.fire-btn').ontouchstart = () => firingInterval(() => onPlayerFire('player_1'));

    document.querySelector('.arrow-btn.up-btn').ontouchend = () => clearMoveInterval();
    document.querySelector('.arrow-btn.down-btn').ontouchend = () => clearMoveInterval();
    document.querySelector('.arrow-btn.left-btn').ontouchend = () => clearMoveInterval();
    document.querySelector('.arrow-btn.right-btn').ontouchend = () => clearMoveInterval();
    
    document.querySelector('.fire-btn').ontouchend = () => clearfireInterval();
}

function movingInterval(func) {
    func();
    moveInterval = setInterval(func, 100);
}
function clearMoveInterval() {
    clearInterval(moveInterval);
    moveInterval = null;
}
function firingInterval(func) {
    func();
    fireInterval = setInterval(func, 250);
}
function clearfireInterval() {
    clearInterval(fireInterval);
    fireInterval = null;
}

//get a key on key down
function getKey(event) {
    event.preventDefault();
    if (gameService.getGlobalVar('isGameOver')) return;
    
    if (event.code === "Escape") {
        if (gameService.getGlobalVar('isGamePoused')) {
            onResurmGame();
        } else {
            onPousGame();
        }
    }
    
    if (gameService.getGlobalVar('isGamePoused')) return;
    
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
    gameService.doPlayerFire(playerId);
}


function onMovePlayer(playerId, diffI, diffJ) {
    gameController.doMovePlayer({i: diffI, j: diffJ}, playerId)
}


function onResurmGame() {
    document.querySelector('.game-holder').style.display = 'none';
    gameController.resurmGame();
}

function onRestartGame(amountOfPlayers) {
    gameController.restartTheGame(init, amountOfPlayers);

    renderText('.game-holder h2', 'Game Poused');
    renderText('.game-holder .resurm-button', 'Resurm')
    renderText('.game-holder .restart-button', 'Replay')
    document.querySelector('.game-holder .resurm-button').style.display = 'block';
    document.querySelector('.game-holder').style.display = 'none';
}


function onPousGame() {
    gameController.pousGame();
    
    document.querySelector('.game-holder').style.display = 'flex';
}
