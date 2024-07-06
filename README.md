# CSI 3140 Assignment 2: Wordle in HTML/CSS/JS
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
- Open a terminal for the project i.e. ```.../wordle```
- In the terminal, navigate to the source directory and start the php server: 
  - ```cd src && php -S localhost:4000```
- Navigate to ```localhost:4000``` in your browser and the game will appear

## Screenshots

![Wordle game screenshot 1 - Guess 0](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%201.png)
![Wordle game screenshot 2 - Guess 1](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%202.png)
![Wordle game screenshot 3 - Guess 2](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%203.png)
![Wordle game screenshot 4 - Win](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%204.png)
![Wordle game screenshot 5 - Loss](https://github.com/MichaelCSI/wordle/blob/master/docs/design_system/wordle%205.png)

