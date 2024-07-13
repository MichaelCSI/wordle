// General API method for calling our PHP backend
function callAPI(requestType, phpModel, extraParams, callback) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                // If a callback function is provided, execute it with the server's response text
                if (callback) {
                    callback(xmlhttp.responseText);
                }
            } else {
                // Log an error to the console if the request failed (status is not 200)
                console.log(`Request failed with status ${xmlhttp.status}`);
            }
        }
    };

    // Conditionally process either a GET or POST request, this way we send extra parameters
    // as query parameters for GET and as request body for POST
    if (requestType === "GET") {
        xmlhttp.open(requestType, `./models/${phpModel}.php`+"?"+extraParams, true);
        xmlhttp.send();
    } else if (requestType === "POST") {
        xmlhttp.open(requestType, `./models/${phpModel}.php`, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(extraParams);
    }
}


// Create wordle layout
function createLayout() {
    const gameLayout = document.getElementById("gameLayout");
    gameLayout.innerHTML = "";

    // Loop to create 6 rows; typically for games like Wordle, each row represents a guess attempt
    for (let rowNumber = 0; rowNumber < 6; rowNumber++) {
        let row = document.createElement("div");
        row.className = "word-row";
        row.id = "row" + rowNumber;
        gameLayout.appendChild(row);

        // Nested loop to create 5 letter tiles in each row; corresponds to the number of letters in a guess
        for (let columnNumber = 0; columnNumber < 5; columnNumber++) {
            let column = document.createElement("div");
            column.className = "row-letter";
            column.id = "row" + rowNumber + "Letter" + columnNumber;
            row.appendChild(column);
        }
    }
}


// Read keyboard input from user to response to various game actions
function handleKeyPress(event) {
    // Avoid holding key down
    if (event.repeat) return;

    // If target is a textbox (i.e. post-game username form), ignore it unless it is submission
    // This disables filling in the guess tiles while username input is active
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
        submitWord();
    }
}

// Helper function for submitting a word to the backend and checking gamestate
function submitWord() {
    // Submit a guess for review
    callAPI("POST", "GameState", 'action=submitWord', (response) => {
        // Guess word is not 5 letters long, return
        if(!response) {
            console.log("Guess word is not 5 letters long");
            return;
        }
        // Disable keydown event and UI key press while we process guess submission
        window.removeEventListener("keydown", handleKeyPress);
        const keyboardKeys = document.getElementsByClassName("keyboard-button");
        for(let i = 0; i < keyboardKeys.length; i++) {
            let currentKey = keyboardKeys[i];
            currentKey.disabled = true;
        }
        
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
                guessLetter.style.backgroundColor = "#FFBF00";
                // Only update keyboard key to yellow if not already green
                if(keyboardKey.style.backgroundColor != "green") {
                    keyboardKey.style.backgroundColor = "#FFBF00";
                }
            } else {
                guessLetter.style.backgroundColor = "gray";
                // Only update keyboard key to gray if not already green/yellow
                if(keyboardKey.style.backgroundColor != "green" && keyboardKey.style.backgroundColor != "#FFBF00") {
                    keyboardKey.style.backgroundColor = "gray";
                }
            }
        });
        checkGameState()
    });
}

// Helper function to add a letter to the current word guess
function addLetter(letter) {
    const postData = 'action=addLetter&letter=' + encodeURIComponent(letter);

    // Our addLetter endpoint will return a message if the action is not allowed
    // i.e. if there is no message (no response), proceed with the action
    callAPI("POST", "GameState", postData, function(response) {
        if (response) {
            const responseJson = JSON.parse(response);
            console.log(responseJson.message);
        } else {
            setLetterUI();
        }
    });
}


// Helper function to remove the last letter from the current word guess
function deleteLetter() {
    const postData = 'action=deleteLetter';

    // Our deleteLetter endpoint will return a message if the action is not allowed
    // i.e. if there is no message (no response), proceed with the action
    callAPI("POST", "GameState", postData, function(response) {
        if (response) {
            const responseJson = JSON.parse(response);
            console.log(responseJson.message);
        } else {
            // Add offset to avoid index issues since we just deleted a letter
            setLetterUI(1);
        }
    });
}


// Helper function to update UI after a letter has been added/removed from the current guess
function setLetterUI(offset = 0) {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        const responseObject = JSON.parse(response);
        const currentGuess = responseObject.currentGuess;
        const numGuessesLeft = responseObject.numGuessesLeft;

        console.log(response);

        // Update the current tile row
        let rowNum = 6 - numGuessesLeft
        for(let letterNum = 0; letterNum < currentGuess.length + offset; letterNum++) {
            // Retrieve letter element using its ID based on the calculated row and letter number
            const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);

            // Update the UI with the guess letter
            letterElement.innerHTML = currentGuess[letterNum] ? currentGuess[letterNum] : "";
        }
    });
}


// Function to check the current state of the game and for win/loss/playing
function checkGameState() {
    callAPI("GET", "GameState", 'action=getState', (response) => {
        console.log(response);

        const responseObject = JSON.parse(response);
        let gameState = responseObject.gameState;
        let currentWord = responseObject.currentWord;
        let numGuessesLeft = responseObject.numGuessesLeft;

        if (gameState === "Win") {
            // If the game state is 'Win', display a popup message indicating the player has won
            setTimeout(() => {endGamePopup("YOU WON", numGuessesLeft)}, 1000);
        } else if (gameState === "Lose") {
            // If the game state is 'Lose', display a popup message indicating the player has lost
            setTimeout(() => {endGamePopup("YOU LOST<br>Correct Word: " + currentWord)}, 1000);
        }
        // Continue game, re-enable keydown event and UI keys after guess processing
        reEnableInput();
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

        // Username text field
        const usernameInput = document.getElementById("popupUsername");
        usernameInput.style.display = "block";
        usernameInput.onblur = function (event) { 
            setTimeout(function() {
                usernameInput.focus()
            }, 10);
        };
        usernameInput.focus();

        // Username submission button
        const popupSubmit = document.getElementById("popupSubmit");
        popupSubmit.style.display = "inline";
        popupSubmit.onclick = () => {  
            let username = usernameInput.value  
            if (!username) {
                username = "Anonymous";
            } else if (username.length > 10) {
                username = username.substring(0, 7) + "...";
            }
            // Update scoreboard in PHP session
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
                resetKeys();
            }, 1000);
            reEnableInput();
        }
    } else {
        setTimeout(() => {
            popup.classList.toggle("fade-in");
            
            // Reset game values
            callAPI("POST", "GameState", 'action=resetGame');
            callAPI("POST", "Word", "action=setWord");
            
            resetKeys();
            reEnableInput();
        }, 2000);
    }
}

// Helper function for resetting UI keyboard and re-enabling input
function resetKeys() {
    const keyboardKeys = document.getElementsByClassName("keyboard-button");
    for(let i = 0; i < keyboardKeys.length; i++) {
        let currentKey = keyboardKeys[i];
        currentKey.style.backgroundColor = "ivory";
        currentKey.disabled = false;
    }
    createLayout();
}

// Helper function for re-enabling keydown event and UI keyboard
function reEnableInput() {
    setTimeout(() => {
        window.addEventListener("keydown", handleKeyPress);    
        const keyboardKeys = document.getElementsByClassName("keyboard-button");
        for(let i = 0; i < keyboardKeys.length; i++) {
            let currentKey = keyboardKeys[i];
            currentKey.disabled = false;
        }       
    }, 1000)
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
    let scoreBoardSize = scoreArray.length == 0 ? 0 : scoreArray.length - 1;
    console.log(scoreBoardSize)
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
                addLetter(currentKey.innerHTML);
            };
        }
    }

    // Initialize our word to be guessed
    callAPI("POST", "Word", "action=setWord");
}

startGame();
