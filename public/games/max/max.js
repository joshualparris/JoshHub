import { createStarhaven } from "./starhaven.js";
import { createGuess } from "./guess.js";

const outputEl = document.getElementById("output");
const commandEl = document.getElementById("command");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submit");

let currentGame = null;

function clearOutput() {
  outputEl.textContent = "";
}

function write(text) {
  outputEl.textContent += (outputEl.textContent ? "\n" : "") + text;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function attachGame(gameFactory) {
  clearOutput();
  const game = gameFactory(write, setStatus, () => {
    commandEl.disabled = true;
    submitBtn.disabled = true;
  });
  currentGame = game;
  commandEl.disabled = false;
  submitBtn.disabled = false;
  commandEl.value = "";
  commandEl.focus();
}

document.getElementById("play-starhaven").addEventListener("click", () => {
  attachGame(createStarhaven);
});

document.getElementById("play-guess").addEventListener("click", () => {
  attachGame(createGuess);
});

function handleCommand() {
  if (!currentGame) return;
  const cmd = commandEl.value.trim();
  if (!cmd) return;
  commandEl.value = "";
  currentGame.handleCommand(cmd);
}

submitBtn.addEventListener("click", handleCommand);
commandEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCommand();
});

// start with Starhaven by default
attachGame(createStarhaven);
