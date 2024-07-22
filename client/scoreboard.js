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
}).catch(error => {
    console.error(error);
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = error;
});