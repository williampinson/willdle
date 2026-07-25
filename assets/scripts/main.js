import {
  config,
  gameState,
  checkGuess,
  resetGameState,
  stats,
  updateConfig,
  updateStats,
  setTargetWord,
} from "./game.js";
import { getConfig, setStats } from "./storage.js";

//#region Variables
const btnResetGame = document.getElementById("button-reset");

const grid = document.getElementById("game-grid");
const resultsParagraph = document.getElementById("results-message");
const winMessages = [
  "you win!",
  "you win 👍",
  "winner. 👍",
  "¡uᴉʍ no⅄",
  "you win",
  "WINNER",
  "you win : )",
  "winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner winner ",
];

const keyboard = document.getElementById("keyboard");
const keyboardKeys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

//#endregion

//#region Setup

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

//#endregion

//#region Input

function handleKeyDown(e) {
  e.preventDefault();
  if (isLetter(e.key)) {
    addLetter(e.key);
  } else if (e.key === `Backspace`) {
    removeLetter();
  } else if (e.key === "Enter") {
    submitGuess();
  }
}

function isLetter(input) {
  return input.length === 1 && /[a-z]/i.test(input);
}

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
//#endregion

//#region Submission

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
    if (resultsParagraph.textContent.length < 480) {
      resultsParagraph.textContent += " not a word";
    } else {
      resultsParagraph.textContent = "";
    }
    return;
  }

  revealAttemptResults(results);
  resultsParagraph.textContent = "";

  const isWon = results.every((result) => result === "correct");
  if (isWon) {
    onGameEnd(true);
    return;
  }

  const isLoss = gameState.currentAttempt >= config.maxAttempts - 1;
  if (isLoss) {
    onGameEnd(false);
    return;
  }

  gameState.currentAttempt++;
  gameState.currentPosition = 0;
}

//#endregion

//#region Stats
const btnStats = document.getElementById("button-stats");
const btnStatsClose = document.getElementById("stats-close");
const statsDialog = document.getElementById("stats-dialog");
const statsTable = document.getElementById("stats-table");

btnStats.addEventListener("click", () => {
  statsDialog.style.display = "flex";
});

btnStatsClose.addEventListener("click", () => {
  statsDialog.style.display = "none";
});

function initStatsView() {
  updateStats();
  statsTable.innerHTML = "";
  for (let stat in stats) {
    // Variables
    const newRow = document.createElement("tr");
    const key = document.createElement("td");
    const value = document.createElement("td");

    // Key
    key.textContent = stat;

    // Value
    value.classList = "text-right";
    value.id = `stat-${stat.toLowerCase().replaceAll(" ", "-")}`;
    if (stat === "Win Percent") {
      value.textContent = stats[stat] + "%";
    } else {
      value.textContent = stats[stat];
    }

    // Add to Stats Table
    newRow.append(key, value);
    statsTable.append(newRow);
  }
}

function setNewStats(isWin) {
  stats["Games Played"]++;
  if (isWin) stats["Games Won"]++;
  stats["Win Percent"] = Math.floor(
    (stats["Games Won"] / stats["Games Played"]) * 100,
  );
  if (isWin) {
    stats["Win Streak"]++;
    stats["Best Streak"] = stats["Win Streak"];
  } else {
    stats["Win Streak"] = 0;
  }
  setStats();
}

//#endregion

//#region Game Logic

function getWinMessage() {
  return winMessages[Math.floor(Math.random() * winMessages.length)];
}

function getLossMessage() {
  return `you lose! LOSER. The word was ${gameState.targetWord}`;
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
    key.classList.contains("misplaced-keyboard")
  ) {
    key.classList.remove("incorrect-keyboard");
    key.classList.add("misplaced-keyboard");
  } else {
    key.classList.add("incorrect-keyboard");
  }
}

//#endregion

//#region Game States

function onGameEnd(isWin) {
  lockInput();
  setTimeout(() => {
    resultsParagraph.textContent = isWin ? getWinMessage() : getLossMessage();
  }, config.wordLength * tileRevealDelay);
  setNewStats(isWin);
  updateStats();
  initStatsView();
  console.log(stats);
}

function setGame() {
  updateConfig();
  setTargetWord();
  setUpGrid();
  setUpKeyboard();
  unlockInput();
}

export async function resetGame() {
  resultsParagraph.textContent = "";
  lockInput();
  await resetGameState();
  setGame();
}

//#endregion

(function init() {
  setGame();
  initStatsView();
  btnResetGame.addEventListener("click", () => {
    resetGame();
  });
})();
