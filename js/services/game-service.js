'use strict';

import utils from './utils-service.js';
import bordService from './bord-service.js';
import playerService from './player-service.js';
import enemiesService from './enemies-service.js';
import bulletsService from './bullet-service.js';
import specialObjectsService from './special-object-service.js';
import bulletService from './bullet-service.js';


export default {
    checkIfGameOver,
    checkIfWaveDone,
    setNextWave,
    moveObject,
    removeObject,
    updateHealth,
    updateScore,
    pickSpecialObj,
    checkIsHit,
    getHelthPercents,
    resetGlobalVars,
    getGlobalVar,
    getScore,
    saveScoreToStorage,
    getObjAtrr,
    getObj,
    doPlayerFire,
    movePlayer,
    getPlayer,
    checkHits
}


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
    isGamePoused: true,
    isGameOver: true,
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
    gGame.isGamePoused = false;
    gGame.isGameOver = false;
    gGame.BestScore = loadScoreFromStorage();
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
        player.pos = newPlayerPos;
        return newPlayerPos;
    }
}

function moveObject(obj) {
    var objPrevPos = obj.pos;
    // var player = getObj(gGame.players, 'player_1');
    var players = gGame.players;
    var objNewPos = obj.moveFunc(obj, players);

    if (!bordService.checkIfPosInMat(objPrevPos)) {
        obj.pos = objNewPos;
        return;
    } 
    if (bordService.checkIfPosInMat(objPrevPos) && bordService.checkIfPosInMat(objNewPos)) {    
        obj.pos = objNewPos;
        gGame.board[objPrevPos.i][objPrevPos.j] = bordService.SpaceMAtChar;
        gGame.board[objNewPos.i][objNewPos.j] = obj;

        if (obj.isKnowToShoot) {
            if (utils.getRandomInt(0, 100) <= obj.shootingFriquency) {
                gGame.enemyBullets = [...gGame.enemyBullets, bulletsService.setEnemyFire(obj)];
            }
        }

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
        return true;
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

function getScore() {
    return gGame.score;
}

function getGlobalVar(varKey) {
    return gGame[varKey];
}

function getObjAtrr(obj, atrr) {
    return obj[atrr];
}


function checkIfWaveDone() {
    return (gGame.enemies.length === 0);
}


function getHelthPercents(obj) {
    return (obj.health / obj.maxHealth) * 100;
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

function checkHits(obj) {
    var hitObjs = [];
    for (let i = obj.pos.i - utils.absValue(obj.speed); i <= obj.pos.i + utils.absValue(obj.speed); i++) {
        for (let j = obj.pos.j - obj.widthRadius; j <= obj.pos.j + obj.widthRadius; j++) {
            if (bordService.checkIfPosInMat({i, j}) && typeof(gGame.board[i][j]) === 'object') {
                let currObj = gGame.board[i][j];
                if (obj.type === 'enemy') {
                    if (currObj.type === 'player') hitObjs.push(currObj);
                    if (currObj.subType === 'friendly-bullet') hitObjs.push(currObj);
                }
                if (obj.subType === 'friendly-bullet') {
                    if (currObj.type === 'enemy') hitObjs.push(currObj);
                }
                if (obj.subType === 'enemy-bullet') {
                    if (currObj.type === 'player') hitObjs.push(currObj);
                }
                if (obj.type === 'special-object') {
                    if (currObj.type === 'player') hitObjs.push(currObj);
                }
                if (obj.type === 'player') {
                    if (currObj.type === 'special-object') hitObjs.push(currObj);
                    if (currObj.type === 'enemy') hitObjs.push(currObj);
                    if (currObj.subType === 'enemy-bullet') hitObjs.push(currObj);
                }
            }
        }
    }
    return hitObjs;
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
