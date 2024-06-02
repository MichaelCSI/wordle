const fiveLetterWords = [
    "apple", "grape", "lemon", "melon", "peach",
    "berry", "mango", "olive", "apric", "plumb",
    "kiwis", "papay", "guava", "cocon", "pear.",
    "banan", "cherr", "lime.", "figgy", "quinc",
    "radar", "frame", "crisp", "crane", "stork",
    "globe", "creek", "ocean", "tiger", "panda",
    "llama", "horse", "sheep", "zebra", "whale",
    "shark", "eagle", "flock", "koala", "rhino",
    "snail", "gecko", "beach", "trail", "mount",
    "field", "plaza", "vivid", "storm", "cloud",
    "breez", "rocky", "plain", "bluff", "crust",
    "water", "shade", "deser", "blizz", "frost",
    "flame", "comet", "stars", "night", "moony",
    "venus", "earth", "jupit", "mars.", "mercu",
    "neptu", "pluto", "satun", "light", "early",
    "brick", "walls", "floor", "roof.", "panel",
    "booth", "globe", "mover", "table", "chairs",
    "couch", "piano", "shelf", "clock", "books",
    "cupbo", "bench", "glass", "blinds", "frame"
];
  

let numberOfGuessesLeft = 6;

function createLayout() {
    const gameLayout = document.querySelector("#gameLayout");
    
    // Create 6 rows
    for (let rowNumber = 0; rowNumber < 6; rowNumber++) {
        let row = document.createElement("div");
        row.className = "word-row";
        row.id = "row" + rowNumber;
        gameLayout.appendChild(row);

        // Create 5 letters for each row
        for (let columnNumber = 0; columnNumber < 5; columnNumber++) {
            let column = document.createElement("div");
            column.className = "row-letter";
            column.id = "row" + rowNumber + "Letter" + columnNumber;
            row.appendChild(column);
        }
    }
}

createLayout();