'use strict';

import utils from '../../services/utils-service.js';
import moveService from './obj-move-service.js';

export default {
    setSpecialObj
}

var specialObjectsData = {
    specialObjects: [],
}

/*SPECIAL OBJS SERVICE*/
/**CREATE GAME OBJECTS**/

function setSpecialObj(pos) {
    var randNum = utils.getRandomInt(1, 15);
    var specialObj;

    if (randNum === 1) specialObj = _createHealthObj(pos);
    if (randNum === 2) specialObj = _createBulletLevelObj(pos);

    if (specialObj) specialObjectsData.specialObjects.push(specialObj);
    return specialObj;
}

function _createBulletLevelObj(pos) {
    var bulletLevelObj = _createSpecialObj(pos);
    bulletLevelObj.subType = 'bullet-level-object';
    bulletLevelObj.imgSrc = `images/bullet_level_object.png`;
    // bulletLevelObj.isBulletUpdater = true;

    return bulletLevelObj;
}

function _createHealthObj(pos) {
    var healthObj = _createSpecialObj(pos);
    healthObj.subType = 'health-object';
    healthObj.imgSrc = `images/health_object.png`;
    healthObj.addHealth = 30;

    return healthObj;
}


function _createSpecialObj(pos) {
    return {
        id: utils.getRandomId(),
        type: 'special-object',
        pos: pos,
        speed: 1,
        moveFunc: moveService.regularMove,
        points: 30,
        widthRadius: 1
    }
}
