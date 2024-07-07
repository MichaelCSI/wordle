<?php
session_start();


// Set the current guess and other global values in PHP session
if (!isset($_SESSION["currentGuess"])) {
    $_SESSION["currentGuess"] = array();
    $_SESSION["numGuessesLeft"] = 6;
    $_SESSION["gameState"] = "Playing";
}

// Post actions: add/delete letter, submit word, and reset game
if (isset($_POST['action'])) {
    error_log("Posting to server");
    if($_POST['action'] === 'addLetter') {
        if (count($_SESSION["currentGuess"]) >= 5) {
            return;
        }
        array_push($_SESSION["currentGuess"], $_POST['letter']);
    } else if ($_POST['action'] === 'deleteLetter') {
        if (count($_SESSION["currentGuess"]) <= 5) {
            return;
        }
        array_pop($_SESSION["currentGuess"]);
    } else if($_POST['action'] === 'submitWord') {
        if (count($_SESSION['currentGuess']) != 5) {
            return;
        }
    
        $matchingLetters = checkWords();
    
        $rowNum = 6 - $_SESSION['numGuessesLeft'];
        $letterColorArray = array();
    
        for ($letterNum = 0; $letterNum < 5; $letterNum++) {
            // Used to update the UI color of the relevant letters
            $guessLetterId = "row".$rowNum."Letter".$letterNum;
            $keyboardKeyId = $_SESSION['currentGuess'][$letterNum];
    
            if ($matchingLetters[$letterNum] === "green") {
                array_push(
                    $letterColorArray, 
                    array(
                        "guessLetterId" => $guessLetterId,
                        "keyboardKeyId" => $keyboardKeyId,
                        "guessValue" => "correct"
                    )
                );       
            } else if ($matchingLetters[$letterNum] === "yellow") {
                array_push(
                    $letterColorArray, 
                    array(
                        "guessLetterId" => $guessLetterId,
                        "keyboardKeyId" => $keyboardKeyId,
                        "guessValue" => "partialCorrect"
                    )
                );
            } else {
                array_push(
                    $letterColorArray, 
                    array(
                        "guessLetterId" => $guessLetterId,
                        "keyboardKeyId" => $keyboardKeyId,
                        "guessValue" => "incorrect"
                    )
                );
            }
        }
    
        $_SESSION['numGuessesLeft']--;
        $_SESSION['currentGuess'] = [];
        $_SESSION["gameState"] = checkGameState($matchingLetters);

        echo json_encode($letterColorArray);
    } 
    // Reset the game (reset relevant variables)
    else if($_POST['action'] === 'resetGame') {
        $_SESSION['numGuessesLeft'] = 6;
    } else {
        error_log("Unrecognized POST action");
    }
}
// Get actions: Get game state variables
else if(isset($_GET['action'])) {
    error_log("Getting from server");
    if($_GET['action'] === 'getState') {
        $sessionData = array(
            "currentGuess" => $_SESSION["currentGuess"],
            "numGuessesLeft" => $_SESSION["numGuessesLeft"],
            "gameState" => $_SESSION["gameState"],
            "currentWord" => $_SESSION["currentWord"]
        );
        echo json_encode($sessionData);
    } else {
        error_log("Unrecognized GET action");
    }
}

// Helper function for word submission
function checkWords() {
    $currentWord = strtoupper($_SESSION['currentWord']);
    $currentGuess = $_SESSION['currentGuess'];

    // Keep track of letter counts in current word to avoid false positives
    $letterMap = array();
    for ($i = 0; $i < 5; $i++) {
        $letter = $currentWord[$i];
        if (!isset($letterMap[$letter])) {
            $letterMap[$letter] = 0;
        }
        $letterMap[$letter]++;
    }

    $matchingPositions = array_fill(0, 5, 0);
    // Check for matching letters in same position
    for ($i = 0; $i < 5; $i++) {
        if ($currentGuess[$i] === $currentWord[$i]) {
            $matchingPositions[$i] = 1;
            $letterMap[$currentGuess[$i]]--;
        }
    }

    $matchingLetters = array_fill(0, 5, 0);
    // Check for matching letters in different positions
    for ($i = 0; $i < 5; $i++) {
        if ($matchingPositions[$i]) {
            continue;
        } else {
            if (str_contains($currentWord, $currentGuess[$i]) && $letterMap[$currentGuess[$i]] >= 1) {
                $matchingLetters[$i] = 1;
                $letterMap[$currentGuess[$i]]--;
            }
        }
    }

    error_log("Guess-Word comparison");
    error_log(implode(' ', $matchingPositions));
    error_log(implode(' ', $matchingLetters));

    // Build final array for matching letters
    // Green (contains same letter/position), Yellow (contains same letter), Gray (does not contain letter)
    $result = array();
    for ($i = 0; $i < 5; $i++) {
        if ($matchingPositions[$i]) {
            $result[] = "green";
        } else if ($matchingLetters[$i]) {
            $result[] = "yellow";
        } else {
            $result[] = "gray";
        }
    }

    error_log("Guess: " . implode('', $currentGuess));
    error_log("Word:  " . $currentWord);
    error_log(implode(' ', $result));

    return $result;
}

// Determine which state the player is in after guess submission
function checkGameState($matchingLetters) {
    $win = true;
    for ($i = 0; $i < 5; $i++) {
        if($matchingLetters[$i] != "green") {
            $win = false;
            break;
        }
    }
    if($win) {
        return "Win";
    } else if($_SESSION["numGuessesLeft"] == 0) {
        return "Lose";
    } else {
        return "Playing";
    }
}
?>
