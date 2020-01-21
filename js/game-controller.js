'use strict';

import {renderHTML, renderText} from './services/utils-service.js';
import eventService from './services/event.service.js';

export default {
    renderBoard,
    renderGameInformation,
    connectEvents
}

function connectEvents() {
    eventService.on('objectMove', renderCell);
    eventService.on('removeObject', doRemoveObject);
    eventService.on('gameFinish', doGameFinish);
    eventService.on('settingWave', renderGameInformation);
    eventService.on('waveStarted', currWave => console.log('wave:', currWave));
    eventService.on('playerFired', () => console.log('fire!'));
    eventService.on('enemyDied', enemy => console.log('enemy died:', enemy));
    eventService.on('playerDied', doRemoveObject);

    console.log('controller was connected');
}
// connectEvents();

function doGameFinish() {
    renderGameInformation();
    document.querySelector('.game-holder .resurm-button').style.display = 'none';
    document.querySelector('.game-holder').style.display = 'block';
    renderText('.game-holder h2', 'Game Over..')
    renderText('.game-holder .restart-button', 'Play again')
}

function doRemoveObject(obj) {
    var objClass = (obj.type !== 'enemy')? obj.type : obj.subType;
    var elCell = document.querySelector(`[data-i="${obj.pos.i}"][data-j="${obj.pos.j}"]`);
    elCell.classList.remove(objClass);
    elCell.innerHTML = null;
    renderGameInformation();
}

function getHtmlStr(obj) {
    var htmlStr = `<img src="${obj.imgSrc}"/>`;
    if (!obj.health) return htmlStr;
    return `${htmlStr}${grtHealthbarHtmlStr(obj)}`;
}              
function grtHealthbarHtmlStr(obj, isShowHealthBar = false) {
    var currHelthPercents = getHelthPercents(obj);
    var classes = (obj.isShowHealthBar || obj.subType === 'super-enemy' || isShowHealthBar)? 'health-bar show' : 'health-bar';
    return `<div class="${classes}"><div class="inner-health-bar" 
            style="width:${currHelthPercents}%"></div></div>`;
}
function getHelthPercents(obj) {
    if (obj.health <= 0) return 0;
    return (obj.health / obj.maxHealth) * 100;
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
async function renderGameInformation() {
    var players = await eventService.emit('getPlayers');
    var playersInfoHtmlStr = players.map(player => {
        return `<div class="player-info flex column"><h5 class="multi-player-element">${player.id}</h5>
                ${grtHealthbarHtmlStr(player, true)}
                <h5>Score: <span>${player.score}</span></h5></div>`
    }).join('');
    renderHTML('.players-info', playersInfoHtmlStr);

    renderText('.game-info .best-score span', await eventService.emit('getBestScore'));
    renderText('.game-info .wave span', await eventService.emit('getCurrWave'));
}


//render the game matrix to html table
async function renderBoard() {
    var board = await eventService.emit('getBoard');
    var htmlStr = '';
    htmlStr += '<table>';
    for (var i = 0; i < board.length; i++) {
        htmlStr += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var currObj = board[i][j];
            htmlStr += `<td data-i="${i}" data-j="${j}" class="board-cell ${(() => {return (currObj.type !== 'space' && currObj.type !== 'border')? 'space' : ''})()} ${currObj.type}">
                            ${(() => {return currObj.imgSrc? `<img src="${currObj.imgSrc}"/>` : ''})()}
                        </td>`;
        }
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    renderHTML('.game-board .game-table', htmlStr);
}