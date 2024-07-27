function getRandomSixDigit() {
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

function generatePassword() {
  const length = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // Random length between 8 and 12
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  const allChars = upperCase + lowerCase + numbers + specialChars;

  function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
  }

  // Ensure at least one character from each set
  let password = [
    getRandomChar(upperCase),
    getRandomChar(lowerCase),
    getRandomChar(numbers),
    getRandomChar(specialChars)
  ];

  // Fill the remaining length of the password
  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password array to ensure randomness
  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}

module.exports = {
  getRandomSixDigit,
  generatePassword
};
