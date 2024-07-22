// Generic function for calling our API get/post methods
async function callEndpoint(endpoint, method, data = null) {
    const options = {
        method: method,
        headers: { "Content-Type": "application/json" }
    };

    // Only include body for post method
    if (method === "POST" && data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    if (!response.ok) {
        throw new Error(response.status);    
    }

    const result = await response.json();
    return result;
}

// Function to build scoreboard
function updateScoreBoard(scoreArray) {
    const scoreTable = document.getElementById("scoreTable");

    // Clear previous score entries
    scoreTable.innerHTML = "";

    // Set headers
    const headerRow = scoreTable.insertRow(-1);

    const idHeader = headerRow.insertCell(0);
    idHeader.classList.toggle("left-cell");
    idHeader.classList.toggle("header");
    idHeader.textContent = "Score ID";

    const usernameHeader = headerRow.insertCell(1);
    usernameHeader.classList.toggle("header");
    usernameHeader.textContent = "Username";

    const scoreHeader = headerRow.insertCell(2);
    scoreHeader.classList.toggle("header");
    scoreHeader.textContent = "Score";

    // Create new score entries
    if(scoreArray) {
        scoreArray.forEach(score => {
            const row = scoreTable.insertRow(-1);

            const idEntry = row.insertCell(0);
            idEntry.classList.toggle("left-cell");
            idEntry.textContent = score.score_id;

            const usernameEntry = row.insertCell(1);
            usernameEntry.classList.toggle("left-cell");
            usernameEntry.textContent = score.user_username;
            
            row.insertCell(2).textContent = score.score;
        });
    }

    // Fill in any remaining spots on the scoreboard with empty values
    let scoreBoardSize = scoreArray.length == 0 ? 0 : scoreArray.length - 1;
    for(let i = scoreBoardSize; i < 10; i++) {
        const row = scoreTable.insertRow(-1);

        const idEntry = row.insertCell(0);
        idEntry.classList.toggle("left-cell");
        idEntry.textContent = "- - -";

        const usernameEntry = row.insertCell(1);
        usernameEntry.classList.toggle("left-cell");
        usernameEntry.textContent = "- - -";

        row.insertCell(2).textContent = "- - -";
    }
}


// Fetch scoreboard list
callEndpoint(
    `http://localhost:3000/api/scoreboard`, 
    "GET"
).then(result => {
    console.log('Response:', result);
    updateScoreBoard(result.scores);
}).catch(error => {
    console.error(error);
});