import { getConfig, getStats } from "./storage.js";

export const config = {
  wordLength: 5,
  maxAttempts: 6,
};

export const gameState = {
  currentAttempt: 0,
  currentPosition: 0,
  targetWord: "",
  previousValidGuess: "",
  previousInvalidGuess: "",
};

export const stats = {
  "Games Played": 0,
  "Games Won": 0,
  "Win Percent": 0,
  "Win Streak": 0,
  "Best Streak": 0,
  // "Letters Typed": 0,
  // "Avg Winning Guess": 0,
};

export function updateConfig() {
  const storedConfig = getConfig();
  if (storedConfig) {
    for (let setting in storedConfig) {
      config[setting] = storedConfig[setting];
    }
  }
}

export function initStats() {
  const storedStats = getStats();
  if (storedStats) {
    for (let stat in storedStats) {
      stats[stat] = storedStats[stat];
    }
  }
}

export async function resetGameState() {
  gameState.currentAttempt = 0;
  gameState.currentPosition = 0;
  gameState.previousInvalidGuess = "";
  gameState.previousValidGuess = "";
  gameState.targetWord = await getRandomWord();
}

export async function setTargetWord() {
  gameState.targetWord = await getRandomWord();
}

async function getRandomWord() {
  let validWord = false;
  let data;
  const loadingText = document.getElementById("game-loading");
  loadingText.classList.remove("hidden");
  while (!validWord) {
    const response = await fetch(
      // backup API
      // `https://random-word-api.herokuapp.com/word?length=${config.wordLength}`, // slower
      // `https://random-words-api.kushcreates.com/api?length=${config.wordLength}&words=1`,
      `https://random-words-api.kushcreates.com/api?language=en&length=${config.wordLength}&type=lowercase&words=1`,
    );
    data = await response.json();
    // backup API
    // validWord = await isValidWord(data[0]);
    // console.log("attempted word: " + data[0] + ". Is a word?: " + validWord);
    if (data[0].word.includes(" ")) {
      validWord = false;
    } else {
      validWord = await isValidWord(data[0].word);
    }
    console.log(
      "attempted word: " + data[0].word + ". Is a word?: " + validWord,
    );
  }
  loadingText.classList.add("hidden");
  return data[0].word;
  // backup API
  // return data[0];
}

export async function checkGuess(guess) {
  if (guess === gameState.previousInvalidGuess) return;

  if (guess !== gameState.previousValidGuess) {
    const isValid = await isValidWord(guess.toLowerCase());
    if (!isValid) {
      gameState.previousInvalidGuess = guess;
      return;
    }
    gameState.previousValidGuess = guess;
  }

  const targetLetters = gameState.targetWord.toLowerCase().split("");
  const guessLetters = guess.toLowerCase().split("");

  const used = Array(config.wordLength).fill(false);
  const results = Array(config.wordLength).fill("incorrect");

  for (let i = 0; i < config.wordLength; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      results[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < config.wordLength; i++) {
    if (results[i] === "correct") continue;

    for (let j = 0; j < config.wordLength; j++) {
      if (!used[j] && guessLetters[i] === targetLetters[j]) {
        results[i] = "misplaced";
        used[j] = true;
        break;
      }
    }
  }

  return results;
}

async function isValidWord(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );
    return response.ok;
  } catch {
    return false;
  }
}
