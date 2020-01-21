'use strict';

import utils from '../../services/utils-service.js';

export default {
    regularMove,
    horisenalMove
}

/*MOVE OBJS SERVICE*/
/***MOVE FUNCTIONS***/

function regularMove(obj) {
    return {i: (obj.pos.i + obj.speed), j: obj.pos.j};
}

function horisenalMove(obj, players) {
    if (obj.pos.i < 10) {
        return regularMove(obj);
    } else {

        // var closestPlayer = players[0];
        var closestPlayer;
        players.forEach(player => {
            if ((!closestPlayer && !player.isDead) || (!player.isDead && (utils.absValue(player.pos.j - obj.pos.j) < utils.absValue(closestPlayer.pos.j - obj.pos.j)))) {
            // if ((!closestPlayer && !player.isDead) || (!player.isDead && (Math.abs(player.pos.j - obj.pos.j) < Math.abs(closestPlayer.pos.j - obj.pos.j)))) {
                closestPlayer = player;
            }
        });

        var dif = (closestPlayer.pos.j >= obj.pos.j)? 1 : -1;
        var newPos = {i: obj.pos.i, j: obj.pos.j+(dif*obj.speed)};
        return newPos;
    }
}