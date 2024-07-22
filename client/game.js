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

        let keyboardKeyId = currentGuess[letterNum].toLowerCase();
        const keyboardKey = document.getElementById(keyboardKeyId);

        if(matchingLetters[letterNum] === "green") {
            guessLetter.style.backgroundColor = "green";
            keyboardKey.style.backgroundColor = "green";

        } else if (matchingLetters[letterNum] === "yellow") {
            guessLetter.style.backgroundColor = "yellow";
            // Only update keyboard key to yellow if not already green
            if(keyboardKey.style.backgroundColor != "green") {
                keyboardKey.style.backgroundColor = "yellow";
            }
        } else {
            guessLetter.style.backgroundColor = "gray";
            // Only update keyboard key to gray if not already green/yellow
            if(keyboardKey.style.backgroundColor != "green" && keyboardKey.style.backgroundColor != "yellow") {
                keyboardKey.style.backgroundColor = "gray";
            }
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
    // Keep map of letter counts in current word to track duplicate letters (avoid false positives)
    let letterMap = new Map();
    for(let i = 0; i < 5; i++) {
        letterMap.set(currentWord[i], (letterMap[currentWord[i]] || 0) + 1)
    }

    let matchingPositions = Array(5).fill(false);
    // Check for matching letters in same position and build string based on letters not matched
    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === currentWord[i]) {
            matchingPositions[i] = true;
            letterMap.set(currentGuess[i], letterMap[currentGuess[i]] - 1)
        }
    }

    let matchingLetters = Array(5).fill(false);

    // Check for matching letters in different position
    for (let i = 0; i < 5; i++) {
        if(matchingPositions[i] === true) {
            continue;
        } else {
            if (currentWord.includes(currentGuess[i]) && letterMap.get(currentGuess[i]) >= 1) {
                matchingLetters[i] = true;
                letterMap.set(currentGuess[i], letterMap[currentGuess[i]] - 1)
            }
        }
    }

    // Build final array for matching letters
    // Green (contains same letter/position), Yellow (contains same letter), Gray (does not contain letter)
    let result = [];
    for (let i = 0; i < 5; i++) {
        if(matchingPositions[i]) {
            result.push("green");
        } else if (matchingLetters[i]) {
            result.push("yellow");
        } else {
            result.push("gray");
        }
    }

    return result;
}

// Update game state - win, loss, or just go to next turn
function checkGameState(matchingLetters) {
    // Check for win
    let win = true;
    for (let i = 0; i < 5; i++) {
        if(matchingLetters[i] != "green") {
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
    // Set name and username in top right  
    const usernameElement = document.getElementById("userUsername");
    let name = localStorage.getItem("personName");
    let username = localStorage.getItem("username");
    usernameElement.innerText = name + ", " + username;

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