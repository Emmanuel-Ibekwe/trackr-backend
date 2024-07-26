const createHttpError = require("http-errors");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const User = require("../models/user.js");
const validation = require("./../utils/validation.js");
const { isPasswordFalse } = validation;

const DEFAULT_PICTURE_URL =
  "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png";

const createUser = async userData => {
  const { name, email, password, picture } = userData;
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields");
  }

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

  const user = await new User({
    name,
    email,
    password: hashedPassword,
    picture: picture || DEFAULT_PICTURE_URL
  });

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

module.exports = {
  createUser,
  signInUser
};
