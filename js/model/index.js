'use strict';

import utils from '../services/utils-service.js';
import eventService from '../services/event.service.js';

import bordService from './services/bord-service.js';
import playerService from './services/player-service.js';
import enemiesService from './services/enemies-service.js';
import bulletsService from './services/bullet-service.js';
import specialObjectsService from './services/special-object-service.js';
import bulletService from './services/bullet-service.js';



export default {connectEvents};




const BEST_SCORE_STORAGE_KEY = 'Space_Invaders_Best_Score';

var gGame = {
    board: null,
    players: [],
    
    enemies: [],
    amountOfEnemies: 0,
    
    bullets: [],
    enemyBullets: [],
    specialObjects: [],
    
    currWave: 0,
    score: 0,
    BestScore: 0,
    gameInterval: null,
};

window.gGame = gGame;

function resetGlobalVars(amountOfPlayers = 1) {
    gGame.board = bordService.createBoardMat();
    gGame.players = playerService.setPlayers(gGame.board, amountOfPlayers);

    gGame.enemies = [];
    gGame.amountOfEnemies = 0;
    
    gGame.bullets = [];
    gGame.bulletLevel = 1;
    gGame.enemyBullets = [];
    
    gGame.specialObjects = [];
    
    gGame.currWave = 0;
    gGame.score = 0;
    gGame.isGamePaused = false;
    gGame.isGameOver = false;
    gGame.BestScore = loadScoreFromStorage();
}

var gameStatus = {
    // gameInterval: null,
    isGamePaused: true,
    isGameOver: true,
}

function connectEvents() {
    eventService.on('resetGame', resetGame);
    eventService.on('pauseGame', pousGame);
    eventService.on('resurmGame', resurmGame);

    eventService.on('movePlayer', movePlayer);
    eventService.on('playerFire', doPlayerFire);

    eventService.on('getBoard', () => Promise.resolve(gGame.board));
    eventService.on('getPlayers', () => Promise.resolve(gGame.players));
    eventService.on('getBestScore', () => Promise.resolve(gGame.BestScore));
    eventService.on('getCurrWave', () => Promise.resolve(gGame.currWave));

    // eventService.on('getIsGamePaused', () => Promise.resolve(gameStatus.isGamePaused));
    // eventService.on('getIsGameOver', () => Promise.resolve(gameStatus.isGameOver));;

    // eventService.on('setGame', resetGlobalVars);

    console.log('service was connected');
}
// connectEvents();

//game interval
function gameInterval() {
    if (checkIfGameOver()) {
        gameFinish();
        return;
    }
    if (checkIfWaveDone()) {
        setNextWave();
    }
    checkMultipleHits();
    removeExtraObjects();
    
    moveObjects(gGame.enemies);
    moveObjects(gGame.bullets);
    moveObjects(gGame.enemyBullets);
    moveObjects(gGame.specialObjects);
}

function gameFinish() {
    pousGame();
    if (gGame.score > gGame.BestScore || isNaN(gGame.BestScore)) {
        saveScoreToStorage();
    }
    eventService.emit('gameFinish');
}

function resetGame(amountOfPlayers = 1) {
    pousGame();
    resetGlobalVars(amountOfPlayers);
    // init(amountOfPlayers);
    resurmGame();
    return Promise.resolve(gameStatus);
}    

function resurmGame() {
    gGame.gameInterval = setInterval(gameInterval, 300);
    gameStatus.isGamePaused = false;
    gameStatus.isGameOver = false;
    return Promise.resolve(gameStatus);
}    

function pousGame() {
    if (gameStatus.isGameOver) return;
    clearInterval(gGame.gameInterval);
    gGame.gameInterval = null;
    gameStatus.isGamePaused = true;
    return Promise.resolve(gameStatus);
}  

//check hits of bullets and enemies
function checkMultipleHits() {
    var enemies = gGame.enemies;
    var bullets = gGame.bullets;
    var enemyBullets = gGame.enemyBullets;
    var specialObjects = gGame.specialObjects;
    var players = gGame.players;

    for (var i = 0; i < enemies.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (checkIsHit(enemies[i], players[p]) || bordService.checkIfGrownedHit(enemies[i].pos)) {
                doPlayerHit(enemies, enemies[i].id, players[p]);
                isHit = true;
            }
            if (isHit) i--;
        }
        for (var j = 0; j < bullets.length; j++) {
            if (checkIsHit(enemies[i], bullets[j])) {
                if (doEnemyHit(enemies[i].id, bullets[j].id)) {
                    i--;
                    break;
                }
                j--;
            }
        }
    }
    for (var i = 0; i < enemyBullets.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (checkIsHit(enemyBullets[i], players[p])) {
                doPlayerHit(enemyBullets, enemyBullets[i].id, players[p]);
                isHit = true;
            }
            if (isHit) i--;
        }
    }
    for (var i = 0; i < specialObjects.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (checkIsHit(specialObjects[i], players[p])) {
                doPlayerHit(specialObjects, specialObjects[i].id, players[p]);
                isHit = true;
            }
            if (isHit) i--;
        }
    }
}


function doPlayerHit(objs, objId, player) {
    var hitObj = getObj(objs, objId);
    if (hitObj.type === 'special-object') {
        pickSpecialObj(hitObj.id, player);
    } else {
        updateHealth(gGame.players, player.id, -hitObj.power);
        bulletService.updateBulletLevel(-1, player);
    }
    if (hitObj.subType !== 'super-enemy') removeObject(objs, objId);
}

function doEnemyHit(enemyId, bulletId) {
    var enemies = gGame.enemies;
    var bullets = gGame.bullets;

    var enemy = getObj(enemies, enemyId);
    var bullet = getObj(bullets, bulletId);

    var isDead = false;
    updateHealth(enemies, enemyId, -bullet.power);
    showHealthBar(enemy);
    if (enemy.health <= 0) {
        isDead = true;
        updateScore(bullet.owner, enemy.points);
        removeObject(enemies, enemyId);
    }
    removeObject(bullets, bullet.id);

    return isDead;
}

function showHealthBar(obj) {
    obj.isShowHealthBar = true;
    setTimeout(function() {
        obj.isShowHealthBar = false;
    }, 3000);
}


function doPlayerFire(playerId) {
    var player = getObj(gGame.players, playerId);
    if (!player || player.health <= 0) return;
    gGame.bullets = [...gGame.bullets, ...bulletService.setPlayerFire(player, gGame.bullets)];
}

function movePlayer(posDiffs, playerId) {
    if (playerId === 'player_2' && gGame.players.length < 2) return;
    var player = getObj(gGame.players, playerId);
    if (player.health <= 0) return false;
    var newPlayerPos = {i: player.pos.i+posDiffs.i, j: player.pos.j+posDiffs.j};
    if (!bordService.checkIfPosInMat(newPlayerPos)) return false;
    else {
        var prevPos = player.pos;
        player.pos = newPlayerPos;
        eventService.emit('objectMove', player, prevPos, newPlayerPos);
        return newPlayerPos;
    }
}

function moveObjects(objs) {
    for (var i = 0; i < objs.length; i++) {
        moveObject(objs[i]);
    }
}
function moveObject(obj) {
    var objPrevPos = obj.pos;
    var players = gGame.players;
    var objNewPos = obj.moveFunc(obj, players);

    if (!bordService.checkIfPosInMat(objPrevPos)) {
        obj.pos = objNewPos;
        return;
    } 
    if (bordService.checkIfPosInMat(objPrevPos) && bordService.checkIfPosInMat(objNewPos)) {    
        obj.pos = objNewPos;
        // gGame.board[objPrevPos.i][objPrevPos.j] = bordService.SpaceMAtChar;
        gGame.board[objPrevPos.i][objPrevPos.j] = bordService.boardSpace();
        gGame.board[objNewPos.i][objNewPos.j] = obj;

        if (obj.isKnowToShoot) {
            if (utils.getRandomInt(0, 100) <= obj.shootingFriquency) {
                gGame.enemyBullets = [...gGame.enemyBullets, bulletsService.setEnemyFire(obj)];
            }
        }

        eventService.emit('objectMove', obj, objPrevPos, objNewPos);
        return objNewPos;
    }
}

//remove object from array
function removeObject(objs, objId) {
    var obj = objs.find(obj => obj.id === objId);
    var objIdx = objs.findIndex(obj => obj.id === objId);

    if (!bordService.checkIfPosInMat(obj.pos)) return false;

    gGame.board[obj.pos.i][obj.pos.j] = bordService.SpaceMAtChar;
    
    if (obj.type === 'enemy') {
        var specialObj = specialObjectsService.setSpecialObj(obj.pos);
        if (specialObj) gGame.specialObjects.push(specialObj);
    }

    if (objIdx !== -1) {
        if (obj.type === 'bullet' && obj.owner.type === 'player') {
            var bulletIdx = obj.owner.bullets.findIndex(bullet => bullet.id === objId);
            if (bulletIdx !== -1) {
                obj.owner.bullets.splice(bulletIdx, 1)
            };
        }
        objs.splice(objIdx,1);
        eventService.emit('removeObject', obj);
        return true;
    }
}

//remove bullets that crossed the line
function removeExtraObjects() {
    var bullets = gGame.bullets;
    for (var i = 0; i < bullets.length; i++) {
        if (!bordService.checkIfPosInMat(bullets[i].moveFunc(bullets[i]))) {
            removeObject(bullets, bullets[i].id);
        }
    }
    var enemyBullets = gGame.enemyBullets;
    for (var i = 0; i < enemyBullets.length; i++) {
        if (!bordService.checkIfPosInMat(enemyBullets[i].moveFunc(enemyBullets[i]))) {
            removeObject(enemyBullets, enemyBullets[i].id);
        }
    }
    var specialObjects = gGame.specialObjects;
    for (var i = 0; i < specialObjects.length; i++) {
        if (!bordService.checkIfPosInMat(specialObjects[i].moveFunc(specialObjects[i]))) {
            removeObject(specialObjects, specialObjects[i].id);
        }
    }
}


function pickSpecialObj(id, player) {
    var obj = getObj(gGame.specialObjects, id);
    if (obj.subType === 'health-object') {
        updateHealth(gGame.players, 'player_1', obj.addHealth);
    }
    if (obj.subType === 'bullet-level-object') {
        bulletsService.updateBulletLevel(1, player);
    }
    updateScore(getObj(gGame.players, 'player_1'), obj.points);
}


function checkIfWaveDone() {
    return (gGame.enemies.length === 0);
}

function getObj(objs, id) {
    return objs.find(obj => obj.id === id);
}

function getPlayer(id) {
    return getObj(gGame.players, id);
}



/**SET FUNCTIONS**/

function setNextWave() {
    gGame.amountOfEnemies++;
    gGame.currWave++;
    // gGame.enemies = [...gGame.enemies, ...enemiesService.createEnemies(gGame.amountOfEnemies, gGame.currWave)];
    gGame.enemies = enemiesService.createEnemies(gGame.amountOfEnemies, gGame.currWave);
}

function updateHealth(objs, id, diff) {
    var obj = getObj(objs, id);
    obj.health += diff;
    if (obj.health > obj.maxHealth*1.5) obj.health = obj.maxHealth*1.5;
}

function updateScore(obj, diff) {
    obj.score += diff;
    gGame.score += diff;
}

/**CHECK FUNCTIONS**/

function checkIfGameOver() {
    if (gGame.players.every(player => player.health <= 0)) {
        gGame.isGameOver = true;
        return true;
    } else return false;
}    

//check if enemy or player has been hited
function checkIsHit(obj1, obj2) {
    if (obj2.pos.i <= obj1.pos.i+utils.absValue(obj2.speed) && obj2.pos.j <= obj1.pos.j+obj1.widthRadius &&
        obj2.pos.i >= obj1.pos.i-utils.absValue(obj2.speed) && obj2.pos.j >= obj1.pos.j-obj1.widthRadius) 
        {return true}
    else return false;
}

/**LOCAL STORAGE**/

function loadScoreFromStorage() {
    var score = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (!score) return 'There is no Best Score.';
    else return +score;
}

function saveScoreToStorage() {
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, gGame.score);
}
