// General API method for calling our PHP backend
function callAPI(requestType, phpModel, extraParams, callback) {
    // Create a new XMLHttpRequest object to handle the API request
    const xmlhttp = new XMLHttpRequest();

    // Define what should happen when the server response is ready to be processed
    xmlhttp.onreadystatechange = function() {
        // Check if the request is complete (readyState == 4 corresponds to XMLHttpRequest.DONE)
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            // Check if the HTTP status code is 200 (OK), indicating successful request handling
            if (xmlhttp.status == 200) {
                // If a callback function is provided, execute it with the server's response text
                if (callback) {
                    callback(xmlhttp.responseText);
                }
            } else {
                // Log an error to the console if the request failed
                console.log(`Request failed with status ${xmlhttp.status}`);
            }
        }
    };

    // Conditionally process either a GET or POST request
    if (requestType === "GET") {
        // Open a GET request with the target URL constructed from the provided parameters
        xmlhttp.open(requestType, `./models/${phpModel}.php`+"?"+extraParams, true);
        // Send the GET request
        xmlhttp.send();
    } else if (requestType === "POST") {
        // Open a POST request with the target URL
        xmlhttp.open(requestType, `./models/${phpModel}.php`, true);
        // Set the necessary HTTP header for POST request
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        // Send the POST request with the extra parameters as the request body
        xmlhttp.send(extraParams);
    }
}


// Function to dynamically create HTML elements for the game tiles in a word-guessing game layout
function createLayout() {
    // Retrieve the DOM element where the game layout will be appended
    const gameLayout = document.getElementById("gameLayout");

    // Clear any existing content in the gameLayout element to start fresh
    gameLayout.innerHTML = "";

    // Loop to create 6 rows; typically for games like Wordle, each row represents a guess attempt
    for (let rowNumber = 0; rowNumber < 6; rowNumber++) {
        // Create a new 'div' element to represent a single row of letter tiles
        let row = document.createElement("div");

        // Assign a class name for styling the row (e.g., setting display properties, margins)
        row.className = "word-row";

        // Give each row a unique ID using the current row number for specific access and manipulation
        row.id = "row" + rowNumber;

        // Append the newly created row div to the game layout container
        gameLayout.appendChild(row);

        // Nested loop to create 5 letter tiles in each row; corresponds to the number of letters in a guess
        for (let columnNumber = 0; columnNumber < 5; columnNumber++) {
            // Create a new 'div' element for each letter tile within the row
            let column = document.createElement("div");

            // Set a class name for the letter tiles for consistent styling (e.g., size, border)
            column.className = "row-letter";

            // Assign a unique ID to each letter tile using its row and column indices for specific targeting
            column.id = "row" + rowNumber + "Letter" + columnNumber;

            // Append the letter tile to the corresponding row in the game layout
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

// Helper function to add a letter to the current word guess in a word game
function addLetter(letter) {
    // Encode the letter for URL safety and concatenate with the action parameter
    // This string forms the body of the POST request, which tells the server to add a letter to the current guess
    const postData = 'action=addLetter&letter=' + encodeURIComponent(letter);

    // Call a backend API using the POST method to update the game state with the new letter
    // "GameState" is the server-side model handling game logic
    callAPI("POST", "GameState", postData, function(response) {
        // Callback function executed after receiving a response from the server
        if (response) {
            // If response is not empty, parse it as JSON to access the data
            const responseJson = JSON.parse(response);

            // Log the message part of the response, typically containing confirmation or error information
            console.log(responseJson.message);
        } else {
            // If there is no response, update the UI to reflect an unsuccessful letter addition
            // The '0' here could signify the position where the letter failed to be added or an error code
            setLetterUI(letter, 0);
        }
    });
}


// Helper function to remove the last letter from the current word guess in a word game
function deleteLetter() {
    // Define the API action to delete a letter, which will be sent as part of the request body
    const postData = 'action=deleteLetter';

    // Call the backend API using the POST method to modify the game state by removing the last letter
    // "GameState" refers to the server-side PHP script or controller that handles game state changes
    callAPI("POST", "GameState", postData, function(response) {
        // Callback function that handles the server response after attempting to delete a letter
        if (response) {
            // If there is a response from the server, parse it as JSON to process it
            const responseJson = JSON.parse(response);

            // Output the response message to the console, which might indicate success or provide error information
            console.log(responseJson.message);
        } else {
            // If there is no response from the server (indicative of an error or network issue), update the UI accordingly
            // The second parameter '1' likely represents an offset to adjust the UI after deleting a letter
            // This could be used to correctly position the cursor or manage display issues related to the deletion
            setLetterUI("", 1);
        }
    });
}


// Helper function for updating the user interface after a letter has been added or removed from the current guess
function setLetterUI(letter, offset) {
    // Call the backend API using a GET method to retrieve the current state of the game
    // "GameState" is the server-side PHP script handling game state, and 'action=getState' specifies what the API should return
    callAPI("GET", "GameState", 'action=getState', (response) => {
        // The response from the server is expected to be a JSON string, so parse it into a JavaScript object
        const responseObject = JSON.parse(response);

        // Extract the current guess word and the number of guesses left from the response object
        const currentGuess = responseObject.currentGuess;
        const numGuessesLeft = responseObject.numGuessesLeft;

        // Log the entire response for debugging purposes
        console.log(response);

        // Calculate which row should be updated based on the number of guesses left
        // Since there are 6 rows, subtract the number of guesses left from 6 to get the current active row
        let rowNum = 6 - numGuessesLeft;

        // Calculate the position within the row for the letter to be set, adjusted by the offset parameter
        // The offset helps adjust the exact position for adding or removing letters
        let letterNum = currentGuess.length - 1 + offset;

        // Construct the ID for the specific HTML element (letter tile) based on calculated row and letter number
        // and retrieve the element from the DOM
        const letterElement = document.getElementById("row"+rowNum+"Letter"+letterNum);

        // Set the innerHTML of the selected letter tile to the passed letter, updating the UI to reflect the current game state
        letterElement.innerHTML = letter;
    });
}


// Function to check the current state of the game and determine whether the player has won, lost, or should continue
function checkGameState() {
    // Make a GET request to the server to fetch the current game state using the 'getState' action
    callAPI("GET", "GameState", 'action=getState', (response) => {
        // Log the server response to the console for debugging purposes
        console.log(response);

        // Parse the JSON response from the server to access the game state data
        const responseObject = JSON.parse(response);
        let gameState = responseObject.gameState;  // Retrieve the game state ('Win', 'Lose', or other states)
        let currentWord = responseObject.currentWord;  // Retrieve the correct word if the game is over
        let numGuessesLeft = responseObject.numGuessesLeft;  // Retrieve the number of guesses left for the player

        // Check the game state to determine the outcome of the game
        if (gameState === "Win") {
            // If the game state is 'Win', display a popup message indicating the player has won
            // Also display how many guesses were left as part of the win message
            endGamePopup("YOU WON", numGuessesLeft);
        } else if (gameState === "Lose") {
            // If the game state is 'Lose', display a popup message indicating the player has lost
            // Also show the correct word the player was supposed to guess
            endGamePopup("YOU LOST<br>Correct Word: " + currentWord);
        }
        // If neither 'Win' nor 'Lose', the game continues to the next turn (no explicit action coded here)
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
