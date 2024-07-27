const createHttpError = require("http-errors");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const User = require("../models/user.js");
const validation = require("./../utils/validation.js");
const { isPasswordFalse } = validation;

const createUser = async userData => {
  const { name, email, password, picture } = userData;
  // console.log("userData", userData);
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields");
  }

  // console.log("name", name);
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("email is invalid");
  }

  const checkEmail = await User.findOne({ email: email });

  if (checkEmail) {
    throw createHttpError.Conflict("email already exists. Try a new email.");
  }

  if (isPasswordFalse(password)) {
    throw createHttpError.BadRequest(
      "password must be atleast 8 characters and contain atleast an uppercase, a lowercase, a number or a special character"
    );
  }

  const hashedPassword = await bcryptjs.hash(password, 12);
  // console.log("hashedPassword", hashedPassword);
  const user = await new User({
    name,
    email,
    password: hashedPassword,
    picture: picture || DEFAULT_PICTURE_URL
  });
  console.log("second to last line in createUser");
  return user.save();
};

const signInUser = async userData => {
  const { email, password } = userData;

  if (!email || !password) {
    throw createHttpError.BadRequest("Please fill all fields");
  }

  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("invalid email");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).lean();

  if (!user) {
    throw createHttpError.Unauthorized(
      "User with this email could not be found."
    );
  }

  const passwordMatches = await bcryptjs.compare(password, user.password);

  if (!passwordMatches) {
    throw createHttpError.Unauthorized("wrong password.");
  }

  return user;
};

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );

  //console.log('response',response);
  const data = await response.json();
  // console.log("data", data);
  return data;
}

module.exports = {
  createUser,
  signInUser,
  getUserData
};
