// General API method for calling our PHP backend
function callAPI(requestType, phpModel, extraParams, callback) {
    const xmlhttp = new XMLHttpRequest();
  
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (callback) {
                    callback(xmlhttp.responseText);
                }
            } else {
                console.log(`Request failed with status ${xmlhttp.status}`);
            }
        }
    };
    if(requestType === "GET") {
        xmlhttp.open(requestType, `./models/${phpModel}.php`+"?"+extraParams, true);
        xmlhttp.send();
    } else if (requestType === "POST") {
        xmlhttp.open(requestType, `./models/${phpModel}.php`, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(extraParams);
    }
}

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
        // Submit a guess for review
        callAPI("POST", "GameState", 'action=submitWord', (response) => {
            const responseArray = JSON.parse(response);
            responseArray.forEach(response => {
                const guessLetterId = response.guessLetterId;
                const keyboardKeyId = response.keyboardKeyId.toLowerCase();
                const guessValue = response.guessValue;
                console.log(guessLetterId + " - " + keyboardKeyId + " - " + guessValue);
    
                const guessLetter = document.getElementById(guessLetterId);
                const keyboardKey = document.getElementById(keyboardKeyId);
    
                // Update the letters on the UI based on correctness
                if(guessValue === "correct") {
                    guessLetter.style.backgroundColor = "green";
                    keyboardKey.style.backgroundColor = "green";
        
                } else if (guessValue === "partialCorrect") {
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
            });
        });

        // Wait a bit for UI to update, then check for win/loss/continue
        setTimeout(() => {
            checkGameState()
          }, 1000);
    }
}

// Helper function for adding letters to guess word
function addLetter(letter) {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        console.log(response);
        const responseObject = JSON.parse(response);
        const currentGuess = responseObject.currentGuess;
        if(currentGuess.length >= 5) {
            console.log("Word is already 5 letters long");
            return;
        }

        // Add a letter to the current guess, for our API this means action=addLetter
        callAPI("POST", "GameState", 'action=addLetter&letter=' + encodeURIComponent(letter));
        setLetterUI(letter)
    })
}

// Helper function for removing letters from guess word
function deleteLetter() {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        const responseObject = JSON.parse(response);
        const currentGuess = responseObject.currentGuess;
        if(currentGuess.length >= 5) {
            console.log("Word is already empty");
            return;
        }

        // Remove a letter from the current guess, for our API this means action=deleteLetter
        callAPI("POST", "GameState", 'action=deleteLetter');
        setLetterUI("");
    })
}

// Helper function for updating UI after letter addition/deletion to guess
function setLetterUI(letter) {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        const responseObject = JSON.parse(response);
        const currentGuess = responseObject.currentGuess;
        const numGuessesLeft = responseObject.numGuessesLeft;

        let rowNum = 6 - numGuessesLeft;
        let letterNum = currentGuess.length - 1;

        const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);
        letterElement.innerHTML = letter;
    })
}

// Update game state - win, loss, or just go to next turn
function checkGameState() {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        console.log(response);
        const responseObject = JSON.parse(response);
        let gameState = responseObject.gameState;
        let currentWord = responseObject.currentWord;
        let numGuessesLeft = responseObject.numGuessesLeft;

        if(gameState === "Win") {
            createPopup("YOU WON");
            setTimeout(() => resetGame(numGuessesLeft), 3000);
        } else if (gameState === "Lose") {
            createPopup("YOU LOST<br>Correct Word: "+currentWord);
            setTimeout(() => resetGame(numGuessesLeft), 3000);
        }
    });
}


function resetGame(numGuessesLeft) {
    // Get a username for the leaderboard
    let username = prompt("Enter a username for the leaderboard", "Username");
    if (!username) {
        username = "AnonymousUser";
    }
    callAPI("POST", "Score", `username=${username}&numguessesleft=${numGuessesLeft}`);
    callAPI("POST", "GameState", 'action=resetGame');

    const keyboardKeys = document.getElementsByClassName("keyboard-button");
    for(let i = 0; i < keyboardKeys.length; i++) {
        let currentKey = keyboardKeys[i];
        currentKey.style.backgroundColor = "ivory";
    }
    createLayout();
    callAPI("POST", "Word", "action=setWord");
    callAPI("GET", "Score", "action=getScoreboard", function(response) {
        console.log(response);
    });
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

    // Initialize our word to be guessed
    callAPI("POST", "Word", "action=setWord");
}

startGame();