require("dotenv").config({path:__dirname+"/./../.env"});
const express = require("express");
const { Client } = require("pg");
const cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Use CORS - allows requests from localhost:8080 (web) to localhost:3000 (server)
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: 'defaultdb',
    port: process.env.PORT,
    ssl: {
      rejectUnauthorized: false
    }
  });
client.connect();

// Basic test endpoint
app.get('/api', async (req, res) => {
    const text = `
        SELECT * FROM Person;
    `;
    const result = await client.query(text);

    res.status(201).json({reply: "Hello World"});
})



// Endpoint to post a user (+ new person) to DB
app.post("/api/createuser", async (req, res) => {
    const { username, password, name } = req.body;

    const checkUsernameText = `
        SELECT 1 FROM WordleUser WHERE user_username = $1
    `;

    const insertText = `
        WITH new_person AS (
            INSERT INTO Person (person_name) 
            VALUES ($3) 
            RETURNING person_id
        )
        INSERT INTO WordleUser (user_username, user_password, person_id)
            VALUES ($1, $2, (SELECT person_id FROM new_person));
    `;

    try {
        // Check if the user's username already exists
        const usernameCheckResult = await client.query(checkUsernameText, [username]);
        if (usernameCheckResult.rowCount > 0) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }

        // Insert new person and user
        const values = [username, password, name];
        const insertResult = await client.query(insertText, values);

        res.status(200).json({ 
            msg: "Inserted user",
            username: username,
            password: password
        });
    } catch (err) {
        console.error("Error executing user create query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get a user from DB using login details
app.get("/api/user", async (req, res) => {
    const { username, password } = req.query;
    const text = `
        SELECT u.user_username, u.user_password, p.person_name
        FROM WordleUser u
        JOIN Person p ON u.person_id = p.person_id
        WHERE u.user_username = $1;    
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);

        // Username not found
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Username not found" });
            return;
        }

        // Username found but password incorrect
        const user = result.rows[0];
        if (user.user_password !== password) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }

        // Password is correct, return user details
        res.status(200).json({ 
            username: user.user_username,
            personName: user.person_name
        });
    } catch (err) {
        console.error("Error executing user login query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get an admin from DB using login details
app.get("/api/admin", async (req, res) => {
    const { username, password } = req.query;
    const text = `
        SELECT a.admin_username, a.admin_password, p.person_name
        FROM Administrator a
        JOIN Person p ON a.person_id = p.person_id
        WHERE a.admin_username = $1;    
    `;
    const values = [username];

    try {
        const result = await client.query(text, values);

        // Username not found
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Username not found" });
            return;
        }

        // Username found but password incorrect
        const admin = result.rows[0];
        if (admin.admin_password !== password) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }

        // Password is correct, return admin details
        res.status(200).json({ 
            username: admin.admin_username,
            personName: admin.person_name
        });
    } catch (err) {
        console.error("Error executing admin login query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to get scoreboard entries
app.get('/api/scoreboard', async (req, res) => {
    const text = `
        SELECT * FROM Scoreboard
        ORDER BY score DESC;
    `;
    const result = await client.query(text);

    res.status(201).json({scores: result.rows});
})

// Endpoint to delete a scoreboard entry
app.delete("/api/scoreboard", async (req, res) => {
    const { scoreID } = req.query;

    const findScoreText = `
        SELECT *
        FROM Scoreboard
        WHERE score_id = $1;
    `

    const deleteScoreText = `
        DELETE FROM Scoreboard
        WHERE score_id = $1;
    `;

    try {
        // Check that Score exists
        const result = await client.query(findScoreText, [scoreID]);

        // Score not found
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Score ID not found" });
            return;
        }

        const resultDelete = await client.query(deleteScoreText, [scoreID]);

        res.status(200).json({ 
            msg: "Deleted Score",
            scoreID: scoreID
        });
    } catch (err) {
        console.error("Error executing score delete query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Endpoint to enter a scoreboard entry
app.post("/api/scoreboard", async (req, res) => {
    const { username, score } = req.body;

    const countSizeText = `SELECT COUNT(*) FROM Scoreboard`

    const insertText = `
        INSERT INTO Scoreboard (user_username, score) 
        VALUES ($1, $2)
    `

    try {
        const countResult = await client.query(countSizeText);
        const count = parseInt(countResult.rows[0].count, 10);
  
        if (count <= 9) {
            await client.query(insertText, [username, score]);
            res.status(200).json({ 
                msg: "Inserted Score",
                username: username,
                score: score
            });
        } else {
          res.status(200).json({ message: 'Scoreboard is full. Cannot add more scores.' });
        }
    } catch (err) {
        console.error("Error executing score insert query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
