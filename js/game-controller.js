'use strict';

import {renderHTML} from './services/utils-service.js';
import {renderText} from './services/utils-service.js';

import bordService from './services/bord-service.js';
import bulletService from './services/bullet-service.js';
import gameService from './services/game-service.js';
// import playerService from './services/player-service.js';


export default {
    renderBoard,
    renderGameInformation,
    resurmGame,
    restartTheGame,
    pousGame,
    doMovePlayer
}

var gameStatus = {
    gameInteval: null,
    isGamePoused: true,
    IsGameOver: true,
}

//game interval
function gameInterval() {
    if (gameService.checkIfGameOver()) {
        doGameFinish();
        return;
    }
    if (gameService.checkIfWaveDone()) {
        gameService.setNextWave();
        renderGameInformation();
    }
    checkMultipleHits();
    // checkMultipleHits2();
    removeExtraObjects();
    
    doMoveObjects(gameService.getGlobalVar('enemies'));
    doMoveObjects(gameService.getGlobalVar('bullets'));
    doMoveObjects(gameService.getGlobalVar('enemyBullets'));
    doMoveObjects(gameService.getGlobalVar('specialObjects'));
}


function gameFinish() {
    pousGame();
    // bulletService.updateBulletLevel(-1);
        
    if (gameService.getGlobalVar('score') > gameService.getGlobalVar('BestScore') || isNaN(gameService.getGlobalVar('BestScore'))) {
        gameService.saveScoreToStorage();
    }
}

function restartTheGame(init, amountOfPlayers = 1) {
    pousGame();
    init(amountOfPlayers);
    resurmGame();
}    

function resurmGame() {
    gameStatus.gameInterval = setInterval(gameInterval, 300);
    gameStatus.isGamePoused = false;
    gameStatus.isGameOver = false;
}    

function pousGame() {
    if (gameStatus.isGameOver) return;
    clearInterval(gameStatus.gameInterval);
    gameStatus.gameInterval = null;
    gameStatus.isGamePoused = true;
}  

//check hits of bullets and enemies
function checkMultipleHits() {
    var enemies = gameService.getGlobalVar('enemies');
    var bullets = gameService.getGlobalVar('bullets');
    var enemyBullets = gameService.getGlobalVar('enemyBullets');
    var specialObjects = gameService.getGlobalVar('specialObjects');
    var players = gameService.getGlobalVar('players');

    for (var i = 0; i < enemies.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (gameService.checkIsHit(enemies[i], players[p]) || bordService.checkIfGrownedHit(enemies[i].pos)) {
                doPlayerHit(enemies, enemies[i].id, players[p]);
                isHit = true;
            }
            if (isHit) {
                i--;
                continue;
            }
        }
        for (var j = 0; j < bullets.length; j++) {
            if (gameService.checkIsHit(enemies[i], bullets[j])) {
                if (doEnemyHit(enemies[i].id, bullets[j].id)) {
                    i--;
                    renderGameInformation();
                    break;
                }
                j--;
            }
        }
    }
    for (var i = 0; i < enemyBullets.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (gameService.checkIsHit(enemyBullets[i], players[p])) {
                doPlayerHit(enemyBullets, enemyBullets[i].id, players[p]);
                isHit = true;
            }
            if (isHit) {
                i--;
                continue;
            }
        }
    }
    for (var i = 0; i < specialObjects.length; i++) {
        for (var p = 0; p < players.length; p++) {
            let isHit = false;
            if (gameService.checkIsHit(specialObjects[i], players[p])) {
                doPlayerHit(specialObjects, specialObjects[i].id, players[p]);
                isHit = true;
            }
            if (isHit) {
                i--;
                continue;
            }
        }
    }
}

// function hendelHits(obj, hitObjs) {
//     if (obj.type === 'enemy') {
//         if (bordService.checkIfGrownedHit(obj.pos)) {
//             console.log('hendeling ground hit!');
//             doPlayerHit(gameService.getGlobalVar('enemies'), obj.id, gameService.getPlayer('player_1')); 
//         }
//     }
//     for (var i = 0; i < hitObjs.length; i++) {
//         if (obj.type === 'enemy') {
//             if (hitObjs[i].type === 'player') doPlayerHit(gameService.getGlobalVar('enemies'), obj.id, hitObjs[i]);
//             if (hitObjs.subType === 'friendly-bullet') doEnemyHit(obj.id, hitObjs[i].id);
//         }
//         if (obj.type === 'special-object') {
//             if (hitObjs[i].type === 'player') doPlayerHit(gameService.getGlobalVar('specialObjects'), obj.id, hitObjs[i]);
//         }
//         if (obj.subType === 'friendly-bullet') {
//             if (hitObjs[i].type === 'enemy') doEnemyHit(hitObjs[i].id, obj.id);
//         }
//         if (obj.subType === 'enemy-bullet') {
//             if (hitObjs[i].type === 'player') doPlayerHit(gameService.getGlobalVar('enemyBullets'), obj.id, hitObjs[i]);
//         }
//         if (obj.type === 'player') {
//             if (hitObjs[i].type === 'enemy') doPlayerHit(gameService.getGlobalVar('enemies'), obj.id, hitObjs[i]);
//             if (hitObjs[i].type === 'special-object') doPlayerHit(gameService.getGlobalVar('specialObjects'), obj.id, hitObjs[i]);
//             if (hitObjs[i].subType === 'enemy-bullet') doPlayerHit(gameService.getGlobalVar('enemyBullets'), obj.id, hitObjs[i]);
//         }
//     }
// }

function doPlayerHit(objs, objId, player) {
    var obj = gameService.getObj(objs, objId);
    if (obj.type === 'special-object') {
        gameService.pickSpecialObj(obj.id, player);
    } else {
        gameService.updateHealth(gameService.getGlobalVar('players'), player.id, -obj.power);
        bulletService.updateBulletLevel(-1, player);
    }
    if (obj.subType !== 'super-enemy') doRemoveObject(objs, objId);
    renderGameInformation();
}

function doEnemyHit(enemyId, bulletId) {
    var enemies = gameService.getGlobalVar('enemies');
    var bullets = gameService.getGlobalVar('bullets');

    var enemy = gameService.getObj(enemies, enemyId);
    var bullet = gameService.getObj(bullets, bulletId);

    var isDead = false;
    gameService.updateHealth(enemies, enemyId, -bullet.power);
    showHealthBar(enemy);
    if (enemy.health <= 0) {
        isDead = true;
        gameService.updateScore(bullet.owner, enemy.points);
        doRemoveObject(enemies, enemyId);
    }
    doRemoveObject(bullets, bullet.id);

    return isDead;
}

function showHealthBar(obj) {
    obj.isShowHealthBar = true;
    setTimeout(function() {
        obj.isShowHealthBar = false;
    }, 3000);
}

function doGameFinish() {
    gameFinish();
    renderGameInformation();
    document.querySelector('.game-holder .resurm-button').style.display = 'none';
    document.querySelector('.game-holder').style.display = 'block';
    renderText('.game-holder h2', 'Game Over..')
    renderText('.game-holder .restart-button', 'Play again')

    // console.log(`Game Over!\nyou got ${gameService.getGlobalVar('score')} points!\nyou made it to wave ${gameService.getGlobalVar('currWave')}`);
}


//remove bullets that crossed the line
function removeExtraObjects() {
    var bullets = gameService.getGlobalVar('bullets');
    for (var i = 0; i < bullets.length; i++) {
        if (!bordService.checkIfPosInMat(bullets[i].moveFunc(bullets[i]))) {
            doRemoveObject(bullets, bullets[i].id);
        }
    }
    var enemyBullets = gameService.getGlobalVar('enemyBullets');
    for (var i = 0; i < enemyBullets.length; i++) {
        if (!bordService.checkIfPosInMat(enemyBullets[i].moveFunc(enemyBullets[i]))) {
            doRemoveObject(enemyBullets, enemyBullets[i].id);
        }
    }
    var specialObjects = gameService.getGlobalVar('specialObjects');
    for (var i = 0; i < specialObjects.length; i++) {
        if (!bordService.checkIfPosInMat(specialObjects[i].moveFunc(specialObjects[i]))) {
            doRemoveObject(specialObjects, specialObjects[i].id);
        }
    }
}

//move object on board and delete it if crossed the board line
function doMoveObjects(objs) {
    for (var i = 0; i < objs.length; i++) {
        doMoveObject(objs[i]);
    }
}

function doMoveObject(obj) {
    var objPrevPos = obj.pos;
    var objNewPos = gameService.moveObject(obj);

    // hendelHits(obj, gameService.checkHits(obj));

    if (objNewPos) renderCell(obj, objPrevPos, objNewPos);
}

function doRemoveObject(objects, objId) {
    var obj = gameService.getObj(objects, objId);

    if (!gameService.removeObject(objects, objId)) return;

    var objClass = (obj.type !== 'enemy')? obj.type : obj.subType;
    var elCell = document.querySelector(`[data-i="${obj.pos.i}"][data-j="${obj.pos.j}"]`);
    elCell.classList.remove(objClass);
    elCell.innerHTML = null;
}


function doMovePlayer(posDiffs, playerId) {
    //TODO: check if enemy hits the player in this function as well;
    if (gameStatus.isGamePoused) return;
    var player = gameService.getPlayer(playerId);
    if (!player) return;
    var prevPos = player.pos;
    var newPos = gameService.movePlayer(posDiffs, playerId);
    if (newPos) {
        hendelHits(player, gameService.checkHits(player));
        renderCell(player, prevPos, newPos);
    }
}


function getHtmlStr(obj) {
    var htmlStr = `<img src="${obj.imgSrc}"/>`;
    if (!obj.health) return htmlStr;
    // var currHelthPercents = gameService.getHelthPercents(obj);
    // var classes = (obj.isShowHealthBar || obj.subType === 'super-enemy')? 'health-bar show' : 'health-bar';
    // return `${htmlStr}<div class="${classes}"><div class="inner-health-bar" 
    //             style="width:${currHelthPercents}%"></div></div>`;
    return `${htmlStr}${grtHealthbarHtmlStr(obj)}`;
}
                    
function grtHealthbarHtmlStr(obj, isShowHealthBar = false) {
    var currHelthPercents = gameService.getHelthPercents(obj);
    var classes = (obj.isShowHealthBar || obj.subType === 'super-enemy' || isShowHealthBar)? 'health-bar show' : 'health-bar';
    return `<div class="${classes}"><div class="inner-health-bar" 
            style="width:${currHelthPercents}%"></div></div>`;

}

  
function renderCell(obj, objPrevPos, objNewPos) {
    var elPrevCell = document.querySelector(`[data-i="${objPrevPos.i}"][data-j="${objPrevPos.j}"]`);
    var elCurrCell = document.querySelector(`[data-i="${objNewPos.i}"][data-j="${objNewPos.j}"]`);
    var objClass = (obj.type !== 'enemy')? obj.type : obj.subType;

    elPrevCell.classList.remove(objClass);
    elCurrCell.classList.add(objClass);
    
    elPrevCell.innerHTML = null;

    elCurrCell.innerHTML = getHtmlStr(obj);
}

//render score health and current wave
function renderGameInformation() {
    var playersInfoHtmlStr = gameService.getGlobalVar('players').map(player => {
        return `<div class="player-info flex column"><h5 class="multi-player-element">${player.id}</h5>
                ${grtHealthbarHtmlStr(player, true)}
                <h5>Score: <span>${player.score}</span></h5></div>`
    }).join('');
    renderHTML('.players-info', playersInfoHtmlStr);

    renderText('.game-info .best-score span', gameService.getGlobalVar('BestScore'));
    renderText('.game-info .wave span', gameService.getGlobalVar('currWave'));
    
    // renderText('.information-container .best-score span', gameService.getGlobalVar('BestScore'));
    // renderText('.information-container .wave span', gameService.getGlobalVar('currWave'));
    // renderText('.information-container .health span', gameService.getObj(gameService.getGlobalVar('players'), 'player_1').health);
    // renderText('.information-container .score span', gameService.getGlobalVar('score'));
}


//render the game matrix to html table
function renderBoard() {
    var board = gameService.getGlobalVar('board');
    var boardStr = '';
    boardStr += '<table>';
    for (var i = 0; i < board.length; i++) {
        boardStr += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].type === 'player') {
                boardStr += `<td data-i="${i}" data-j="${j}" class="board-cell space player"><img src="${board[i][j].imgSrc}"/></td>`;
                continue;
            }
            if (board[i][j] === bordService.BorderMAtChar) {
                boardStr += `<td data-i="${i}" data-j="${j}" class="board-cell border"></td>`;
                continue;
            }
            if (board[i][j] === bordService.SpaceMAtChar) {
                boardStr += `<td data-i="${i}" data-j="${j}" class="board-cell space"></td>`;
            }
        }
        boardStr += '</tr>';
    }
    boardStr += '</table>';
    renderHTML('.game-board .game-table', boardStr)
}