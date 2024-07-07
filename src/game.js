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

// Read keyboard input from user
function handleKeyPress(event) {
    // If target is a textbox (username form), ignore it unless it is submission
    if (event.target.tagName === 'INPUT') {
        if(event.key === "Enter") {
            const popupSubmit = document.getElementById("popupSubmit");
            popupSubmit.click();
        }
        return;
    }

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
    // Add a letter to the current guess, for our API this means action=addLetter
    callAPI("POST", "GameState", 'action=addLetter&letter=' + encodeURIComponent(letter), function(response) {
        if(response) {
            const responseJson = JSON.parse(response);
            console.log(responseJson.message);
        } else {
            setLetterUI(letter, 0);
        }
    });
}

// Helper function for removing letters from guess word
function deleteLetter() {
    callAPI("POST", "GameState", 'action=deleteLetter', function(response) {
        if(response) {
            const responseJson = JSON.parse(response);
            console.log(responseJson.message);
        } else {
            // Add offset to avoid index issues after deletion
            setLetterUI("", 1);
        }
    });
}

// Helper function for updating UI after letter addition/deletion to guess
function setLetterUI(letter, offset) {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        const responseObject = JSON.parse(response);
        const currentGuess = responseObject.currentGuess;
        const numGuessesLeft = responseObject.numGuessesLeft;
        console.log(response);

        let rowNum = 6 - numGuessesLeft;
        let letterNum = currentGuess.length - 1 + offset;

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
            endGamePopup("YOU WON", numGuessesLeft);
        } else if (gameState === "Lose") {
            endGamePopup("YOU LOST<br>Correct Word: "+currentWord);
        }
    });
}

// Create an html element for a win/loss popup
function endGamePopup(message, numGuessesLeft) {
    const popup = document.getElementById("popup");
    popup.classList.toggle("fade-in");

    const popupMsg = document.getElementById("popupMessage");
    popupMsg.innerHTML = message;
    
    if(message === "YOU WON") {
        const popupScore = document.getElementById("popupScore");
        popupScore.style.display = "block";
        popupScore.innerHTML = "Score: "+numGuessesLeft;

        // Reveal the scoreboard
        const scoreboard = document.getElementById("scoreboard");
        scoreboard.classList.toggle("fade-in");
        callAPI("GET", "Score", "action=getScoreboard", function(response) {
            const responseArray = JSON.parse(response);
            updateScoreBoard(responseArray);
        });

        const usernameInput = document.getElementById("popupUsername");
        usernameInput.style.display = "block";
        // Focus on input and maintain focus until submission
        usernameInput.onblur = function (event) { 
            setTimeout(function() {
                usernameInput.focus()
            }, 10);
        };
        usernameInput.focus();

        const popupSubmit = document.getElementById("popupSubmit");
        popupSubmit.style.display = "inline";
        popupSubmit.onclick = () => {  
            let username = usernameInput.value  
            if (!username) {
                username = "Anonymous";
            } else if (username.length > 10) {
                username = username.substring(0, 7) + "...";
            }
            callAPI("POST", "Score", `username=${username}&numguessesleft=${numGuessesLeft}`);
            popup.classList.toggle("fade-in");
            scoreboard.classList.toggle("fade-in");
            usernameInput.onblur = null;

            // Reset game values
            callAPI("POST", "GameState", 'action=resetGame');
            callAPI("POST", "Word", "action=setWord");

            // Reset UI
            setTimeout(function() {
                usernameInput.value = "";
                usernameInput.style.display = "none";
                popupSubmit.style.display = "none";
                popupScore.style.display = "none";

                const keyboardKeys = document.getElementsByClassName("keyboard-button");
                for(let i = 0; i < keyboardKeys.length; i++) {
                    let currentKey = keyboardKeys[i];
                    currentKey.style.backgroundColor = "ivory";
                }
                createLayout();
            }, 1000);
        }
    }
}

// Create html elements for scoreboard
function updateScoreBoard(scoreArray) {
    const scoreTable = document.getElementById("scoreTable");

    // Clear previous score entries
    scoreTable.innerHTML = "";

    // Set headers
    const headerRow = scoreTable.insertRow(-1);
    const leftHeader = headerRow.insertCell(0);
    leftHeader.classList.toggle("left-cell");
    leftHeader.classList.toggle("header");
    leftHeader.textContent = "Username";
    const rightHeader = headerRow.insertCell(1);
    rightHeader.classList.toggle("header");
    rightHeader.textContent = "Score";

    // Create new score entries
    if(scoreArray) {
        scoreArray.forEach(item => {
            const row = scoreTable.insertRow(-1);
            const leftCell = row.insertCell(0);
            leftCell.classList.toggle("left-cell");
            leftCell.textContent = item.username;
            row.insertCell(1).textContent = item.numguessesleft;
        });
    }

    // Fill in any remaining spots on the scoreboard with empty values
    let scoreBoardSize = scoreArray ? scoreArray.length - 1 : 0;
    for(let i = scoreBoardSize; i < 10; i++) {
        const row = scoreTable.insertRow(-1);
        const leftCell = row.insertCell(0);
        leftCell.classList.toggle("left-cell");
        leftCell.textContent = "- - -";
        row.insertCell(1).textContent = "- - -";
    }
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