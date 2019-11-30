'use strict';

import utils from './utils-service.js';

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

        var closestPlayer = players[0];
        players.forEach(player => {
            if (utils.absValue(player.pos.j) < utils.absValue(closestPlayer.pos.j)) {
                closestPlayer = player;
            }
        });

        var dif = (closestPlayer.pos.j >= obj.pos.j)? 1 : -1;
        var newPos = {i: obj.pos.i, j: obj.pos.j+(dif*obj.speed)};
        return newPos;
    }
}