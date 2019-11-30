'use strict';


export default {
    getRandomInt,
    getRandomId,
    saveToLocalStorage,
    loadFromLocalStorage,
    absValue,
}

export function renderText(selector, txtStr) {
    document.querySelector(selector).innerText = txtStr;
}

export function renderHTML(selector, htmlStr) {
    document.querySelector(selector).innerHTML = htmlStr;
}

function getRandomId() {
    var pt1 = Date.now().toString(16);
    var pt2 = getRandomInt(1000, 9999).toString(16);
    var pt3 = getRandomInt(1000, 9999).toString(16);
    return `${pt3}${pt1}${pt2}`.toUpperCase();
}

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
}

function loadFromLocalStorage(key) {
    return new Promise((resolve, reject) => {
        let data = JSON.parse(localStorage.getItem(key));
        if (data) {
            resolve(data);
        }
        else reject(`${key} was not found in local storage`);
    }) 
}


//get absolute value
function absValue(num) {
    if (num < 0) return (num * -1);
    else return num
}

//get random init
function getRandomInt(num1, num2) {
    var maxNum = (num1 > num2)? num1+1 : num2+1;
    var minNum = (num1 < num2)? num1 : num2;
    var randomNumber = (Math.floor(Math.random()*(maxNum - minNum)) + minNum);
    return randomNumber;
}