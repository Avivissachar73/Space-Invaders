'use strict';


import utils from './utils-service.js';

export default {
    setPlayers
}



/*PLAYER SERVICE*/
// function setPlayer(pos) {
//     var player = _createPlayer(pos);
//     player.health = player.maxHealth;
//     return player;
// }
function setPlayers(board, amountOfPlayers) {
    var players = [];
    if (amountOfPlayers === 1) {
        players.push(_createPlayer({i: board.length-3, j: Math.floor(board[0].length/2)}, 'player_1'));   
    }
    if (amountOfPlayers === 2) {
        players.push(_createPlayer({i: board.length-3, j: Math.floor(board[0].length/3*2)}, 'player_1'));
        players.push(_createPlayer({i: board.length-3, j: Math.floor(board[0].length/3)}, 'player_2'));
    }
    players.forEach(player => {
        player.health = player.maxHealth;
        board[player.pos.i][player.pos.j] = player;
    });
    return players;
}

//create the player
function _createPlayer(pos, id = 'player_1') {
    var player = {
        // id: utils.getRandomId(),
        id: id,
        type: 'player',
        subType: 'player',
        pos: pos,
        maxHealth: 100,
        health: null,
        score: 0,
        speed: 2,
        imgSrc: `images/space_ship.png`,
        bulletPower: 30,
        // bulletSpeed: -3,
        bulletSpeed: -5,
        bulletLevel: 1,
        isShowHealthBar: false,
        widthRadius:1,
        bullets: []
    };
    return player;
}