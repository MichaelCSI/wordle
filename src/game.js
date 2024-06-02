const fiveLetterWords = [
    "apple", "grape", "lemon", "melon", "peach",
    "berry", "mango", "olive", "apric", "plumb",
    "kiwis", "papay", "guava", "cocon", "pear.",
    "banan", "cherr", "lime.", "figgy", "quinc",
    "radar", "frame", "crisp", "crane", "stork",
    "globe", "creek", "ocean", "tiger", "panda",
    "llama", "horse", "sheep", "zebra", "whale",
    "shark", "eagle", "flock", "koala", "rhino",
    "snail", "gecko", "beach", "trail", "mount",
    "field", "plaza", "vivid", "storm", "cloud",
    "breez", "rocky", "plain", "bluff", "crust",
    "water", "shade", "deser", "blizz", "frost",
    "flame", "comet", "stars", "night", "moony",
    "venus", "earth", "jupit", "mars.", "mercu",
    "neptu", "pluto", "satun", "light", "early",
    "brick", "walls", "floor", "roof.", "panel",
    "booth", "globe", "mover", "table", "chairs",
    "couch", "piano", "shelf", "clock", "books",
    "cupbo", "bench", "glass", "blinds", "frame"
];
  
let currentWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
let currentGuess = []
let numberOfGuessesLeft = 6;

function createLayout() {
    const gameLayout = document.querySelector("#gameLayout");
    
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

// Helper function for adding/removing letters from the UI
function setLetter(letter) {
    let rowNum = 6 - numberOfGuessesLeft;
    let letterNum = currentGuess.length - 1;
    const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);
    letterElement.innerHTML = letter;
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
    numberOfGuessesLeft--;
    currentGuess = [];
    // TODO
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

window.addEventListener("keydown", handleKeyPress);

createLayout();