<?php
session_start();

//TODO: Scoreboard logic needs work
if(isset($_POST['username']) && isset($_POST['numguessesleft'])) {
    if(!isset($_SESSION["scoreboard"])) {
        $_SESSION["scoreboard"] = array();
        for ($i = 0; $i < 10; $i++) {
            $_SESSION["scoreboard"][] = array("___" => "___");
        }
        $_SESSION["scoreboard"][0] = array($_SESSION["username"] => $_POST['numguessesleft']);
    } else {
        // Rank users by number of guesses remaining (more is better)
        $new_entry = array($_POST['username'] => $_POST['numguessesleft']);
        for ($i = 0; $i < 10; $i++) {
            if ($_SESSION["scoreboard"][$i][0] < $_POST['numguessesleft']) {
                // Insert the new entry and shift the rest down
                array_splice($_SESSION["scoreboard"], $i, 0, $new_entry);
                // Remove the last element to maintain the array size
                array_pop($_SESSION["scoreboard"]);
                break;
            }
        }
    }
} else if (isset($_GET['action'])) {
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
