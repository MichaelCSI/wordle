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
        let msg = response.status === 404 ? "Score ID not found" : "Unknown server error";
        throw new Error(msg);    }

    const result = await response.json();
    return result;
}

// Set name in top right to teacher username
const adminUsernameElement = document.getElementById("adminUsername");
let adminName = sessionStorage.getItem("adminName");
let adminUsername = sessionStorage.getItem("adminUsername");
adminUsernameElement.innerText = adminName + ", " + adminUsername;

// Fetch scoreboard list
callEndpoint(
    `http://localhost:3000/api/scoreboard`, 
    "GET"
).then(result => {
    console.log('Response:', result);

    const scoreWrapper = document.getElementById("scoreBoardWrapper");
    if(result.scores.length < 1) {
        scoreWrapper.innerText = "No Current Score Entries";
    }

    // Create scoreboard headers
    const scoreHeaders = document.createElement("div");
    scoreHeaders.className = "scoreBox";
    scoreHeaders.innerHTML = "<div>Score ID</div>"
    scoreHeaders.innerHTML += "<div>Username</div>"
    scoreHeaders.innerHTML += "<div>Score</div>"


    // Add all scores to admin page
    for (let scoreIndex = 0; scoreIndex < result.scores.length; scoreIndex++) {
        const scoreElement = document.createElement("div");
        scoreElement.id = "scoreElement" + scoreIndex;
        scoreElement.className = "scoreBox";

        let currentScore = result.scores[scoreIndex];

        scoreElement.innerHTML = `<div>${currentScore.score_id}</div>`
        scoreElement.innerHTML += `<div>${currentScore.user_username}</div>`
        scoreElement.innerHTML += `<div>${currentScore.score}</div>`
        
        scoreWrapper.appendChild(scoreElement);
    }
    // Form for deleting score       
    const errorMsg = document.createElement('h4');
    errorMsg.id = "errorMsg";
    scoreWrapper.appendChild(errorMsg);

    const formDelete = document.createElement('form');

    const idLabel = document.createElement('label');
    idLabel.textContent = 'Score ID:';
    formDelete.appendChild(idLabel);

    const idInput = document.createElement('input');
    idInput.type = 'number';
    idInput.placeholder = 'Example: 010101010101010101';
    idInput.required = true;
    formDelete.appendChild(idInput);

    const removeScoreButton = document.createElement('button');
    removeScoreButton.type = 'submit';
    removeScoreButton.className = 'completeButton';
    removeScoreButton.textContent = 'Delete Score';
    formDelete.appendChild(removeScoreButton);
    
    formDelete.addEventListener("submit", function (event) {
        event.preventDefault();
        const deleteParams = new URLSearchParams({
            scoreID: currentScore.score_id
        }).toString();
    
        callEndpoint(
            `http://localhost:3000/api/scoreboard?${deleteParams}`,
            "DELETE"
        )
        .then(result => {
            console.log('Response:', result);
            window.location.reload();
        }).catch(error => {
            console.error(error);
        });
    });
}).catch(error => {
    console.error(error);
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = error;
});