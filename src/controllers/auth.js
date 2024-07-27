const { createUser, signInUser } = require("./../services/auth.js");
const { generateToken, verifyToken } = require("./../services/token.js");
const createHttpError = require("http-errors");
const User = require("./../models/user.js");
const { sendEmail } = require("./../utils/sendEmail.js");
const PasswordResetCode = require("./../models/PasswordResetCode.js");
const bcryptjs = require("bcryptjs");
const { isPasswordFalse } = require("../utils/validation.js");
const { getRandomSixDigit, generatePassword } = require("./../utils/auth.js");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");

dotenv.config();

const {
  ADMIN_EMAIL,
  FRONT_END_TESTING_DOMAIN,
  FRONT_END_PRODUCTION_DOMAIN
} = process.env;

const signup = async (req, res, next) => {
  try {
    const { name, email, password, picture } = req.body;
    console.log("req.body", { name, email, password, picture });
    const newUser = await createUser({
      name,
      email,
      password,
      picture
    });
    console.log("newUser", newUser);

    const accessToken = await generateToken(
      {
        userId: newUser._id.toString(),
        email: newUser.email
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log("accessToken", accessToken);

    const refreshToken = await generateToken(
      {
        userId: newUser._id.toString(),
        email: newUser.email
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    await sendEmail({
      code: null,
      to: newUser.email,
      subject: "Trackr Sign up",
      name: newUser.name.split(" ")[0],
      type: "sign up"
    });

    console.log("email sent");

    res.status(201).json({
      message: "sign up successful",
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        picture: newUser.picture
      }
    });

    console.log("json sent");
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await signInUser({ email, password });
    const accessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    res.status(201).json({
      message: "login successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createHttpError.Unauthorized("Not authorized.");
    }
    const payload = await verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(payload.userId);
    if (!user) throw createHttpError.Unauthorized("User not authorized.");

    const accessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).json({
      message: "success",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const sendResetPasswordEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError.BadRequest("Email not provided.");
    }

    // Create a new Date object
    let currentDate = new Date();

    // Set the date to two hours from now
    currentDate.setHours(currentDate.getHours() + 2);

    const user = await User.findOne({ email: email });

    if (!user) {
      throw createHttpError.BadRequest("User does not exist.");
    }

    const randomCode = getRandomSixDigit();
    const code = await PasswordResetCode.create({
      userId: user._id,
      code: randomCode,
      expiresAt: currentDate
    });

    await sendEmail({
      code: code.code,
      to: user.email,
      subject: "Trackr Reset Password",
      name: user.name.split(" ")[0],
      type: "reset password"
    });
    res.status(200).json({ message: "Password reset email sent successfuly" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const validateResetCode = async (req, res, next) => {
  try {
    const { code, email } = req.body;
    if (!email) {
      throw createHttpError.BadRequest("Email not provided.");
    }

    if (!code) {
      throw createHttpError.BadRequest("Reset code not provided.");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      throw createHttpError.BadRequest("Email does not exist.");
    }

    const resetCode = await PasswordResetCode.findOne({ userId: user._id });
    if (!resetCode) {
      throw createHttpError.BadRequest(
        "Reset code no longer valid. Generate new one."
      );
    }

    console.log("resetCode", resetCode);
    if (resetCode.code !== code) {
      throw createHttpError.BadRequest("Invalid reset code");
    }

    res.status(200).json({ message: "Reset code valid" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetPassword, email } = req.body;

    if (!resetPassword) {
      throw createHttpError.BadRequest("Password not provided.");
    }

    if (!email) {
      throw createHttpError.BadRequest("Email not provided.");
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      throw createHttpError.BadRequest("No user has the email provided.");
    }

    if (isPasswordFalse(resetPassword)) {
      throw createHttpError.BadRequest(
        "password must be atleast 8 characters and contain atleast an uppercase, a lowercase, a number or a special character"
      );
    }
    const passwordMatches = await bcryptjs.compare(
      resetPassword,
      user.password
    );

    if (passwordMatches) {
      throw createHttpError.BadRequest(
        "New password cannot be same as old password."
      );
    }

    const hashedPassword = await bcryptjs.hash(resetPassword, 12);

    user.password = hashedPassword;
    const existingUser = await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const googleSignIn = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw createHttpError.BadRequest("Token not provided.");
    }
    const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    let user = await User.findOne({ email: email });
    if (!user) {
      user = await createUser({
        name,
        picture,
        email,
        password: generatePassword()
      });
    }

    const accessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    res.status(201).json({
      message: "login successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  sendResetPasswordEmail,
  validateResetCode,
  resetPassword,
  googleSignIn
};
