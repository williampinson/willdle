import { config } from "./game.js";
import { resetGame } from "./main.js";
import { setConfig } from "./storage.js";

const btnSettings = document.getElementById("button-settings");
const dialogSettings = document.getElementById("settings-dialog");
const btnCloseSettings = document.getElementById("settings-close");
const formSettings = document.getElementById("settings-form");

const checkboxHardWordsMode = document.getElementById(
  "checkbox-hard-words-mode",
);

const btnDefault = document.getElementById("btn-settings-default");

const sliderWordLength = document.getElementById("slider-word-length");
const sliderMaxAttempts = document.getElementById("slider-max-attempts");

const lblSliderWordLengthValue = document.getElementById(
  "lbl-slider-word-length-value",
);
const lblSliderMaxAttemptsValue = document.getElementById(
  "lbl-slider-max-attempts-value",
);

const gameGrid = document.getElementById("game-grid");
const keyboard = document.getElementById("keyboard");

let prevWordLengthValue = config.wordLength;
let prevMaxAttemptsValue = config.maxAttempts;

btnSettings.addEventListener("click", () => {
  init();
  dialogSettings.style.display = "flex";
});

btnCloseSettings.addEventListener("click", () => {
  dialogSettings.style.display = "none";
});

sliderWordLength.addEventListener("input", () => {
  setSliderLabelValue(sliderWordLength);
});

sliderMaxAttempts.addEventListener("input", () => {
  setSliderLabelValue(sliderMaxAttempts);
});

formSettings.addEventListener("submit", (e) => {
  e.preventDefault();
  config.wordLength = +sliderWordLength.value;
  config.maxAttempts = +sliderMaxAttempts.value;
  config.hardWordsMode = checkboxHardWordsMode.checked;
  setConfig();
  resetGame();
  dialogSettings.style.display = "none";
  console.log("settings saved!");
});

btnDefault.addEventListener("click", () => {
  setSliderValue(sliderWordLength, 5);
  setSliderLabelValue(sliderWordLength);
  setSliderValue(sliderMaxAttempts, 6);
  setSliderLabelValue(sliderMaxAttempts);
});

function setSliderLabelValue(slider) {
  switch (slider) {
    case sliderWordLength: {
      lblSliderWordLengthValue.textContent = slider.value;
      break;
    }
    case sliderMaxAttempts: {
      lblSliderMaxAttemptsValue.textContent = slider.value;
      break;
    }
  }
}

function setSliderValue(slider, value) {
  slider.value = value;
}

function init() {
  setSliderValue(sliderWordLength, config.wordLength);
  setSliderLabelValue(sliderWordLength);
  setSliderValue(sliderMaxAttempts, config.maxAttempts);
  setSliderLabelValue(sliderMaxAttempts);
  // checkboxHardWordsMode.checked = config.hardWordsMode;
}
