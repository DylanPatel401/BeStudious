/**
* Generates a random 4-digit PIN.
* @returns {number} The generated PIN.
*/
export const create4DigitPin = () => {
  let randomNumber = Math.floor(Math.random() * 10000); // 10000 is non inclusive
  if (randomNumber < 1000) {
    randomNumber += 1000; //ensures random number has 4 digits
  }
  return randomNumber;
}