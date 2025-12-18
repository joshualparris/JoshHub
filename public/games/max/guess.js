export function createGuess(write, setStatus, onEnd) {
  let target = Math.floor(Math.random() * 100) + 1;
  let guesses = 0;
  setStatus("Guess a number between 1 and 100.");
  write("Welcome to Guess the Number! Type a number and press Enter.");

  function handleCommand(cmd) {
    const n = Number(cmd);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      write("Enter an integer between 1 and 100.");
      return;
    }
    guesses += 1;
    if (n < target) {
      write("Too low!");
    } else if (n > target) {
      write("Too high!");
    } else {
      write(`Congratulations! You guessed ${target} in ${guesses} guesses!`);
      setStatus("Game over. Click a mode to play again.");
      onEnd();
    }
  }

  return { handleCommand };
}
