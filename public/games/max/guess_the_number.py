import random


def guess_the_number():
    number_to_guess = random.randint(1, 100)
    number_of_guesses = 0
    guessed = False

    print("Welcome to Guess the Number!")

    while not guessed:
        guess = int(input("Enter your guess (between 1 and 100): "))
        number_of_guesses += 1

        if guess < number_to_guess:
            print("Too low!")
        elif guess > number_to_guess:
            print("Too high!")
        else:
            guessed = True
            print(f"Congratulations! You've guessed the number {number_to_guess} in {number_of_guesses} guesses!")


if __name__ == "__main__":
    guess_the_number()
