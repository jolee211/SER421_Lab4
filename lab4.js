// if suspects, weapons, and rooms are not defined, initialize them here
// if they're already defined, then these will not happen
if (!suspects) {
    var suspects = [ 'Miss Scarlett', 'Rev Green', 'Colonel Mustard', 'Professor Plum', 'Mrs. Peacock', 'Mrs. White' ];
}
if (!weapons) {
    var weapons = [ 'Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench' ];
}
if (!rooms){
    var rooms = [ 'Kitchen', 'Ballroom', 'Conservatory', 'Dining Room', 'Cellar', 'Billiard Room', 'Library', 'Lounge', 'Hall', 'Study' ];
}

// globals to store the secret triplet
var secretSuspect, secretRoom, secretWeapon;
// globals to store the user cards
var userSuspects = [], userRooms = [], userWeapons = [];
// globals to store the computer cards
var computerSuspects = [], computerRooms = [], computerWeapons = [];
// globals for storing the computer guesses
var compGuessSuspects = [], compGuessRooms = [], compGuessWeapons = [];
// variable for someone winning
let someoneWon = false;
// variable for whether it was the user's turn
let userTurn = true;
// store wrong computer guesses
let wrongComputerGuesses = [];
// key to sessionStorage of user guesses array
const USER_GUESSES_KEY = 'userGuesses';
// key to sessionStorage of computer guesses array
const COMPUTER_GUESSES_KEY = 'computerGuesses';
// key to localStorage of computer wins
const COMPUTER_WINS_KEY = 'computerWins';
// key to localStorage of computer losses
const COMPUTER_LOSSES_KEY = 'computerLosses';
// key to sessionStorage of username
const USERNAME_KEY = 'username';
// key to localStorage of player history
const PLAYER_HISTORY_KEY = 'playerHistory';

resetSessionStorage();

if (!localStorage.getItem(COMPUTER_WINS_KEY)) {
    localStorage.setItem(COMPUTER_WINS_KEY, '0');
}
if (!localStorage.getItem(COMPUTER_LOSSES_KEY)) {
    localStorage.setItem(COMPUTER_LOSSES_KEY, '0');
}

// Render the first version of the page
function init() {
    // Display the full set of suspects, rooms, and weapons at the top of the page
    document.getElementById("suspects").innerHTML = suspects.join(', ');
    document.getElementById("weapons").innerHTML = weapons.join(', ');
    document.getElementById("rooms").innerHTML = rooms.join(', ');
}

function showHtmlElement(element) {
    element.style.display = 'block';
}

function hideHtmlElement(element) {
    element.style.display = 'none';
}

function saveUsername(username) {
    sessionStorage.setItem(USERNAME_KEY, username);
}

function getUsername() {
    return sessionStorage.getItem(USERNAME_KEY);
}

// When the user enters their name, replace the initial form with a welcome message
function showWelcome() {
    let username = document.getElementById("username").value;
    if (username.length > 0) {
        let usernameFormDiv = document.getElementById("usernameForm");
        let welcomeDiv = document.getElementById("welcome");
        hideHtmlElement(usernameFormDiv);
        showHtmlElement(welcomeDiv);
        welcomeDiv.innerHTML = `Welcome ${username}`;
        saveUsername(username);
    }
}

function hideWelcome() {
    let usernameFormDiv = document.getElementById("usernameForm");
    let welcomeDiv = document.getElementById("welcome");
    showHtmlElement(usernameFormDiv);
    hideHtmlElement(welcomeDiv);
}

function resetSessionStorage() {
    sessionStorage.clear();
    sessionStorage.setItem(USER_GUESSES_KEY, '');
    sessionStorage.setItem(COMPUTER_GUESSES_KEY, '');
}

function getUserGuesses() {
    return sessionStorage.getItem(USER_GUESSES_KEY);
}

function getNumberFromLocalStorage(key) {
    let string = localStorage.getItem(key);
    if (string) {
        return parseInt(string, 10);
    }
    return 0;
}

function getComputerWins() {
    return getNumberFromLocalStorage(COMPUTER_WINS_KEY);
}

function getComputerLosses() {
    return getNumberFromLocalStorage(COMPUTER_LOSSES_KEY);
}

function incrementComputerWins() {
    let wins = getComputerWins() + 1;
    localStorage.setItem(COMPUTER_WINS_KEY, wins.toString());
}

function incrementComputerLosses() {
    let wins = getComputerLosses() + 1;
    localStorage.setItem(COMPUTER_LOSSES_KEY, wins.toString());
}

function addUserGuess(value) {
    let userGuesses = getUserGuesses();
    userGuesses += value;
    sessionStorage.setItem(USER_GUESSES_KEY, userGuesses);
}

function getComputerGuesses() {
    return sessionStorage.getItem(COMPUTER_GUESSES_KEY);
}

function addComputerGuess(value) {
    let computerGuesses = getComputerGuesses();
    computerGuesses += value;
    sessionStorage.setItem(COMPUTER_GUESSES_KEY, computerGuesses);
}

// Generate a random number between 0 and length-1
function randomIndex(length) {
    return Math.floor(Math.random() * length);
}

// Swap the elements of the given array. The elements are those at the specified indexes.
function swapArrayElements(array, m, i) {
    t = array[m];
    array[m] = array[i];
    array[i] = t;
}

// Shuffle in-place the elements of the specified array
function shuffle(array) {
    let m = array.length, i;
    while (m) {
        i = randomIndex(m--);
        swapArrayElements(array, m, i);
    }
}

function resetArrays() {
    userSuspects = [];
    userRooms = [];
    userWeapons = [];
    computerSuspects = [];
    computerRooms = [];
    computerWeapons = [];
    compGuessSuspects = [];
    compGuessRooms = [];
    compGuessWeapons = [];
    wrongComputerGuesses = [];
}

// Randomly select the secret item, then randomly distribute the remaining cards equally to the 
// user and the computer.
// The fnLogItem function is used to do some processing after the index for the secret item is
// generated.
function initArray(array, computerArray, userArray, fnLogItem) {
    // randomly select the secret item
    let secretIndex = randomIndex(array.length);
    fnLogItem(secretIndex);

    // remove secret item from deck
    let shuffledArray = [...array];
    shuffledArray.splice(secretIndex, 1);
    // randomize the array
    shuffle(shuffledArray);
    // deal the rest of the cards to computer and user
    shuffledArray.forEach((val, i) => {
        let shuffledItem = shuffledArray[i];
        if (i === 0 || i % 2 === 0) {  // i is even
            computerArray.push(shuffledItem);
        } else {    // i is odd
            userArray.push(shuffledItem);
        }
    });
}

// Initialize the arrays for rooms, weapons, and suspects
function initArrays() {
    // initialize the suspects array
    initArray(suspects, computerSuspects, userSuspects,
        // use the callback to store the secrete suspect
        (i) => {
            secretSuspect = suspects[i];
        });
    console.log('computerSuspects = ' + computerSuspects);
    // initialize the rooms array
    initArray(rooms, computerRooms, userRooms,
        // use the callback to store the secrete room
        (i) => {
            secretRoom = rooms[i];
        });
    console.log('computerRooms = ' + computerRooms);
    // initialize the weapons array
    initArray(weapons, computerWeapons, userWeapons,
        // use the callback to store the secrete weapon
        (i) => {
            secretWeapon = weapons[i];
        });
    console.log('computerWeapons = ' + computerWeapons);
    console.log(`Secret: ${secretSuspect}, ${secretRoom}, ${secretWeapon}`);

    // assemble an array of options that takes the rooms and excludes the ones that the user has
    let roomOptions = filterOut(rooms, userRooms);
    // assemble an array of options that takes the suspects and excludes the ones that the user has
    let suspectOptions = filterOut(suspects, userSuspects);
    // assemble an array of options that takes the suspects and excludes the ones that the user has
    let weaponOptions = filterOut(weapons, userWeapons);
    setOptions('guessSuspect', suspectOptions);
    setOptions('guessRoom', roomOptions);
    setOptions('guessWeapon', weaponOptions);
}

//  Display the set of “cards” the human user “holds in their hand”
function showUserCards() {
    let cardsHtml = 'You hold the following cards:<br>';
    cardsHtml += 'Rooms: ' + userRooms.join(', ') + '<br>';
    cardsHtml += 'Suspects: ' + userSuspects.join(', ') + '<br>';
    cardsHtml += 'Weapons: ' + userWeapons.join(', ') + '<br>';
    let userCardsDiv = document.getElementById("userCards");
    userCardsDiv.innerHTML = cardsHtml;
}

function hideUserCards() {
    let userCardsDiv = document.getElementById("userCards");
    userCardsDiv.innerHTML = '';
}

// Return an array that includes all elements from arrayToFilter except those that also appear in
// elemsToRemove
function filterOut(arrayToFilter, elemsToRemove) {
    return arrayToFilter.filter((el) => {
        return elemsToRemove.indexOf(el) < 0;
    });
}

// Clear all the elements in the HTML select with the specified ID
function resetOptions(selectId) {
    let select = document.getElementById(selectId);
    let length = select.options.length;
    for (let i = length - 1; i >= 0; i--) {
        select.options[i] = null;
    }
}

// Set the options for the HTML select with the specified ID
// If there are existing options, they will be replaced by the specified array
function setOptions(selectId, options) {
    // clear out all the options
    resetOptions(selectId);

    // add the options
    let select = document.getElementById(selectId);
    for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        let el = document.createElement('option');
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}

function showGuessForm() {
    let guessForm = document.getElementById('guessForm');
    showHtmlElement(guessForm);
}

function hideGuessForm() {
    let guessForm = document.getElementById('guessForm');
    hideHtmlElement(guessForm);
}

// Run this after the user enters a name
function start() {
    showWelcome();
    // initialize the array
    initArrays();
    showUserCards();
    // show the form for choosing a guess
    showGuessForm();
}

function hideMessage() {
    let messageElement = document.getElementById('message');
    messageElement.innerHTML = '';
}

function hideContinue() {
    let continueDiv = document.getElementById('continue');
    hideHtmlElement(continueDiv);
}

function showHistoryDiv() {
    let historyDiv = document.getElementById('history');
    showHtmlElement(historyDiv);
}

function hideHistoryDiv() {
    let historyDiv = document.getElementById('history');
    hideHtmlElement(historyDiv);
}

function reset() {
    someoneWon = false;
    userTurn = true;
    hideWelcome();
    resetArrays();
    hideUserCards();
    hideGuessForm();
    hideMessage();
    hideContinue();
    resetOptions('guessSuspect');
    resetOptions('guessRoom');
    resetOptions('guessWeapon');
    hideHistoryDiv();
    resetSessionStorage();
}

// Choose one element from guessArray that doesn't match secretArray.
// Return undefined if all elements match.
function getOneWrongComponent(guessArray, secretArray) {
    let guessArrayCopy = [...guessArray];
    let secretArrayCopy = [...secretArray];
    let m = secretArray.length, i;
    while (m) {
        i = randomIndex(m--);
        if (guessArrayCopy[i] != secretArrayCopy[i]) {
            return guessArrayCopy[i];
        } else {
            guessArrayCopy.splice(i, 1);
            secretArrayCopy.splice(i, 1);
        }
    }
}

function showContinueDiv() {
    let continueDiv = document.getElementById('continue');
    showHtmlElement(continueDiv);
}

function doSomeoneWon() {
    someoneWon = true;
    showContinueDiv();
}

function guess() {
    let guessSuspect = document.getElementById('guessSuspect').value;
    let guessRoom = document.getElementById('guessRoom').value;
    let guessWeapon = document.getElementById('guessWeapon').value;
    addUserGuess(`${guessSuspect}, ${guessRoom}, ${guessWeapon}<br>`);
    updateHistory();

    let messageElement = document.getElementById('message');
    if (guessSuspect === secretSuspect && guessRoom === secretRoom && guessWeapon === secretWeapon) {
        messageElement.innerHTML = 'Congratulations! You win!';
        incrementComputerLosses();
        doSomeoneWon();
        updateRecord(getUsername(), -1);
    } else {
        let wrongComponent = getOneWrongComponent(
            [guessSuspect,  guessRoom,  guessWeapon], 
            [secretSuspect, secretRoom, secretWeapon]
        ); 
        messageElement.innerHTML = 'Your guess did not match the secret.<br> Incorrect component: ' + wrongComponent;
        someoneWon = false;
        hideGuessForm();
        showContinueDiv();
    }
    showHistoryDiv();
}

function doContinue() {
    if (someoneWon) {
        reset();
    } else {
        hideMessage();
        if (userTurn) {
            userTurn = false;
            hideGuessForm();
            doComputerGuess();
        } else {
            userTurn = true;
            showGuessForm();
            hideContinue();
        }
    }
}

// Make a guess for the computer. The guess must be taken from a combination of the specified array
// and the secret. The computer should not repeat previous guesses, so another array that contains
// previous guesses is included.
function randomGuessFrom(arrayToGuessFrom, secret, notThisOne) {
    // copy orig array
    let guessArray = [...arrayToGuessFrom];
    guessArray.push(secret);

    // filter out contents of notThisOne from guessArray
    guessArray = guessArray.filter((el) => {
        return notThisOne.indexOf(el) < 0;
    });
    let guessIndex = randomIndex(guessArray.length);
    return guessArray[guessIndex];
}

function doComputerGuess() {
    let compGuessSuspect = randomGuessFrom(userSuspects, secretSuspect, wrongComputerGuesses);
    let compGuessRoom = randomGuessFrom(userRooms, secretRoom, wrongComputerGuesses);
    let compGuessWeapon = randomGuessFrom(userWeapons, secretWeapon, wrongComputerGuesses);
    addComputerGuess(`${compGuessSuspect}, ${compGuessRoom}, ${compGuessWeapon}<br>`);
    updateHistory();

    let messageElement = document.getElementById('message');
    let messageText = `Computer guess: Suspect: ${compGuessSuspect} Room: ${compGuessRoom} Weapon: ${compGuessWeapon} <br>`;
    if (compGuessSuspect === secretSuspect && compGuessRoom === secretRoom && compGuessWeapon === secretWeapon) {
        messageText += 'Computer wins!';
        messageElement.innerHTML = messageText;
        doSomeoneWon();
        incrementComputerWins();
        updateRecord(getUsername(), 1);
    } else {
        let wrongComponent = getOneWrongComponent(
            [compGuessSuspect,  compGuessRoom,  compGuessWeapon], 
            [secretSuspect, secretRoom, secretWeapon]
        ); 
        wrongComputerGuesses.push(wrongComponent);
        console.log('wrongComputerGuesses = ' + wrongComputerGuesses);
        messageText += 'Computer guess did not match the secret.<br> Incorrect component: ' + wrongComponent;
        messageElement.innerHTML = messageText;
        someoneWon = false;
    }
}

function guessHistoryHTML(fistLine, guessHistory) {
    let historyLinesHTML = fistLine;
    historyLinesHTML += guessHistory;
    historyLinesHTML += '<br>';
    return historyLinesHTML;
}

function showOrHideHistory() {
    let showHistoryBtn = document.getElementById('showHistory');
    let historyLinesDiv = document.getElementById('historyLines');
    if (showHistoryBtn.innerHTML === 'Hide History') {
        historyLinesDiv.style.display = 'none';
        showHistoryBtn.innerHTML = 'Show History';
    } else {
        historyLinesDiv.style.display = 'block';
        showHistoryBtn.innerHTML = 'Hide History';
        updateHistory();
    }
}

function updateHistory() {
    let historyLinesDiv = document.getElementById('historyLines');
    if (historyLinesDiv.style.display === 'block') {
        let historyLinesHTML = guessHistoryHTML('User guesses:<br>', getUserGuesses());
        historyLinesHTML += guessHistoryHTML('Computer guesses:<br>', getComputerGuesses());
        historyLinesDiv.innerHTML = historyLinesHTML;
    }
}

function getWinLossHTML() {
    let html = 'Computer Record (W-L): ' + getComputerWins() + '-' + getComputerLosses() + '<br>';
    return html;
}

function getPlayerHistory() {
    return localStorage.getItem(PLAYER_HISTORY_KEY);
}

function savePlayerHistory(newHistory) {
    localStorage.setItem(PLAYER_HISTORY_KEY, newHistory);
}

function addPlayerHistory(username, winLoss) {
    let currentHistory = getPlayerHistory();
    if (!currentHistory) {
        currentHistory = '';
    }

    currentHistory += username + ' ---- Computer ';
    if (winLoss > 0) {
        currentHistory += 'WON ';
    } else {
        currentHistory += 'LOST ';
    }
    currentHistory += ' ---- ' + new Date() + '<br>';
    savePlayerHistory(currentHistory);
}

function updateRecord(username, winLoss) {
    if (username && winLoss) {
        addPlayerHistory(username, winLoss);
    }

    let recordLinesDiv = document.getElementById('recordLines');
    if (recordLinesDiv.style.display === 'block') {
        let recordLinesHTML = getWinLossHTML();
        if (recordLinesHTML) {
            let playerHistory = getPlayerHistory();
            if (playerHistory) {
                recordLinesHTML += playerHistory;
            }
        }
        recordLinesDiv.innerHTML = recordLinesHTML;
    }
}

function showOrHideRecord() {
    let showRecordBtn = document.getElementById('showRecord');
    let recordLinesDiv = document.getElementById('recordLines');
    if (showRecordBtn.innerHTML === 'Hide Record') {
        recordLinesDiv.style.display = 'none';
        showRecordBtn.innerHTML = 'Show Record';
    } else {
        recordLinesDiv.style.display = 'block';
        showRecordBtn.innerHTML = 'Hide Record';
        updateRecord();
    }
}