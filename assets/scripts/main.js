import { config, gameState, checkGuess, resetGameState } from "./game.js";

console.log(gameState.targetWord);

const btnResetGame = document.getElementById("button-reset");
btnResetGame.addEventListener("click", () => {
  resetGame();
});

const grid = document.getElementById("game-grid");
const resultsParagraph = document.getElementById("results-message");
const winMessages = [
  "yay! you win!",
  "you win!",
  "you win 👍",
  "winner 👍",
  "👍",
  "you win",
  "woohoo you win",
  "you win! However, in real life, there are no winners.",
  "winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner ",
];

function getWinMessage() {
  return winMessages[Math.floor(Math.random() * winMessages.length)];
}

function addTileToGrid(row, col) {
  const tile = document.createElement("div");
  tile.className = "letter";
  tile.id = `cell-r${row},c${col}`;
  tile.setAttribute("data-row", row);
  grid.appendChild(tile);
}

function setUpGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${config.wordLength}, 60px)`;
  for (let row = 0; row < config.maxAttempts; row++) {
    for (let col = 0; col < config.wordLength; col++) {
      addTileToGrid(row, col);
    }
  }
}

const keyboard = document.getElementById("keyboard");
const keyboardKeys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

function setUpKeyboard() {
  keyboard.innerHTML = "";
  for (let row = 0; row < 3; row++) {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";
    keyboardRow.id = `keyboard-row-${row}`;
    keyboard.appendChild(keyboardRow);
    for (let key of keyboardKeys[row]) {
      const tile = document.createElement("button");
      tile.classList.add("key", `keyboardRow-${row}`);
      tile.id = `key-${key}`;
      if (key === "backspace") {
        tile.textContent = "⌫";
      } else {
        tile.textContent = key.toUpperCase();
      }
      tile.addEventListener("click", () => {
        if (key === "backspace") {
          removeLetter();
        } else if (key === "enter") {
          submitGuess();
        } else {
          addLetter(key);
        }
      });
      if (key === "enter" || key === "backspace") {
        tile.classList.add("big-key");
      }
      keyboardRow.appendChild(tile);
    }
  }
}

function isLetter(input) {
  return input.length === 1 && /[a-z]/i.test(input);
}

const handleKeyDown = (e) => {
  if (isLetter(e.key)) {
    addLetter(e.key);
  } else if (e.key === `Backspace`) {
    removeLetter();
  } else if (e.key === "Enter") {
    submitGuess();
  }
};

function unlockInput() {
  document.addEventListener("keydown", handleKeyDown);
}

function lockInput() {
  document.removeEventListener("keydown", handleKeyDown);
}

function addLetter(letter) {
  if (
    gameState.currentPosition < config.wordLength &&
    gameState.currentAttempt < config.maxAttempts
  ) {
    const cell = document.getElementById(
      `cell-r${gameState.currentAttempt},c${gameState.currentPosition}`,
    );
    cell.textContent = letter;
    gameState.currentPosition++;
  }
}

function removeLetter() {
  if (gameState.currentPosition > 0) {
    gameState.currentPosition--;
    const cell = document.getElementById(
      `cell-r${gameState.currentAttempt},c${gameState.currentPosition}`,
    );
    cell.textContent = "";
  }
}

const tileRevealDelay = 300;

async function submitGuess() {
  if (gameState.currentPosition < config.wordLength) {
    resultsParagraph.textContent = "incomplete word.";
    return;
  }
  const rowTiles = document.querySelectorAll(
    `[data-row="${gameState.currentAttempt}"]`,
  );
  const userGuess = Array.from(rowTiles)
    .map((tile) => {
      return tile.textContent;
    })
    .join("");

  const results = await checkGuess(userGuess);
  if (!results) {
    if (resultsParagraph.textContent === "") {
      resultsParagraph.textContent = "not a word";
      return;
    }
    if (resultsParagraph.textContent.includes("STOP IT")) {
      resultsParagraph.textContent = "STOP IT";
      return;
    }
    if (resultsParagraph.textContent.length < 1000) {
      resultsParagraph.textContent += " not a word";
    } else {
      resultsParagraph.textContent = "STOP IT";
      setTimeout(() => {
        resultsParagraph.textContent = "";
      }, 5000);
    }
    return;
  }

  revealAttemptResults(results);
  resultsParagraph.textContent = "";

  const isWon = results.every((result) => result === "correct");
  if (isWon) {
    lockInput();
    setTimeout(() => {
      resultsParagraph.textContent = getWinMessage();
    }, config.wordLength * tileRevealDelay);
    return;
  }

  const isLoss = gameState.currentAttempt >= config.maxAttempts - 1;
  if (isLoss) {
    lockInput();
    setTimeout(() => {
      resultsParagraph.textContent = `you lose! LOSER. The word was ${gameState.targetWord}`;
    }, config.wordLength * tileRevealDelay);
    return;
  }

  gameState.currentAttempt++;
  gameState.currentPosition = 0;
}

function revealAttemptResults(results) {
  const rowToReveal = gameState.currentAttempt;
  results.forEach((result, col) => {
    const cell = document.getElementById(`cell-r${rowToReveal},c${col}`);
    setTimeout(() => {
      cell.classList.add(result);
      changeLetterColors(cell, result);
    }, col * tileRevealDelay);
  });
}

function changeLetterColors(cell, resultClass) {
  const letter = cell.textContent.toLowerCase();
  const key = document.getElementById(`key-${letter}`);
  if (resultClass === "correct" || key.classList.contains("correct-keyboard")) {
    key.classList.remove("incorrect-keyboard");
    key.classList.remove("misplaced-keyboard");
    key.classList.add("correct-keyboard");
  } else if (
    resultClass === "misplaced" ||
    key.classList.contains("correct-keyboard")
  ) {
    key.classList.remove("incorrect-keyboard");
    key.classList.add("misplaced-keyboard");
  } else {
    key.classList.add("incorrect-keyboard");
  }
}

function setGame() {
  setUpGrid();
  setUpKeyboard();
  unlockInput();
}

export async function resetGame() {
  lockInput();
  await resetGameState();
  setGame();
}

(function init() {
  setGame();
})();
