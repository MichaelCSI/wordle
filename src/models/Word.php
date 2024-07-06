<?php
$fiveLetterWords = [
    "apple", "bread", "candy", "drink", "eagle",
    "fruit", "grape", "honey", "image", "joker",
    "knife", "lemon", "mango", "night", "ocean",
    "piano", "queen", "robot", "snake", "tiger",
    "unite", "vivid", "whale", "viola", "young",
    "zebra", "amber", "blaze", "charm", "dwarf",
    "eager", "flame", "globe", "haste", "irony",
    "jewel", "kneel", "loyal", "mirth", "novel",
    "oasis", "plush", "quake", "realm", "spine",
    "trend", "usher", "vigor", "waltz", "peach",
    "yeast", "azure", "boast", "crisp", "daisy",
    "elite", "fancy", "glory", "haste", "ivory",
    "jolly", "knead", "leapt", "moist", "noble",
    "otter", "pearl", "quill", "raven", "sight",
    "twist", "ultra", "voice", "wrath", "xerox",
    "youth", "zonal", "afire", "bloom", "chase",
    "dwell", "enact", "flesh", "grasp", "hound",
    "intro", "jumpy", "kudos", "lodge", "merit"
];

// Select a random word
$randomWord = $fiveLetterWords[array_rand($fiveLetterWords)];

// Return the word as a JSON response
echo json_encode(['word' => $randomWord]);
?>
