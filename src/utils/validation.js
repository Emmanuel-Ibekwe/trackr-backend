function isPasswordFalse(password) {
  // Regular expression to check the password criteria
  //   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&._+-]{8,}$/;
  const regex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

  // Test the password against the regex
  return regex.test(password);
}

module.exports = {
  isPasswordFalse
};
