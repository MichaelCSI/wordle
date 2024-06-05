const fiveLetterWords = [
    "apple", "bread", "candy", "drink", "eagle",
    "fruit", "grape", "honey", "image", "joker",
    "knife", "lemon", "mango", "night", "ocean",
    "piano", "queen", "robot", "snake", "tiger",
    "unite", "vivid", "whale", "viola", "young",
    "zebra", "amber", "blaze", "charm", "dwarf",
    "eager", "flame", "globe", "haste", "irony",
    "jewel", "kneel", "loyal", "mirth", "novel",
    "oasis", "plush", "quake", "realm", "spine",
    "trend", "usher", "vigor", "waltz", "peach",
    "yeast", "azure", "boast", "crisp", "daisy",
    "elite", "fancy", "glory", "haste", "ivory",
    "jolly", "knead", "leapt", "moist", "noble",
    "otter", "pearl", "quill", "raven", "sight",
    "twist", "ultra", "voice", "wrath", "xerox",
    "youth", "zonal", "afire", "bloom", "chase",
    "dwell", "enact", "flesh", "grasp", "hound",
    "intro", "jumpy", "kudos", "lodge", "merit"
];

let currentWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)].toUpperCase();
let currentGuess = []
let numberOfGuessesLeft = 6;

// Create the html elements for the game tiles
function createLayout() {
    const gameLayout = document.getElementById("gameLayout");
    gameLayout.innerHTML = "";
    // Create 6 rows
    for (let rowNumber = 0; rowNumber < 6; rowNumber++) {
        let row = document.createElement("div");
        row.className = "word-row";
        row.id = "row" + rowNumber;
        gameLayout.appendChild(row);

        // Create 5 letters for each row
        for (let columnNumber = 0; columnNumber < 5; columnNumber++) {
            let column = document.createElement("div");
            column.className = "row-letter";
            column.id = "row" + rowNumber + "Letter" + columnNumber;
            row.appendChild(column);
        }
    }
}

// Create an html element for a win/loss popup
function createPopup(message) {
    const popup = document.getElementById("popup");
    popup.innerHTML = message;
    // Fade the popup in and out
    popup.classList.toggle("fade-in");
    setTimeout(() => {
        popup.classList.toggle("fade-in");
    }, 2000);
}

// Read keyboard input from user
function handleKeyPress(event) {
    // Check if the pressed key is a letter with regex
    if (event.key.match(/^[a-zA-Z]$/)) {
        addLetter(event.key.toUpperCase());
    } else if (event.key === "Backspace") {
        deleteLetter();
    } else if(event.key === "Enter") {
        submitWord();
    } else {
        return;
    }
}

// Add a letter to the current guess
function addLetter(letter) {
    if(currentGuess.length >= 5) {
        console.log("Word is already 5 letters long");
        return;
    }
    currentGuess.push(letter);
    setLetter(letter);
}

// Helper function for adding/removing letters from the UI
function setLetter(letter) {
    let rowNum = 6 - numberOfGuessesLeft;
    let letterNum = currentGuess.length - 1;
    const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);
    letterElement.innerHTML = letter;
}

// Remove a letter to the current guess
function deleteLetter() {
    if(currentGuess.length <= 0) {
        console.log("Word is already empty");
        return;
    }
    // Pop from array after UI deletion to avoid index errors
    setLetter("")
    currentGuess.pop()
}

// Submit a word as a guess
function submitWord() {
    if(currentGuess.length != 5) {
        console.log("Word is not 5 letters long");
        return;
    }
    let matchingLetters = checkWords();

    // Update guess board and keyboard colors on UI for correct letters
    let rowNum = 6 - numberOfGuessesLeft;
    for (let letterNum = 0; letterNum < 5; letterNum++) {
        const guessLetter = document.getElementById("row"+rowNum+"Letter"+letterNum);
        guessLetter.style.color = "black";

        if(matchingLetters[letterNum] === 3) {
            guessLetter.style.backgroundColor = "green";

            let keyboardKeyId = currentGuess[letterNum].toLowerCase();
            const keyboardKey = document.getElementById(keyboardKeyId);
            keyboardKey.style.backgroundColor = "green";

        } else if (matchingLetters[letterNum] === 2) {
            guessLetter.style.backgroundColor = "yellow";

            let keyboardKeyId = currentGuess[letterNum].toLowerCase();
            const keyboardKey = document.getElementById(keyboardKeyId);
            keyboardKey.style.backgroundColor = "yellow";

        } else {
            guessLetter.style.backgroundColor = "gray";

            let keyboardKeyId = currentGuess[letterNum].toLowerCase();
            const keyboardKey = document.getElementById(keyboardKeyId);
            keyboardKey.style.backgroundColor = "gray";

        }
    }

    numberOfGuessesLeft--;
    currentGuess = [];

    // Wait a bit for UI to update, then check for win/loss/continue
    setTimeout(() => {
        checkGameState(matchingLetters)
      }, 1000);
}


// Helper function for word submission
function checkWords() {
    let matchingPositions = Array(5).fill(false);
    let matchingLetters = Array(5).fill(false);
    
    // Build guess word from guess array
    let guessedWord = "";
    for (let i = 0; i < 5; i++) {
        guessedWord += currentGuess[i];
    }

    // Check for matching letters in same position
    for (let i = 0; i < 5; i++) {
        if (guessedWord[i] === currentWord[i]) {
            matchingPositions[i] = true;
            matchingLetters[i] = true;
        }
    }

    // Check for matching letters in different position
    for (let i = 0; i < 5; i++) {
        if(matchingPositions[i] === true || matchingLetters[i] == true) {
            continue;
        } else {
            if (currentWord.includes(guessedWord[i])) {
                matchingLetters[i] = true;
            }
        }
    }

    // Build final array for matching letters
    // 3 (contains same letter/position), 2 (contains same letter), 1 (does not contain letter)
    let result = [];
    for (let i = 0; i < 5; i++) {
        if(matchingPositions[i] && matchingLetters[i]) {
            result.push(3);
        } else if (matchingLetters[i]) {
            result.push(2);
        } else {
            result.push(1);
        }
    }

    return result;
}

// Update game state - win, loss, or just go to next turn
function checkGameState(matchingLetters) {
    // Check for win
    let win = true;
    for (let i = 0; i < 5; i++) {
        if(matchingLetters[i] != 3) {
            win = false;
        }
    }
    if(win) {
        createPopup("YOU WON");
        setTimeout(resetGame, 3000);
        return;
    }

    // Check for loss
    if(numberOfGuessesLeft === 0){
        createPopup("YOU LOST<br>Correct Word: "+currentWord);
        setTimeout(resetGame, 3000);
        return;
    }
}


function resetGame() {
    currentWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)].toUpperCase();
    numberOfGuessesLeft = 6;
    currentGuess = [];
    const keyboardKeys = document.getElementsByClassName("keyboard-button");
    for(let i = 0; i < keyboardKeys.length; i++) {
        let currentKey = keyboardKeys[i];
        currentKey.style.backgroundColor = "ivory";
    }
    createLayout();
}

function startGame() {
    createLayout();

    // Set up listener for keyboard input and onClicks for UI keyboard
    window.addEventListener("keydown", handleKeyPress);
    const keyboardKeys = document.getElementsByClassName("keyboard-button");
    for(let i = 0; i < keyboardKeys.length; i++) {
        let currentKey = keyboardKeys[i];
        if(currentKey.innerHTML === "Enter") {
            currentKey.onclick = function() {
                // Prevent repeated submissions / clicks for the same guess
                currentKey.disabled = true;
                submitWord();
                setTimeout(() => {
                    currentKey.disabled = false;
                  }, 1000);
            }
        } else if(currentKey.innerHTML === "Delete") {
            currentKey.onclick = deleteLetter;
        } else {
            currentKey.onclick = function() {
                addLetter(currentKey.innerHTML)
            };
        }
    }
}

startGame();