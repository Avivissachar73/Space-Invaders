'use strict';

import utils from '../../services/utils-service.js';
import moveService from './obj-move-service.js';


/**BULLET SERVICE**/

export default {
    setPlayerFire,
    setEnemyFire,
    updateBulletLevel
}

const BulletsLimit = 10;

var bulletsData = {
    bulletLevel: 1,
    // bullets: [],
    // enemyBullets: [],
}

function updateBulletLevel(dif, obj) {
    // bulletsData.bulletLevel += dif;
    // if (bulletsData.bulletLevel < 1) bulletsData.bulletLevel = 1;
    obj.bulletLevel += dif;
    if (obj.bulletLevel < 1) obj.bulletLevel = 1;
}

function setEnemyFire(enemy) {
    return createRegularBullet({i: enemy.pos.i+1, j: enemy.pos.j}, enemy)
}

function setPlayerFire(player, gameBullets) {
    var bulletLevel = player.bulletLevel;
    
    if (player.bullets.length >= BulletsLimit*bulletLevel) return [];

    var bulletsPoses = [];
    
    if (bulletLevel <= 1) {
        bulletsPoses = [{i: player.pos.i-1, j: player.pos.j}];
    } 
    if (bulletLevel === 2) {
        bulletsPoses = [{i: player.pos.i, j: player.pos.j-1},{i: player.pos.i, j: player.pos.j+1}];
    } 
    if (bulletLevel === 3) {
        bulletsPoses = [{i: player.pos.i, j: player.pos.j-2},{i: player.pos.i-1, j: player.pos.j},
                        {i: player.pos.i, j: player.pos.j+2}];
    } 
    if (bulletLevel === 4) {
        bulletsPoses = [{i: player.pos.i, j: player.pos.j-3},{i: player.pos.i-1, j: player.pos.j-1},
                        {i: player.pos.i-1, j: player.pos.j+1},{i: player.pos.i, j: player.pos.j+3}];
    } 
    if (bulletLevel >= 5) {
        bulletsPoses = [{i: player.pos.i, j: player.pos.j-3},{i: player.pos.i-1, j: player.pos.j-2},
                        {i: player.pos.i-2, j: player.pos.j},{i: player.pos.i-1, j: player.pos.j+2},
                        {i: player.pos.i, j: player.pos.j+3}];
    }
    var bullets = [];
    for (var i = 0; i < bulletsPoses.length; i++) {
        var bullet = createRegularBullet(bulletsPoses[i], player)
        bullets.push(bullet);
        player.bullets.push(bullet);
    }
    return bullets;
}




//create bullet
function createRegularBullet(pos, obj) {
    var imgSrcStr = (obj.type === 'player')? `images/bullet.png` : `images/bullet.png`;
    var bulletSubType = (obj.type === 'player')? 'friendly-bullet' : 'enemy-bullet';

    return {
        id: utils.getRandomId(),
        type: 'bullet',
        subType: bulletSubType,
        pos: pos,
        speed: obj.bulletSpeed,
        power: obj.bulletPower,
        imgSrc: imgSrcStr,
        moveFunc: moveService.regularMove,
        widthRadius: 0,
        owner: obj
    }
}