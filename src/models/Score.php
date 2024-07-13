<?php
session_start();

// Initialize scoreboard in session if necessary
if(!isset($_SESSION["scoreboard"])) {
    $_SESSION["scoreboard"] = array();
} 

// Post to / update scoreboard
if(isset($_POST['username']) && isset($_POST['numguessesleft'])) {
    $new_entry = array("username" => $_POST['username'], "numguessesleft" => $_POST['numguessesleft']);

    // Rank users by number of guesses remaining (more is better)
    $inserted = false;
    for ($i = 0; $i < count($_SESSION["scoreboard"]); $i++) {
        // Travel down the scoreboard until we (maybe) insert the user's score
        if ($_SESSION["scoreboard"][$i]['numguessesleft'] < $_POST['numguessesleft']) {
            array_splice($_SESSION["scoreboard"], $i, 0, array($new_entry));
            $inserted = true;
            break;
        }
    }

    // If the new entry has the lowest score and was not inserted, add it to the end
    if (!$inserted && count($_SESSION["scoreboard"]) < 10) {
        $_SESSION["scoreboard"][] = $new_entry;
    }
    // Trim the scoreboard to only keep the top 10 scores
    if (count($_SESSION["scoreboard"]) > 10) {
        $_SESSION["scoreboard"] = array_slice($_SESSION["scoreboard"], 0, 10);
    }
} 
// Retrieve scoreboard
else if (isset($_GET['action'])) {
    error_log("Getting from server");
    if($_GET['action'] === 'getScoreboard') {
        echo json_encode($_SESSION["scoreboard"]);
    } else {
        error_log("Unrecognized GET action");
    }
} else {
    error_log("Unrecognized POST action");
}
?>
