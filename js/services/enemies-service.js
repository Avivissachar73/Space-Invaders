'use strict';

import utils from './utils-service.js';
import moveService from './obj-move-service.js';
import boardService from './bord-service.js';
import bordService from './bord-service.js';

export default {
    createEnemies
}

const EnemiesLimit = 15;

// var enemiesData = {
//     enemies: [],
//     amountOfEnemies: 0,
// }

/*enemyService*/

//create multiple enemies
function createEnemies(amountOfEnemies, currWave) {
    if (amountOfEnemies > EnemiesLimit) amountOfEnemies = EnemiesLimit;

    var enemies = [];
    // var enemies = enemiesData.enemies;

    if (currWave%5 === 0) {
        for (var i = 0; i < currWave/5; i++) {
            var randjPos = utils.getRandomInt(2, bordService.BoardWidth-3);
            var randiPos = (i === 0)? 2 : utils.getRandomInt(-20, 2);
            var enemy = _setEnemy(_createSuperEnemy, {i: randiPos, j: randjPos});
            enemies.push(enemy);
        }
        return enemies;
    }

    for (var i = 0; i < amountOfEnemies; i++) {
        var randjPos = utils.getRandomInt(2, bordService.BoardWidth-3);
        var randiPos = (i === 0)? 2 : utils.getRandomInt(-20, 2);
        var enemy = _setEnemy(_createRegularEnemy, {i: randiPos, j: randjPos});
        enemies.push(enemy);
    }
    return enemies;
}

function _setEnemy(createFunc, pos) {
    var enemy = createFunc(pos);
    enemy.health = enemy.maxHealth;
    return enemy;
}

// create super enemy
function _createSuperEnemy(pos) {
    var enemy = _createEnemy(pos, 'super-enemy', 500, 2, 30, 40, `images/enemy_ship.png`, moveService.horisenalMove, true);
    enemy.bulletSpeed = 3;
    enemy.bulletPower = 30;
    enemy.shootingFriquency = 7;
    enemy.widthRadius = 3;

    return enemy;
}

//create an enemy
function _createRegularEnemy(pos) {
    // return _createEnemy('enemy', pos, 100, 1, 10, 20, `images/enemy_ship.png`, _regularMove, true);
    return _createEnemy(pos);
}

function _createEnemy(pos, subType = 'regular', maxHealth = 100, speed = 1, points = 10, power = 20, imgSrc = `images/enemy_ship.png`, moveFunc = moveService.regularMove, isKnowToShoot = false) {
    var enemy = {
        id: utils.getRandomId(),
        type: 'enemy',
        subType: subType,
        pos: pos,
        maxHealth: maxHealth,
        health: null,
        speed: speed,
        points: points,
        power: power,
        imgSrc: imgSrc,
        moveFunc: moveFunc,
        isKnowToShoot: isKnowToShoot,
        shootingFriquency: 3,
        // bulletSpeed: 3,
        bulletSpeed: 5,
        bulletPower: 15,
        isShowHealthBar: false,
        widthRadius: 2
    };
    return enemy;
}