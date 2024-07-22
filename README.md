# CSI 3140 Assignments: Wordle
Michael O'Sullivan and Demian Oportus

----

Wordle is a guessing game where players have six attempts to guess a five-letter word. At every guess, they receive feedback that lets them know how close they are to the correct word. The feedback involves a color for each letter in the guessed word that lets the player know if that letter is (Green) in the final word in the correct position, (Yellow) in the final word but in the incorrect position, or (Gray) not in the final word. We have used a word bank of 100 five-letter words.

## Example
- Word: Apple
- Guess: Range

Feedback: 
- The word contains the letter "A" but in a different position (Yellow)
- The word contains the letter "E" in the same position (Green)
- All other letters are not contained in the word (Gray)

## Instructions for running the game
> You will need [Node](https://nodejs.org/en) installed on your machine
- NOTE: If this project has been shared with you, you will have a ```.env``` file with database connection information. Place this file in the root directory of the project
- Open a terminal for the project i.e. ```.../wordle```
- In the terminal, navigate to the source directory and install dependencies, then start client/server: 
  - ```npm install```
  - ```npm start```
- Navigate to ```localhost:8080``` in your browser and the game will appear
  - Note: Running ```npm start``` will output in the terminal where the web app is hosted

## Tech stack used
- Frontend: Pure HTML / CSS / JS
- Backend: Express.js API and postgres database (CockroachDB)
- Hosting: Node.js to host server, http-server to host UI

## User documentation

Our application has two types of users: WordleUsers (play game) and Admins (manage scoreboard).

Wordle users can create an account, login, and play the Wordle game. If they win, their score will be entered into the scoreboard. All users can view the scoreboard on the scoreboard page (available from nav bar). Admins are responsible for managing the scoreboard, and can delete a given score.

## Page Screenshots
![home](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/home.png)
![userLogin](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/userLogin.png)
![scoreboard](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/scoreboard.png)
![adminLogin](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/adminLogin.png)
![adminMain](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/adminMain.png)

## Game Screenshots

![Wordle game screenshot 1 - Guess 0](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%201.png)
![Wordle game screenshot 2 - Guess 1](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%202.png)
![Wordle game screenshot 3 - Guess 2](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%203.png)
![Wordle game screenshot 4 - Win](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%204.png)
![Wordle game screenshot 5 - Loss](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%205.png)

