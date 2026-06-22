import { config, gameState, checkGuess } from "./game.js";
console.log(gameState.targetWord);

const grid = document.getElementById("game-grid");

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

document.addEventListener("keydown", handleKeyDown);

document.getElementById("button-settings").addEventListener("click", () => {
  alert("sorry, no settings yet");
});

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
    alert("incomplete word");
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
    alert("not a word");
    return;
  }

  revealAttemptResults(results);

  const isWon = results.every((result) => result === "correct");
  if (isWon) {
    lockInput();
    setTimeout(() => {
      alert("you win!");
    }, config.wordLength * tileRevealDelay);
    return;
  }

  const isLoss = gameState.currentAttempt >= config.maxAttempts - 1;
  if (isLoss) {
    lockInput();
    setTimeout(() => {
      alert(`you lose! LOSER. The word was ${gameState.targetWord}`);
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
    }, col * tileRevealDelay);
  });
}

function lockInput() {
  document.removeEventListener("keydown", handleKeyDown);
}

(function init() {
  setUpGrid();
  setUpKeyboard();
})();
