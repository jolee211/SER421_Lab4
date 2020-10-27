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

// When the user’s enters their name, replace the initial form with a welcome message
function showWelcome() {
    let username = document.getElementById("username").value;
    if (username.length > 0) {
        let usernameFormDiv = document.getElementById("usernameForm");
        let welcomeDiv = document.getElementById("welcome");
        usernameFormDiv.style.display = "none";
        showHtmlElement(welcomeDiv);
        welcomeDiv.innerHTML = `Welcome ${username}`;
    }
}

// globals to store the secret triplet
var secretSuspect, secretRoom, secretWeapon;
// globals to store the user cards
var userSuspects = [], userRooms = [], userWeapons = [];
// globals to store the computer cards
var computerSuspects = [], computerRooms = [], computerWeapons = [];

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
    var m = array.length, t, i;
    while (m) {
        i = randomIndex(m--);
        swapArrayElements(array, m, i);
    }
}

// Initialize the arrays for rooms, weapons, and suspects
function initArrays() {
    // initialize the suspects array
    initArray(suspects, computerSuspects, userSuspects,
        // use the callback to store the secrete suspect
        (i) => {
            secretSuspect = suspects[i];
            console.log(`secretSuspect = ${secretSuspect}`);
        });
        
    // initialize the rooms array
    initArray(rooms, computerRooms, userRooms,
        // use the callback to store the secrete suspect
        (i) => {
            secretRoom = rooms[i];
            console.log(`secretRoom = ${secretRoom}`);
        });

    // initialize the weapons array
    initArray(weapons, computerWeapons, userWeapons,
        // use the callback to store the secrete suspect
        (i) => {
            secretWeapon = weapons[i];
            console.log(`secretWeapon = ${secretWeapon}`);
        });
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
    console.log('shuffled = ' + shuffledArray);
    // deal the rest of the cards to computer and user
    shuffledArray.forEach((val, i) => {
        let shuffledItem = shuffledArray[i];
        if (i === 0 || i % 2 === 0) {  // i is even
            computerArray.push(shuffledItem);
        } else {    // i is odd
            userArray.push(shuffledItem);
        }
    });
    console.log('userArray = ' + userArray);
    console.log('computerArray = ' + computerArray);
}

//  Display the set of “cards” the human user “holds in their hand”
function showUserCards() {
    let cardsHtml = 'You hold the following cards:<br>';
    cardsHtml += 'Rooms: ' + userRooms.join(', ') + '<br>';
    cardsHtml += 'Suspects: ' + userSuspects.join(', ') + '<br>';
    cardsHtml += 'Weapons: ' + userWeapons.join(', ') + '<br>';
    document.getElementById("userCards").innerHTML = cardsHtml;
}

// Return an array that includes all elements from arrayToFilter except those that also appear in
// elemsToRemove
function filterOut(arrayToFilter, elemsToRemove) {
    return arrayToFilter.filter((el) => {
        return elemsToRemove.indexOf(el) < 0;
    });
}

function addOptions(selectId, options) {
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
    // assemble an array of options that takes the rooms and excludes the ones that the user has
    let roomOptions = filterOut(rooms, userRooms);
    // assemble an array of options that takes the suspects and excludes the ones that the user has
    let suspectOptions = filterOut(suspects, userSuspects);
    // assemble an array of options that takes the suspects and excludes the ones that the user has
    let weaponOptions = filterOut(weapons, userWeapons);
    addOptions('guessSuspect', suspectOptions);
    addOptions('guessRoom', roomOptions);
    addOptions('guessWeapon', weaponOptions);

    let guessForm = document.getElementById('guessForm');
    showHtmlElement(guessForm);   
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
