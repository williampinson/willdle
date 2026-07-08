export const config = {
  wordLength: 5,
  maxAttempts: 6,
};

export const gameState = {
  currentAttempt: 0,
  currentPosition: 0,
  targetWord: await getRandomWord(),
};

async function getRandomWord() {
  let validWord = false;
  let data;
  const loadingText = document.getElementById("game-loading");
  loadingText.classList.remove("hidden");
  while (!validWord) {
    const response = await fetch(
      // `https://random-word-api.herokuapp.com/word?length=${config.wordLength}`, // slower
      // `https://random-words-api.kushcreates.com/api?length=${config.wordLength}&words=1`,
      `https://random-words-api.kushcreates.com/api?language=en&length=${config.wordLength}&type=lowercase&words=1`,
    );
    data = await response.json();
    // validWord = await isValidWord(data[0]);
    // console.log("attempted word: " + data[0] + ". Is a word?: " + validWord);
    validWord = await isValidWord(data[0].word);
    console.log(
      "attempted word: " + data[0].word + ". Is a word?: " + validWord,
    );
  }
  loadingText.classList.add("hidden");
  return data[0].word;
  // return data[0];
}

export async function checkGuess(guess) {
  const isValid = await isValidWord(guess.toLowerCase());
  if (!isValid) return;

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
