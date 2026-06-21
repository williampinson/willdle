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
  const response = await fetch(
    `https://random-word-api.herokuapp.com/word?length=${config.wordLength}`,
    // `https://random-words-api.kushcreates.com/api?length=${config.wordLength}&words=1`,
  );
  const data = await response.json();
  return data[0].word;
}

export async function checkGuess(guess) {
  const isValid = await isValidWord(guess.toLowerCase());
  if (!isValid) return;
  const targetLetters = gameState.targetWord.toLowerCase().split("");
  const guessLetters = guess.toLowerCase().split("");

  return guessLetters.map((letter, index) => {
    if (letter === targetLetters[index]) {
      return "correct";
    } else if (targetLetters.includes(letter)) {
      return "misplaced";
    } else {
      return "incorrect";
    }
  });
}

async function isValidWord(word) {
  // const response = await fetch(
  //   `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
  // );
  // return response.ok;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );
    return response.ok;
  } catch {
    return false;
  }
}
