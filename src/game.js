const fiveLetterWords = [
    "apple", "grape", "lemon", "melon", "peach"
];
  
let currentWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)].toUpperCase();
let currentGuess = []
let numberOfGuessesLeft = 6;

function createLayout() {
    const gameLayout = document.querySelector("#gameLayout");
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

function handleKeyPress(event) {
    // Check if the pressed key is a letter
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
    // TODO
    // Submitted word has to be valid? Get list from the internet?
    // Could modify it to not require valid words as input
function submitWord() {
    if(currentGuess.length != 5) {
        console.log("Word is not 5 letters long");
        return;
    }
    let matchingLetters = checkWords();

    // Update UI with correct letters
    let rowNum = 6 - numberOfGuessesLeft;
    for (let letterNum = 0; letterNum < 5; letterNum++) {
        const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);
        letterElement.style.color = "black";

        if(matchingLetters[letterNum] === 3) {
            letterElement.style.backgroundColor = "green";
        } else if (matchingLetters[letterNum] === 2) {
            letterElement.style.backgroundColor = "yellow";
        } else {
            letterElement.style.backgroundColor = "gray";
        }
    }

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

function checkGameState(matchingLetters) {
    // Check for win
    let win = true;
    for (let i = 0; i < 5; i++) {
        if(matchingLetters[i] != 3) {
            win = false;
        }
    }
    if(win) {
        alert("YOU WON");
        resetGame();
        return;
    }

    numberOfGuessesLeft--;
    currentGuess = [];

    // Check for loss
    if(numberOfGuessesLeft === 0){
        alert("YOU LOST");
        resetGame();
        return;
    }
}

function resetGame() {
    currentWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)].toUpperCase();
    numberOfGuessesLeft = 6;
    currentGuess = [];
    createLayout();
}

window.addEventListener("keydown", handleKeyPress);

createLayout();