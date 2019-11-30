'use strict';

const BoardWidth = 50;
const BoardHeight = 70;
const BorderMAtChar = 'B';
const SpaceMAtChar = 'S';


export default {
    createBoardMat,
    checkIfPosInMat,
    checkIfGrownedHit,
    BoardWidth,
    BoardHeight,
    BorderMAtChar,
    SpaceMAtChar
}

var gBordMat;


//check if object made it to the grownd
function checkIfGrownedHit(pos) {
    if (pos.i >= BoardHeight-3) return true;
    else return false;
}

function checkIfPosInMat(pos) {
    // return (gBordMat[pos.i] && gBordMat[pos.i][pos.j]);
    return (pos.i >= 2 && pos.i < BoardHeight-2 &&
            pos.j >= 2 && pos.j < BoardWidth-2);
}
//create the game board matrix
function createBoardMat(player) {
    var boardMAt = [];
    for (var i = 0; i < BoardHeight; i++) {
        boardMAt[i] = [];
        for (var j = 0; j < BoardWidth; j++) {
            // if (i === player.pos.i && j === player.pos.j) {boardMAt[i][j] = player; continue;}
            if (i === 0 || i === BoardHeight-1 || j === 0 || j === BoardWidth-1) {boardMAt[i][j] = BorderMAtChar; continue;}
            else boardMAt[i][j] = SpaceMAtChar;
        }
    }
    gBordMat = boardMAt;
    return boardMAt;
}
